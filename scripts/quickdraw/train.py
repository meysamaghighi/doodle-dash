"""Train the Quick Draw CNN on the curated, cached categories.

Usage:
  qdvenv/bin/python train.py [--epochs N] [--batch-size N]

Loads every cached data/npy/<category>.npy file (written by download_data.py),
builds a stratified train/val split, trains on MPS if available, and reports real
top-1 / top-5 accuracy on the held-out validation set. Saves the trained checkpoint
to data/checkpoint.pt for export_model.py to pick up.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

from categories import validate_categories
from model import QuickDrawCNN

DATA_DIR = Path(__file__).parent / "data" / "npy"
CHECKPOINT_PATH = Path(__file__).parent / "data" / "checkpoint.pt"
VAL_FRACTION = 0.1
SEED = 1234


def load_dataset(categories: list[str]) -> tuple[np.ndarray, np.ndarray]:
    """Returns (images uint8 [N,28,28], labels int64 [N]) across all categories."""
    all_images = []
    all_labels = []
    for idx, cat in enumerate(categories):
        path = DATA_DIR / f"{cat.replace(' ', '_')}.npy"
        if not path.exists():
            raise SystemExit(f"Missing cached data for '{cat}' -- run download_data.py first")
        arr = np.load(path).reshape(-1, 28, 28)
        all_images.append(arr)
        all_labels.append(np.full(arr.shape[0], idx, dtype=np.int64))
    images = np.concatenate(all_images, axis=0)
    labels = np.concatenate(all_labels, axis=0)
    return images, labels


def stratified_split(labels: np.ndarray, val_fraction: float, seed: int):
    rng = np.random.default_rng(seed)
    train_idx = []
    val_idx = []
    for c in np.unique(labels):
        idx = np.where(labels == c)[0]
        rng.shuffle(idx)
        n_val = max(1, int(len(idx) * val_fraction))
        val_idx.append(idx[:n_val])
        train_idx.append(idx[n_val:])
    return np.concatenate(train_idx), np.concatenate(val_idx)


class QuickDrawDataset(Dataset):
    """Bitmaps normalised to [0,1]; light translate jitter to make the model robust
    to imperfect centring from the hand-written TS rasteriser (the real deployment
    input), not just Google's reference preprocessing."""

    def __init__(self, images: np.ndarray, labels: np.ndarray, augment: bool):
        self.images = images
        self.labels = labels
        self.augment = augment

    def __len__(self) -> int:
        return len(self.labels)

    def __getitem__(self, i: int):
        img = self.images[i].astype(np.float32) / 255.0
        if self.augment:
            dx = np.random.randint(-2, 3)
            dy = np.random.randint(-2, 3)
            if dx or dy:
                img = np.roll(img, shift=(dy, dx), axis=(0, 1))
                if dy > 0:
                    img[:dy, :] = 0
                elif dy < 0:
                    img[dy:, :] = 0
                if dx > 0:
                    img[:, :dx] = 0
                elif dx < 0:
                    img[:, dx:] = 0
        return torch.from_numpy(img).unsqueeze(0), self.labels[i]


def evaluate(model: nn.Module, loader: DataLoader, device: torch.device) -> tuple[float, float]:
    model.eval()
    correct1 = 0
    correct5 = 0
    total = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            top5 = logits.topk(5, dim=1).indices
            correct1 += (top5[:, 0] == y).sum().item()
            correct5 += (top5 == y.unsqueeze(1)).any(dim=1).sum().item()
            total += y.size(0)
    return correct1 / total, correct5 / total


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()

    categories = validate_categories()
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"device: {device}, categories: {len(categories)}")

    t0 = time.time()
    images, labels = load_dataset(categories)
    print(f"loaded {images.shape[0]} images in {time.time()-t0:.1f}s")

    train_idx, val_idx = stratified_split(labels, VAL_FRACTION, SEED)
    train_ds = QuickDrawDataset(images[train_idx], labels[train_idx], augment=True)
    val_ds = QuickDrawDataset(images[val_idx], labels[val_idx], augment=False)
    print(f"train: {len(train_ds)}  val: {len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0)

    model = QuickDrawCNN(len(categories)).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(1, args.epochs + 1):
        model.train()
        t_epoch = time.time()
        running_loss = 0.0
        n_batches = 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            n_batches += 1
        val_top1, val_top5 = evaluate(model, val_loader, device)
        print(
            f"epoch {epoch}/{args.epochs}  loss={running_loss/n_batches:.4f}  "
            f"val_top1={val_top1:.4f}  val_top5={val_top5:.4f}  "
            f"({time.time()-t_epoch:.1f}s)"
        )

    final_top1, final_top5 = evaluate(model, val_loader, device)
    print(f"FINAL  val_top1={final_top1:.4f}  val_top5={final_top5:.4f}")

    CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "state_dict": model.state_dict(),
            "categories": categories,
            "val_top1": final_top1,
            "val_top5": final_top5,
        },
        CHECKPOINT_PATH,
    )
    print(f"saved checkpoint to {CHECKPOINT_PATH}")


if __name__ == "__main__":
    main()
