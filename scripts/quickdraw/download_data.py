"""Download numpy_bitmap samples for the curated Quick Draw categories.

Each category's full .npy file on GCS can be 50-300MB (100k-300k drawings). We only
need ~12000 samples per category, and GCS supports HTTP Range requests, so instead of
downloading the whole file we:
  1. Range-request just enough bytes to parse the .npy header (shape, dtype).
  2. Range-request only the first N * row_bytes bytes of the actual array data.
This caps total download to roughly 100 categories * 12000 * 784 bytes (~940MB) instead
of many GB.

Downloads are cached under scripts/quickdraw/data/npy/ (gitignored) -- re-running this
script skips categories already fully cached.
"""

from __future__ import annotations

import io
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

from categories import validate_categories

BASE_URL = "https://storage.googleapis.com/quickdraw_dataset/full/numpy_bitmap/"
DATA_DIR = Path(__file__).parent / "data" / "npy"
SAMPLES_PER_CATEGORY = 12000
ROW_DIM = 28 * 28  # numpy_bitmap rows are flattened 28x28 uint8 grayscale


def _category_url(category: str) -> str:
    return BASE_URL + urllib.parse.quote(category) + ".npy"


def _http_range_get(url: str, start: int, end_inclusive: int | None) -> bytes:
    headers = {"Range": f"bytes={start}-{'' if end_inclusive is None else end_inclusive}"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def _parse_npy_header(head_bytes: bytes) -> tuple[int, np.dtype, tuple[int, ...]]:
    """Parse a .npy header from the first chunk of bytes. Returns (data_offset, dtype, shape)."""
    fp = io.BytesIO(head_bytes)
    version = np.lib.format.read_magic(fp)
    shape, fortran_order, dtype = np.lib.format._read_array_header(fp, version)
    if fortran_order:
        raise ValueError("Unexpected fortran-ordered array in quickdraw npy file")
    data_offset = fp.tell()
    return data_offset, dtype, shape


def download_category(category: str, samples: int = SAMPLES_PER_CATEGORY) -> Path:
    out_path = DATA_DIR / f"{category.replace(' ', '_')}.npy"
    if out_path.exists():
        arr = np.load(out_path, mmap_mode="r")
        if arr.shape[0] >= samples:
            return out_path

    url = _category_url(category)

    # 8KB is comfortably more than any .npy v1/v2 header needs.
    head = _http_range_get(url, 0, 8191)
    data_offset, dtype, shape = _parse_npy_header(head)
    total_rows, n_cols = shape
    if n_cols != ROW_DIM:
        raise ValueError(f"{category}: expected {ROW_DIM} cols, got {n_cols}")

    n_take = min(samples, total_rows)
    row_bytes = n_cols * dtype.itemsize
    end = data_offset + n_take * row_bytes - 1

    # The header fetch above already contains the first bytes of data (if the file is
    # small) -- but simplest and robust is to just re-fetch data bytes explicitly.
    data_bytes = _http_range_get(url, data_offset, end)
    arr = np.frombuffer(data_bytes, dtype=dtype).reshape(n_take, n_cols)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    np.save(out_path, arr)
    return out_path


def main() -> None:
    categories = validate_categories()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    total = len(categories)
    for i, cat in enumerate(categories, 1):
        try:
            path = download_category(cat)
            arr = np.load(path, mmap_mode="r")
            print(f"[{i}/{total}] {cat}: {arr.shape[0]} samples cached at {path.name}")
        except Exception as e:  # noqa: BLE001 -- report and keep going
            print(f"[{i}/{total}] {cat}: FAILED -- {e}", file=sys.stderr)
            raise


if __name__ == "__main__":
    main()
