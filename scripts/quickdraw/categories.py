"""Curated, kid-appropriate Quick Draw category allowlist for Robot Draw / the Art Box.

The full Quick Draw dataset has 345 categories, including ones unsuitable for a kids'
site (wine bottle, wine glass, rifle, sword, cannon, knife, syringe, cigarette-adjacent
items, jail, skull, etc). This module hand-curates ~100 categories that are fun,
recognisable, and appropriate for children, then validates every single name against
Google's official category list at import/run time -- never assume a name exists.
"""

import sys
import urllib.request
from pathlib import Path

OFFICIAL_CATEGORIES_URL = (
    "https://raw.githubusercontent.com/googlecreativelab/"
    "quickdraw-dataset/master/categories.txt"
)

# Cached copy so repeated runs (download, train, export) don't all hit the network.
_CACHE_PATH = Path(__file__).parent / "data" / "categories_official.txt"

# Curated allowlist -- 100 categories, grouped for readability. Every name below is
# checked verbatim (exact string match, case-sensitive) against the official list by
# validate_categories(). Do not add a name without confirming it exists there first.
ANIMALS = [
    "ant", "bear", "bee", "bird", "butterfly", "camel", "cat", "cow", "crab",
    "crocodile", "dog", "dolphin", "dragon", "duck", "elephant", "fish", "flamingo",
    "frog", "giraffe", "hedgehog", "horse", "kangaroo", "lion", "mermaid", "monkey",
    "octopus", "owl", "panda", "parrot", "penguin", "pig", "rabbit", "raccoon",
    "sea turtle", "shark", "sheep", "snail", "snake", "squirrel", "swan", "tiger",
    "whale", "zebra",
]

FOOD = [
    "apple", "banana", "birthday cake", "bread", "broccoli", "cake", "carrot",
    "cookie", "donut", "grapes", "hamburger", "hot dog", "ice cream", "peanut",
    "pineapple", "pizza", "popsicle", "sandwich", "strawberry", "watermelon",
]

VEHICLES = [
    "airplane", "bicycle", "bus", "car", "firetruck", "helicopter",
    "hot air balloon", "motorbike", "sailboat", "school bus", "train", "truck",
]

NATURE_AND_WEATHER = [
    "cactus", "cloud", "flower", "leaf", "lightning", "moon", "mountain", "rain",
    "rainbow", "snowflake", "star", "sun", "tree",
]

EVERYDAY_OBJECTS = [
    "book", "chair", "clock", "crown", "cup", "door", "envelope", "eyeglasses",
    "hat", "house", "key", "umbrella",
]

CATEGORIES = ANIMALS + FOOD + VEHICLES + NATURE_AND_WEATHER + EVERYDAY_OBJECTS


def _fetch_official_categories() -> list[str]:
    if _CACHE_PATH.exists():
        text = _CACHE_PATH.read_text()
    else:
        with urllib.request.urlopen(OFFICIAL_CATEGORIES_URL, timeout=30) as resp:
            text = resp.read().decode("utf-8")
        _CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _CACHE_PATH.write_text(text)
    return [line.strip() for line in text.splitlines() if line.strip()]


def validate_categories() -> list[str]:
    """Validate CATEGORIES against the official list. Fails loudly on any mismatch."""
    official = set(_fetch_official_categories())

    unknown = [c for c in CATEGORIES if c not in official]
    if unknown:
        raise SystemExit(
            "The following curated category names do NOT appear in the official "
            f"Quick Draw category list ({len(official)} entries) -- fix or remove "
            f"them:\n  " + "\n  ".join(unknown)
        )

    dupes = [c for c in CATEGORIES if CATEGORIES.count(c) > 1]
    if dupes:
        raise SystemExit(f"Duplicate category names in curated list: {sorted(set(dupes))}")

    return CATEGORIES


if __name__ == "__main__":
    cats = validate_categories()
    print(f"OK: {len(cats)} curated categories all validated against the official list.")
    sys.exit(0)
