"""Regenerate app/lib/daily-word.ts from the model's category list.

The two must never drift: a challenge word the model was not trained on is an
unwinnable day, because the robot cannot recognise it however well the child
draws. Run this after changing CATEGORIES, then re-run the drift check.
"""
import math, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from categories import CATEGORIES

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / "app" / "lib" / "daily-word.ts"


def main() -> int:
    cats = list(CATEGORIES)
    n = len(cats)
    stride = next(s for s in range(37, 400) if math.gcd(s, n) == 1)
    rows, row = [], []
    for c in cats:
        row.append(f'"{c}",')
        if len(row) == 6:
            rows.append("  " + " ".join(row))
            row = []
    if row:
        rows.append("  " + " ".join(row))

    src = TARGET.read_text()
    src = re.sub(
        r"export const DAILY_WORDS = \[.*?\] as const;",
        "export const DAILY_WORDS = [\n" + "\n".join(rows) + "\n] as const;",
        src,
        flags=re.S,
    )
    src = re.sub(r"const STRIDE = \d+;", f"const STRIDE = {stride};", src)
    TARGET.write_text(src)
    print(f"synced {n} words into {TARGET.relative_to(ROOT)} (stride {stride})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
