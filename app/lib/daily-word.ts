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

/** Words the robot knows, picked for being fun and drawable by a child. */
export const DAILY_WORDS = [
  "cat", "dog", "house", "tree", "car", "fish", "bird", "flower", "sun", "star",
  "boat", "apple", "butterfly", "elephant", "rocket", "crown", "cake", "hat",
  "moon", "cloud", "umbrella", "guitar", "bicycle", "snowman", "penguin",
  "octopus", "owl", "rainbow", "ice cream", "pizza", "key", "ladder", "mushroom",
  "lion", "frog", "duck", "crab", "whale", "shark", "spider", "snail", "bee",
  "camel", "giraffe", "horse", "monkey", "panda", "rabbit", "sheep", "pig",
  "castle", "bridge", "lighthouse", "windmill", "tent", "train", "bus",
  "airplane", "helicopter", "submarine", "anchor", "sailboat", "kite",
  "balloon", "candle", "clock", "book", "pencil", "scissors", "cup", "shoe",
  "sock", "shirt", "glasses", "backpack", "basket", "broom", "chair", "door",
  "envelope", "eye", "hand", "leaf", "lightning", "mountain", "river",
  "cactus", "carrot", "banana", "strawberry", "donut", "cookie", "lollipop",
  "drums", "piano", "trumpet", "violin", "swan", "dolphin", "dragon", "hedgehog",
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
