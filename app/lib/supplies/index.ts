/**
 * Public API for the Art Box supplies library. A game adopts this by:
 *
 *   import { INKS, drawInkSegment, segmentLength } from "@/app/lib/supplies";
 *
 *   const [ink, setInk] = useState<InkId>("plain");
 *   const progress = useRef(0); // per-stroke cumulative distance
 *
 *   // on pointer-down: progress.current = 0;
 *   // on pointer-move:
 *   progress.current += segmentLength(from, to);
 *   drawInkSegment(ctx, ink, from, to, { color, lineWidth, progress: progress.current });
 *
 * Papers and stamps follow the same shape — see papers.ts / stamps.ts.
 *
 * Nothing in this module knows about unlock state. `unlockStickers` on each
 * definition is catalogue metadata (mirrors the Art Box reward table), not
 * app state — the Art Box owner (app/lib/artbox.ts) decides what a given
 * kid has actually earned and gates the UI accordingly. Every export here
 * is safe to use unconditionally.
 */

export type { InkId, InkDefinition, InkSegmentOptions, Point } from "./inks";
export { INKS, INK_ORDER, drawInkSegment, segmentLength, hueColor } from "./inks";

export type { PaperId, PaperDefinition } from "./papers";
export { PAPERS, PAPER_ORDER, paintPaper } from "./papers";

export type { StampId, StampDefinition, StampOptions } from "./stamps";
export { STAMPS, STAMP_ORDER, drawStamp } from "./stamps";

import { INKS, INK_ORDER, type InkId } from "./inks";
import { PAPERS, PAPER_ORDER, type PaperId } from "./papers";
import { STAMPS, STAMP_ORDER, type StampId } from "./stamps";

export type SupplyKind = "ink" | "paper" | "stamp";

export interface SupplyCatalogEntry {
  kind: SupplyKind;
  id: InkId | PaperId | StampId;
  label: string;
  emoji: string;
  unlockStickers: number;
}

/** Every unlockable supply across inks/papers/stamps, sorted by how many stickers it takes to unlock. Handy for a single "Art Box" rewards list. */
export const SUPPLY_CATALOG: SupplyCatalogEntry[] = [
  ...INK_ORDER.map((id) => ({ kind: "ink" as const, ...INKS[id] })),
  ...PAPER_ORDER.map((id) => ({ kind: "paper" as const, ...PAPERS[id] })),
  ...STAMP_ORDER.map((id) => ({ kind: "stamp" as const, ...STAMPS[id] })),
].sort((a, b) => a.unlockStickers - b.unlockStickers);

/** Whether a supply is unlocked for a kid with `stickerCount` completed daily challenges. */
export function isSupplyUnlocked(entry: Pick<SupplyCatalogEntry, "unlockStickers">, stickerCount: number): boolean {
  return stickerCount >= entry.unlockStickers;
}
