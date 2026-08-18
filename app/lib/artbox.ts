/**
 * The Art Box — reward system for the daily drawing challenge.
 *
 * Pure logic, no React, no browser APIs. Unit-testable in plain node.
 *
 * Design (docs/superpowers/specs/2026-08-18-robot-draw-artbox-design.md):
 * - Progress is measured in TOTAL DAYS COMPLETED, never consecutive. There is
 *   deliberately no streak here — a missed day (school trip, shared tablet,
 *   holiday) costs the kid nothing. Compare app/hooks/useProgress.ts's
 *   pre-existing `streak` field, which is a *different*, older feature
 *   (the /daily page's "N-day streak" copy) that this module does not touch.
 * - One sticker per completed daily challenge, one per calendar day — doing
 *   two dailies on the same day (or replaying) must never double-count.
 * - Unlocks are strictly additive. Everything already in DoodleLab stays
 *   unlocked forever; the Art Box only ever adds tools, never gates existing
 *   ones. `isUnlocked` for anything not in UNLOCKS should be treated as
 *   already-available by callers (this module only tracks the *new* tools).
 */

export type UnlockId =
  | "glow-pen"
  | "rainbow-ink"
  | "stamps"
  | "papers"
  | "symmetry-16-24"
  | "gold-holo-ink"
  | "giant-canvas";

export type UnlockDef = {
  id: UnlockId;
  threshold: number;
  label: string;
};

// Exact thresholds from the spec's unlock table. Order matters for
// `nextUnlock` (ascending threshold) — keep it sorted.
export const UNLOCKS: readonly UnlockDef[] = [
  { id: "glow-pen", threshold: 3, label: "Neon glow pen" },
  { id: "rainbow-ink", threshold: 5, label: "Rainbow ink" },
  { id: "stamps", threshold: 8, label: "Stamps (star, heart, sparkle)" },
  { id: "papers", threshold: 12, label: "Papers (galaxy, graph, kraft, blackboard)" },
  { id: "symmetry-16-24", threshold: 15, label: "16- and 24-fold symmetry" },
  { id: "gold-holo-ink", threshold: 20, label: "Gold and holographic ink" },
  { id: "giant-canvas", threshold: 25, label: "Giant canvas" },
];

export type ArtboxState = {
  /**
   * Set of ISO calendar dates (YYYY-MM-DD) on which a daily challenge was
   * completed, stored as a sorted array (JSON-serialisable; localStorage has
   * no native Set). Membership, not order, is what matters — total days
   * completed is `completedDates.length`.
   */
  completedDates: string[];
};

export function createEmptyArtboxState(): ArtboxState {
  return { completedDates: [] };
}

/** Total days completed. This IS the sticker count — one sticker per day. */
export function stickerCount(state: ArtboxState): number {
  return state.completedDates.length;
}

export function isUnlocked(state: ArtboxState, id: UnlockId): boolean {
  const def = UNLOCKS.find(u => u.id === id);
  if (!def) return false;
  return stickerCount(state) >= def.threshold;
}

/**
 * The next locked unlock and how many more stickers it needs, e.g. for a
 * "2 more until the glow pen" message. Returns null once everything is
 * unlocked.
 */
export function nextUnlock(
  state: ArtboxState
): { id: UnlockId; label: string; threshold: number; remaining: number } | null {
  const count = stickerCount(state);
  for (const def of UNLOCKS) {
    if (count < def.threshold) {
      return { id: def.id, label: def.label, threshold: def.threshold, remaining: def.threshold - count };
    }
  }
  return null;
}

/**
 * Record a completed daily challenge for `dateISO` (defaults handled by the
 * caller — pass a real YYYY-MM-DD, e.g. from `toISOString().slice(0, 10)`).
 *
 * Pure: returns a NEW state plus the list of unlocks that fired as a direct
 * result of this call (empty if the day was already recorded, or if no
 * threshold was crossed). Never mutates the input.
 */
export function completeDaily(
  state: ArtboxState,
  dateISO: string
): { state: ArtboxState; newlyUnlocked: UnlockDef[] } {
  if (state.completedDates.includes(dateISO)) {
    // Already completed today (or a re-submit) — no double count, no new
    // unlocks, and we return the SAME state reference so callers can cheaply
    // check `result.state === state` to skip persisting/re-rendering.
    return { state, newlyUnlocked: [] };
  }

  const before = stickerCount(state);
  const completedDates = [...state.completedDates, dateISO].sort();
  const after = before + 1;

  const newlyUnlocked = UNLOCKS.filter(u => u.threshold > before && u.threshold <= after);

  return { state: { completedDates }, newlyUnlocked };
}
