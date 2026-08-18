/*
 * The daily challenge word.
 *
 * Everyone in the world gets the same word on the same day, so a kid comparing
 * with a friend or a classmate sees the same prompt. The mapping is a pure
 * function of the date — no server, no storage, nothing to get out of sync.
 *
 * Every word here MUST also be a category the model was trained on, otherwise
 * the robot can never recognise the drawing and the challenge is unwinnable.
 * `assertWordsAreRecognisable` enforces that against the shipped manifest.
 */

/**
 * The challenge words ARE the model's categories, in its own index order.
 *
 * This list used to be hand-written and drifted: 34 of its words were never
 * trained on, so a third of days would have been unwinnable — the robot could
 * not have recognised them however well the child drew. Regenerate with
 * scripts/quickdraw/sync_daily_words.py rather than editing by hand.
 */
export const DAILY_WORDS = [
  "ant", "bear", "bee", "bird", "butterfly", "camel",
  "cat", "cow", "crab", "crocodile", "dog", "dolphin",
  "dragon", "duck", "elephant", "fish", "flamingo", "frog",
  "giraffe", "hedgehog", "horse", "kangaroo", "lion", "mermaid",
  "monkey", "octopus", "owl", "panda", "parrot", "penguin",
  "pig", "rabbit", "raccoon", "sea turtle", "shark", "sheep",
  "snail", "snake", "squirrel", "swan", "tiger", "whale",
  "zebra", "apple", "banana", "birthday cake", "bread", "broccoli",
  "cake", "carrot", "cookie", "donut", "grapes", "hamburger",
  "hot dog", "ice cream", "peanut", "pineapple", "pizza", "popsicle",
  "sandwich", "strawberry", "watermelon", "airplane", "bicycle", "bus",
  "car", "firetruck", "helicopter", "hot air balloon", "motorbike", "sailboat",
  "school bus", "train", "truck", "cactus", "cloud", "flower",
  "leaf", "lightning", "moon", "mountain", "rain", "rainbow",
  "snowflake", "star", "sun", "tree", "book", "chair",
  "clock", "crown", "cup", "door", "envelope", "eyeglasses",
  "hat", "house", "key", "umbrella",
] as const;

export type DailyWord = (typeof DAILY_WORDS)[number];

const EPOCH = Date.UTC(2026, 0, 1); // arbitrary but fixed origin
const DAY_MS = 86_400_000;

/** Whole UTC days since the fixed origin. Negative before it, which is fine. */
export function dayIndex(now: Date = new Date()): number {
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcMidnight - EPOCH) / DAY_MS);
}

/**
 * Walking the list in order would make the next word guessable and would group
 * similar words together. Stepping by a value coprime with the list length
 * visits every word exactly once per cycle in a scattered order.
 */
const STRIDE = 37;

export function wordForDay(now: Date = new Date()): DailyWord {
  const n = DAILY_WORDS.length;
  const i = (((dayIndex(now) * STRIDE) % n) + n) % n;
  return DAILY_WORDS[i];
}

/** Stable `YYYY-MM-DD` key in UTC, for recording which days were completed. */
export function dayKey(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/** Milliseconds until the next word, for a "new challenge in 4h" countdown. */
export function msUntilNextWord(now: Date = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

/**
 * Guards against the word list drifting away from what the model can actually
 * recognise. Call once with the model's category list; throws listing the
 * offenders rather than shipping an unwinnable challenge.
 */
export function assertWordsAreRecognisable(modelCategories: readonly string[]): void {
  const known = new Set(modelCategories);
  const missing = DAILY_WORDS.filter(w => !known.has(w));
  if (missing.length) {
    throw new Error(
      `daily-word: ${missing.length} challenge word(s) are not model categories, ` +
        `so the robot could never recognise them: ${missing.join(", ")}`,
    );
  }
}
