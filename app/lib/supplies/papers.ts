/**
 * Canvas-background "paper" rewards. Each `paint*` fills a ctx sized to
 * (width, height) exactly where a game already does `ctx.fillRect(0, 0, w,
 * h)` on mount/clear — same call site, same signature shape.
 *
 * All textured papers use a seeded PRNG keyed off the canvas size, so the
 * star/speck/dust placement is identical every time that size is painted
 * instead of visibly re-rolling on every Clear press (which reads as a
 * flicker/bug, not a texture).
 */

export type PaperId = "galaxy" | "graph" | "kraft" | "blackboard";

export interface PaperDefinition {
  id: PaperId;
  label: string;
  emoji: string;
  /** Stickers needed in the Art Box to unlock this paper. */
  unlockStickers: number;
}

export const PAPERS: Record<PaperId, PaperDefinition> = {
  galaxy: { id: "galaxy", label: "Galaxy", emoji: "🌌", unlockStickers: 12 },
  graph: { id: "graph", label: "Graph Paper", emoji: "📐", unlockStickers: 12 },
  kraft: { id: "kraft", label: "Kraft Paper", emoji: "📦", unlockStickers: 12 },
  blackboard: { id: "blackboard", label: "Blackboard", emoji: "🖍️", unlockStickers: 12 },
};

export const PAPER_ORDER: PaperId[] = ["galaxy", "graph", "kraft", "blackboard"];

const TAU = Math.PI * 2;

// mulberry32 — tiny, dependency-free deterministic PRNG. Density-based star/
// speck counts (count scales with area, not a fixed number) so the pattern
// still reads right whether the canvas is a phone-width strip or a giant
// canvas unlock.
function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(width: number, height: number, salt: number): number {
  return Math.round(width * 7919 + height * 104729 + salt);
}

function paintGalaxy(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0b0f2e");
  gradient.addColorStop(0.55, "#161b42");
  gradient.addColorStop(1, "#241540");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const rand = mulberry32(seedFor(width, height, 1));
  const starCount = Math.round((width * height) / 1800);
  for (let i = 0; i < starCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = rand() * 1.3 + 0.2;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  // A handful of bigger four-point sparkle stars for depth.
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  const bigCount = Math.max(4, Math.round(starCount / 45));
  for (let i = 0; i < bigCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const s = rand() * 2.5 + 2.5;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function paintGraph(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#f4f7ff";
  ctx.fillRect(0, 0, width, height);

  const step = Math.max(14, Math.round(Math.min(width, height) / 22));

  ctx.strokeStyle = "rgba(90, 120, 220, 0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();

  // Bolder line every 5 cells, like real graph paper.
  const bold = step * 5;
  ctx.strokeStyle = "rgba(70, 100, 200, 0.38)";
  ctx.beginPath();
  for (let x = 0; x <= width; x += bold) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += bold) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}

function paintKraft(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#c9a06a";
  ctx.fillRect(0, 0, width, height);

  const rand = mulberry32(seedFor(width, height, 2));
  const speckCount = Math.round((width * height) / 900);
  for (let i = 0; i < speckCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    ctx.fillStyle = rand() > 0.5 ? "rgba(90, 60, 20, 0.08)" : "rgba(255, 240, 210, 0.10)";
    ctx.beginPath();
    ctx.ellipse(x, y, rand() * 3 + 0.5, rand() * 1.5 + 0.4, rand() * TAU, 0, TAU);
    ctx.fill();
  }

  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(60, 35, 10, 0.25)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function paintBlackboard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#1f322a";
  ctx.fillRect(0, 0, width, height);

  const rand = mulberry32(seedFor(width, height, 3));

  // Broad, very soft eraser smudges first (under the dust) — a handful of
  // wide low-opacity circular patches read as "well-used board" at a
  // glance, which fine dust alone doesn't: dust only shows up on close
  // inspection.
  const smudgeCount = Math.max(3, Math.round(width / 220));
  for (let i = 0; i < smudgeCount; i++) {
    const cx = rand() * width;
    const cy = rand() * height;
    const r = Math.min(width, height) * (0.12 + rand() * 0.14);
    const smudge = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    smudge.addColorStop(0, "rgba(232, 232, 224, 0.10)");
    smudge.addColorStop(1, "rgba(232, 232, 224, 0)");
    ctx.fillStyle = smudge;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
  }

  // Chalk dust speckle, denser and brighter than a first pass so it reads
  // at normal viewing distance, not just when zoomed in.
  const dustCount = Math.round((width * height) / 1300);
  ctx.fillStyle = "#f2f2ea";
  for (let i = 0; i < dustCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    ctx.globalAlpha = rand() * 0.22 + 0.06;
    ctx.beginPath();
    ctx.arc(x, y, rand() * 1.6 + 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Darker vignette toward the edges, like a well-used board.
  const edge = ctx.createLinearGradient(0, 0, 0, height);
  edge.addColorStop(0, "rgba(0, 0, 0, 0.25)");
  edge.addColorStop(0.08, "rgba(0, 0, 0, 0)");
  edge.addColorStop(0.92, "rgba(0, 0, 0, 0)");
  edge.addColorStop(1, "rgba(0, 0, 0, 0.25)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);

  // Wood-tone frame so the edge reads as a chalkboard, not just a dark
  // rectangle.
  const frame = Math.max(6, Math.round(Math.min(width, height) * 0.02));
  ctx.strokeStyle = "#5a3d24";
  ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, width - frame, height - frame);
}

/** Paint a paper background onto ctx, sized to (width, height). Call on mount and on Clear. */
export function paintPaper(ctx: CanvasRenderingContext2D, paper: PaperId, width: number, height: number): void {
  switch (paper) {
    case "galaxy":
      return paintGalaxy(ctx, width, height);
    case "graph":
      return paintGraph(ctx, width, height);
    case "kraft":
      return paintKraft(ctx, width, height);
    case "blackboard":
      return paintBlackboard(ctx, width, height);
  }
}
