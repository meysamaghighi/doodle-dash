/**
 * Vector stamp rewards — star, heart, sparkle — placed at a point with size,
 * rotation and colour. Paths are drawn on a unit grid centred at the origin
 * and scaled by `size`, so they stay crisp (no raster asset) and read as
 * clean, chunky shapes at small sizes rather than fussy detailed icons.
 */

export type StampId = "star" | "heart" | "sparkle";

export interface StampDefinition {
  id: StampId;
  label: string;
  emoji: string;
  /** Stickers needed in the Art Box to unlock stamps. */
  unlockStickers: number;
}

export const STAMPS: Record<StampId, StampDefinition> = {
  star: { id: "star", label: "Star", emoji: "⭐", unlockStickers: 8 },
  heart: { id: "heart", label: "Heart", emoji: "❤️", unlockStickers: 8 },
  sparkle: { id: "sparkle", label: "Sparkle", emoji: "✨", unlockStickers: 8 },
};

export const STAMP_ORDER: StampId[] = ["star", "heart", "sparkle"];

export interface StampOptions {
  x: number;
  y: number;
  /** Full bounding-box size in px. */
  size: number;
  /** Radians. Defaults to 0. */
  rotation?: number;
  color: string;
  /** Outline colour for readability at small sizes. Defaults to a soft dark line. */
  outline?: string;
}

const TAU = Math.PI * 2;

/** Star-polygon path (used for both the star and the sparkle stamps) on the unit grid, alternating outer/inner radius. */
function starPath(ctx: CanvasRenderingContext2D, points: number, outerR: number, innerR: number, rotation: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2 + rotation;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function fillAndOutline(ctx: CanvasRenderingContext2D, color: string, outline: string | undefined, size: number) {
  ctx.fillStyle = color;
  ctx.fill();
  if (outline) {
    ctx.lineWidth = Math.max(1, size * 0.045);
    ctx.strokeStyle = outline;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, opts: Required<StampOptions>) {
  ctx.save();
  ctx.translate(opts.x, opts.y);
  const outerR = opts.size / 2;
  const innerR = outerR * 0.5;
  starPath(ctx, 5, outerR, innerR, opts.rotation);
  fillAndOutline(ctx, opts.color, opts.outline, opts.size);
  ctx.restore();
}

// Heart drawn from four cubic beziers on a local grid, then re-centred so
// (0,0) sits at the shape's visual centroid (the raw formula is anchored at
// the top dip, not the centre) and scaled to `size`.
function drawHeart(ctx: CanvasRenderingContext2D, opts: Required<StampOptions>) {
  ctx.save();
  ctx.translate(opts.x, opts.y);
  ctx.rotate(opts.rotation);

  const w = opts.size;
  const h = opts.size * 0.92;
  const top = -h * 0.42; // dip between the two lobes
  const bottom = h * 0.58;
  const mid = (top + (top + bottom)) / 2;

  ctx.beginPath();
  ctx.moveTo(0, top);
  ctx.bezierCurveTo(0, top - h * 0.36, -w / 2, top - h * 0.36, -w / 2, top);
  ctx.bezierCurveTo(-w / 2, mid, 0, mid, 0, bottom);
  ctx.bezierCurveTo(0, mid, w / 2, mid, w / 2, top);
  ctx.bezierCurveTo(w / 2, top - h * 0.36, 0, top - h * 0.36, 0, top);
  ctx.closePath();

  fillAndOutline(ctx, opts.color, opts.outline, opts.size);
  ctx.restore();
}

// A four-point "twinkle" plus a smaller offset twin — the classic ✨ pairing.
// The elongated 4-point star (deep inner radius) reads as a sparkle rather
// than a star even at small sizes, which is what tells the two stamps apart.
function drawSparkle(ctx: CanvasRenderingContext2D, opts: Required<StampOptions>) {
  ctx.save();
  ctx.translate(opts.x, opts.y);

  const bigR = opts.size / 2;
  ctx.save();
  ctx.rotate(opts.rotation);
  starPath(ctx, 4, bigR, bigR * 0.16, 0);
  fillAndOutline(ctx, opts.color, opts.outline, opts.size);
  ctx.restore();

  const smallR = opts.size * 0.26;
  const offset = opts.size * 0.36;
  ctx.save();
  ctx.translate(offset, -offset * 0.7);
  ctx.rotate(opts.rotation + 0.4);
  starPath(ctx, 4, smallR, smallR * 0.16, 0);
  fillAndOutline(ctx, opts.color, opts.outline, opts.size * 0.6);
  ctx.restore();

  ctx.restore();
}

/** Stamp a star/heart/sparkle at a point. */
export function drawStamp(ctx: CanvasRenderingContext2D, id: StampId, options: StampOptions): void {
  const opts: Required<StampOptions> = {
    rotation: 0,
    outline: "rgba(0, 0, 0, 0.25)",
    ...options,
  };
  switch (id) {
    case "star":
      return drawStar(ctx, opts);
    case "heart":
      return drawHeart(ctx, opts);
    case "sparkle":
      return drawSparkle(ctx, opts);
  }
}
