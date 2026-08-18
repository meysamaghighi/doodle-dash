/**
 * Stroke-rendering styles for the Art Box "ink" rewards.
 *
 * Each ink is a pure function of one line segment: `drawInkSegment` is meant
 * to be called once per pointer-move, exactly where a game already has
 * `ctx.strokeStyle = color; ctx.lineTo(...); ctx.stroke()`. There is no
 * hidden per-stroke state inside this module — a caller that wants the
 * rainbow ramp to progress along the stroke tracks its own cumulative
 * distance and passes it in as `progress`. That keeps this file allocation
 *-free in the hot path (no closures, no gradients rebuilt per segment) and
 * keeps the games in charge of their own pointer-tracking loop, which they
 * all already have.
 */

export type InkId = "plain" | "glow" | "rainbow" | "gold" | "holographic";

export interface InkDefinition {
  id: InkId;
  label: string;
  emoji: string;
  /** Stickers needed in the Art Box to unlock this ink. 0 = always available. */
  unlockStickers: number;
}

export const INKS: Record<InkId, InkDefinition> = {
  plain: { id: "plain", label: "Plain", emoji: "✏️", unlockStickers: 0 },
  glow: { id: "glow", label: "Glow Pen", emoji: "✨", unlockStickers: 3 },
  rainbow: { id: "rainbow", label: "Rainbow", emoji: "🌈", unlockStickers: 5 },
  gold: { id: "gold", label: "Gold", emoji: "🏆", unlockStickers: 20 },
  holographic: { id: "holographic", label: "Holographic", emoji: "💿", unlockStickers: 20 },
};

export const INK_ORDER: InkId[] = ["plain", "glow", "rainbow", "gold", "holographic"];

export interface Point {
  x: number;
  y: number;
}

export interface InkSegmentOptions {
  /** Base colour. Used directly by plain/glow/gold; ignored by rainbow/holographic, which derive their own hue. */
  color: string;
  lineWidth: number;
  /**
   * Cumulative distance (px) travelled along the current stroke so far, as
   * tracked by the caller. Drives the rainbow hue ramp. Omit/0 if you don't
   * track it — rainbow will just always start at the same hue.
   */
  progress?: number;
}

/** Straight-line distance between two points — callers use this to accumulate `progress`. */
export function segmentLength(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function hueColor(hue: number, s: number, l: number, a = 1): string {
  const h = ((hue % 360) + 360) % 360;
  return a >= 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function strokeLine(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  // A zero-length segment — a tap, or the first point of a fresh stroke
  // before any pointer-move has happened — needs a round cap to render as
  // a dot. The butt caps the multi-layer inks use to avoid segment-seam
  // beading (see drawGold's comment) would draw literally nothing for a
  // zero-length "line", which reads as "tapping does nothing" to a kid.
  if (from.x === to.x && from.y === to.y) ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function drawPlain(ctx: CanvasRenderingContext2D, from: Point, to: Point, opts: InkSegmentOptions) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.lineWidth;
  strokeLine(ctx, from, to);
}

// weavesilk-style neon: one blurred halo pass (additive) under one crisp
// near-white core pass. Deliberately only ONE shadowBlur pass — a second
// blurred layer roughly doubles paint cost for very little visible gain,
// and this runs on every pointer-move on a Fire HD 8.
function drawGlow(ctx: CanvasRenderingContext2D, from: Point, to: Point, opts: InkSegmentOptions) {
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = opts.color;
  ctx.shadowBlur = Math.max(6, opts.lineWidth * 2.5);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.lineWidth * 2.2;
  strokeLine(ctx, from, to);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, opts.lineWidth * 0.45);
  strokeLine(ctx, from, to);
  ctx.restore();
}

// Full hue cycle roughly every 260px of travel — fast enough to see the
// rainbow within one short stroke, slow enough not to strobe.
const RAINBOW_HUE_PER_PX = 360 / 260;

function drawRainbow(ctx: CanvasRenderingContext2D, from: Point, to: Point, opts: InkSegmentOptions) {
  const hue = (opts.progress ?? 0) * RAINBOW_HUE_PER_PX;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = hueColor(hue, 90, 58);
  ctx.lineWidth = opts.lineWidth;
  strokeLine(ctx, from, to);
}

// Metallic gold: an opaque bronze base under an additive warm-gold body and
// a thin additive specular line offset to one edge.
//
// lineCap is "butt", not "round" — deliberately, and the fix took two
// tries to find. Every ink here is called once per pointer-move (a game
// can't wait for the whole stroke before painting), so a multi-layer ink
// is really N independent short strokes glued end to end. With ROUND caps,
// a narrower layer drawn on top of a wider one leaves the wider layer's
// round cap peeking out at *every* segment joint on a curved path — a
// visible bead necklace, worse the shorter the segments (i.e. worse the
// faster a kid actually draws). BUTT caps stop exactly at the shared
// joint coordinate instead of protruding past it, so consecutive segments
// of the same width sit flush and the layered silhouette stays smooth.
function drawGold(ctx: CanvasRenderingContext2D, from: Point, to: Point, opts: InkSegmentOptions) {
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "#7a4a10";
  ctx.lineWidth = opts.lineWidth;
  strokeLine(ctx, from, to);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#e8b23d";
  ctx.lineWidth = opts.lineWidth * 0.86;
  strokeLine(ctx, from, to);
  ctx.restore();

  // Specular core, offset perpendicular to the stroke direction so it reads
  // as a highlight running along one edge rather than dead centre.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * opts.lineWidth * 0.2;
  const ny = (dx / len) * opts.lineWidth * 0.2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "#fff6d8";
  ctx.lineWidth = Math.max(1, opts.lineWidth * 0.22);
  strokeLine(ctx, { x: from.x + nx, y: from.y + ny }, { x: to.x + nx, y: to.y + ny });
  ctx.restore();
}

// Holographic: hue tied to canvas position (not travel distance), so
// tilting/moving the pen across the page shifts the colour like foil under
// changing light, plus a hue-shifted, narrower bright fleck line for
// shimmer. Butt caps for the same reason as gold — see the comment on
// drawGold — a narrower overlay with round caps shows as dashes/dots
// instead of a continuous shimmer.
const HOLO_HUE_PER_PX = 0.55;

function drawHolographic(ctx: CanvasRenderingContext2D, from: Point, to: Point, opts: InkSegmentOptions) {
  const hue = (to.x + to.y) * HOLO_HUE_PER_PX;
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  ctx.strokeStyle = hueColor(hue, 85, 55);
  ctx.lineWidth = opts.lineWidth;
  strokeLine(ctx, from, to);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = hueColor(hue + 55, 70, 70);
  ctx.lineWidth = Math.max(1, opts.lineWidth * 0.4);
  strokeLine(ctx, from, to);
  ctx.restore();
}

/** Draw one stroke segment in the given ink style. Call once per pointer-move. */
export function drawInkSegment(
  ctx: CanvasRenderingContext2D,
  ink: InkId,
  from: Point,
  to: Point,
  opts: InkSegmentOptions
): void {
  switch (ink) {
    case "glow":
      return drawGlow(ctx, from, to, opts);
    case "rainbow":
      return drawRainbow(ctx, from, to, opts);
    case "gold":
      return drawGold(ctx, from, to, opts);
    case "holographic":
      return drawHolographic(ctx, from, to, opts);
    case "plain":
    default:
      return drawPlain(ctx, from, to, opts);
  }
}
