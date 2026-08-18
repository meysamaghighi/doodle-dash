"""Export the trained checkpoint to public/models/quickdraw/: a flat float32 weight
blob plus a JSON manifest describing layer shapes/order for the hand-written TS
inference engine in app/lib/quickdraw/.

Also evaluates an int8 per-tensor-quantised version against the float32 val set; if
the top-1 accuracy drop is more than ~2 percentage points, we ship float32 and say so
(correctness beats size -- and the float32 model is already ~250KB, comfortably under
the 2MB target, so there is little pressure to quantise here).
"""

from __future__ import annotations

import json
from pathlib import Path

import torch
from torch.utils.data import DataLoader

from model import QuickDrawCNN
from train import CHECKPOINT_PATH, load_dataset, stratified_split, VAL_FRACTION, SEED, evaluate
from train import QuickDrawDataset

OUT_DIR = Path(__file__).resolve().parents[2] / "public" / "models" / "quickdraw"
WEIGHTS_FILENAME = "weights.bin"
MANIFEST_FILENAME = "manifest.json"

# (layer_name, kind) in forward-pass order. kind is "conv" or "dense".
LAYER_ORDER = [
    ("conv1", "conv", dict(inChannels=1, outChannels=16, kernelSize=3, padding=1, stride=1)),
    ("conv2", "conv", dict(inChannels=16, outChannels=32, kernelSize=3, padding=1, stride=1)),
    ("conv3", "conv", dict(inChannels=32, outChannels=32, kernelSize=3, padding=1, stride=1)),
    ("fc1", "dense", dict(inFeatures=32 * 3 * 3, outFeatures=128)),
    ("fc2", "dense", dict(inFeatures=128, outFeatures=None)),  # outFeatures filled at runtime
]


def build_manifest_and_blob(state_dict: dict, categories: list[str]) -> tuple[dict, bytes]:
    num_classes = len(categories)
    blob = bytearray()
    layers = []

    def append_tensor(name: str) -> tuple[int, int, list[int]]:
        t = state_dict[name].detach().cpu().numpy().astype("<f4")
        offset = len(blob)
        blob.extend(t.tobytes())
        return offset, t.size, list(t.shape)

    for lname, kind, spec in LAYER_ORDER:
        if lname == "fc2":
            spec = dict(spec)
            spec["outFeatures"] = num_classes
        w_off, w_count, w_shape = append_tensor(f"{lname}.weight")
        b_off, b_count, b_shape = append_tensor(f"{lname}.bias")
        layer_entry = {
            "name": lname,
            "type": "conv2d" if kind == "conv" else "dense",
            **spec,
            "weight": {"byteOffset": w_off, "count": w_count, "shape": w_shape},
            "bias": {"byteOffset": b_off, "count": b_count, "shape": b_shape},
        }
        layers.append(layer_entry)
        # relu after every conv/dense except the final fc2 (raw logits)
        if lname != "fc2":
            layers.append({"type": "relu"})
        if kind == "conv":
            layers.append({"type": "maxpool2d", "kernelSize": 2, "stride": 2})
        if lname == "conv3":
            layers.append({"type": "flatten"})

    manifest = {
        "version": 1,
        "dtype": "float32",
        "input": {"height": 28, "width": 28, "channels": 1, "normalization": "pixel/255"},
        "categories": categories,
        "layers": layers,
        "weightsFile": WEIGHTS_FILENAME,
        "totalWeightBytes": len(blob),
    }
    return manifest, bytes(blob)


def quantise_int8_eval(model: QuickDrawCNN, val_loader, device) -> float:
    """Naive per-tensor symmetric int8 quantisation of conv/fc weights only (biases and
    activations stay float32), just to measure the accuracy hit. Not exported unless it
    passes the <=2% top-1 drop bar."""
    import copy

    qmodel = copy.deepcopy(model)
    with torch.no_grad():
        for name, param in qmodel.named_parameters():
            if not name.endswith(".weight"):
                continue
            w = param.data
            scale = w.abs().max() / 127.0
            if scale == 0:
                continue
            q = torch.clamp(torch.round(w / scale), -127, 127)
            param.data.copy_(q * scale)
    top1, _ = evaluate(qmodel, val_loader, device)
    return top1


def main() -> None:
    if not CHECKPOINT_PATH.exists():
        raise SystemExit(f"No checkpoint at {CHECKPOINT_PATH} -- run train.py first")

    ckpt = torch.load(CHECKPOINT_PATH, map_location="cpu", weights_only=False)
    categories = ckpt["categories"]
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

    model = QuickDrawCNN(len(categories))
    model.load_state_dict(ckpt["state_dict"])
    model.to(device)
    model.eval()

    # Rebuild the val loader to measure quantisation impact on the same split used in training.
    images, labels = load_dataset(categories)
    _, val_idx = stratified_split(labels, VAL_FRACTION, SEED)
    val_ds = QuickDrawDataset(images[val_idx], labels[val_idx], augment=False)
    val_loader = DataLoader(val_ds, batch_size=256, shuffle=False)

    fp32_top1 = ckpt.get("val_top1")
    if fp32_top1 is None:
        fp32_top1, _ = evaluate(model, val_loader, device)

    int8_top1 = quantise_int8_eval(model, val_loader, device)
    drop = fp32_top1 - int8_top1
    print(f"float32 val_top1={fp32_top1:.4f}  naive-int8 val_top1={int8_top1:.4f}  drop={drop:.4f}")

    manifest, blob = build_manifest_and_blob(model.state_dict(), categories)
    size_kb = len(blob) / 1024
    print(f"float32 weight blob: {len(blob)} bytes ({size_kb:.1f} KB)")

    if drop > 0.02:
        print(
            f"int8 quantisation drops top-1 by {drop*100:.2f} pct points (> 2% bar) "
            "-- shipping float32."
        )
    else:
        print(
            f"int8 quantisation only drops top-1 by {drop*100:.2f} pct points, but the "
            f"float32 blob is already {size_kb:.1f} KB (well under the 2MB target) -- "
            "shipping float32 for simplicity/correctness; quantised TS dequant path adds "
            "risk with no real size benefit here."
        )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / WEIGHTS_FILENAME).write_bytes(blob)
    (OUT_DIR / MANIFEST_FILENAME).write_text(json.dumps(manifest, indent=2))
    print(f"wrote {OUT_DIR / WEIGHTS_FILENAME} and {OUT_DIR / MANIFEST_FILENAME}")


if __name__ == "__main__":
    main()
