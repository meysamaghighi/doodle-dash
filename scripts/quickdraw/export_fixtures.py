"""Export a handful of real validation bitmaps + their Python forward-pass logits as
fixtures for the required TS/Python parity test (spec item 6).

Crucially, this loads the model from the exported public/models/quickdraw/ weights
(not the raw torch checkpoint), so the fixtures reflect exactly what the TS side will
load -- if we later re-export with different precision, re-run this too.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F

from categories import validate_categories
from train import load_dataset, stratified_split, VAL_FRACTION, SEED

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = REPO_ROOT / "public" / "models" / "quickdraw" / "manifest.json"
WEIGHTS_PATH = REPO_ROOT / "public" / "models" / "quickdraw" / "weights.bin"
OUT_PATH = REPO_ROOT / "app" / "lib" / "quickdraw" / "__fixtures__" / "parity-fixtures.json"

N_CASES = 12


def load_exported_weights() -> dict:
    manifest = json.loads(MANIFEST_PATH.read_text())
    blob = WEIGHTS_PATH.read_bytes()
    weights = np.frombuffer(blob, dtype="<f4")
    tensors = {}
    for layer in manifest["layers"]:
        if layer["type"] not in ("conv2d", "dense"):
            continue
        for key in ("weight", "bias"):
            ref = layer[key]
            arr = weights[ref["byteOffset"] // 4 : ref["byteOffset"] // 4 + ref["count"]]
            tensors[f"{layer['name']}.{key}"] = arr.reshape(ref["shape"]).copy()
    return manifest, tensors


def forward_from_exported_weights(tensors: dict, x: torch.Tensor) -> torch.Tensor:
    """Reimplements the forward pass using ONLY the exported weight tensors (not the
    live torch model), as an extra guard that export_model.py's blob really does
    contain what the manifest claims."""
    def t(name: str) -> torch.Tensor:
        return torch.from_numpy(tensors[name])

    x = F.conv2d(x, t("conv1.weight"), t("conv1.bias"), padding=1)
    x = F.max_pool2d(F.relu(x), 2)
    x = F.conv2d(x, t("conv2.weight"), t("conv2.bias"), padding=1)
    x = F.max_pool2d(F.relu(x), 2)
    x = F.conv2d(x, t("conv3.weight"), t("conv3.bias"), padding=1)
    x = F.max_pool2d(F.relu(x), 2)
    x = torch.flatten(x, 1)
    x = F.relu(F.linear(x, t("fc1.weight"), t("fc1.bias")))
    x = F.linear(x, t("fc2.weight"), t("fc2.bias"))
    return x


def main() -> None:
    if not MANIFEST_PATH.exists() or not WEIGHTS_PATH.exists():
        raise SystemExit("Run export_model.py first -- manifest/weights not found")

    manifest, tensors = load_exported_weights()
    categories = manifest["categories"]
    assert categories == validate_categories(), "manifest categories drifted from categories.py"

    images, labels = load_dataset(categories)
    _, val_idx = stratified_split(labels, VAL_FRACTION, SEED)

    rng = np.random.default_rng(42)
    # Spread picks across distinct categories for a more meaningful smoke test.
    chosen_categories = rng.choice(len(categories), size=N_CASES, replace=False)
    cases = []
    for cls in chosen_categories:
        cls_val_idx = val_idx[labels[val_idx] == cls]
        i = cls_val_idx[0]
        img = images[i].astype(np.float32) / 255.0
        x = torch.from_numpy(img).unsqueeze(0).unsqueeze(0)
        logits = forward_from_exported_weights(tensors, x).squeeze(0).detach().numpy()
        cases.append(
            {
                "category": categories[cls],
                "label": int(cls),
                "input": img.flatten().tolist(),
                "logits": logits.tolist(),
            }
        )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps({"categories": categories, "cases": cases}, indent=None))
    print(f"wrote {len(cases)} fixture cases to {OUT_PATH}")


if __name__ == "__main__":
    main()
