"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveImage } from "../utils/saveImage";

/*
 * Colouring works on real SVG regions, not a bitmap flood fill.
 *
 * The old version rasterised line art and flood-filled pixels, which meant
 * every anti-aliased edge left a grey halo the fill could never cross, and any
 * outline with a gap (a whisker, a leg) leaked colour across the whole page.
 * Here each region IS a closed <path>; tapping one sets its fill. That is
 * exact, instant, undoable, and crisp at any size — and it makes patterns with
 * two hundred regions practical, which is where the good colouring is.
 */

const S = 512; // viewBox size
const C = S / 2;
const R = 238; // working radius for the round patterns
const INK = "#1b2233";
const PAPER = "#FFFDF8";

// ---------------------------------------------------------------- geometry

const px = (r: number, a: number) => `${(C + r * Math.cos(a)).toFixed(1)},${(C + r * Math.sin(a)).toFixed(1)}`;
const xy = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

const circlePath = (cx: number, cy: number, r: number) =>
  `M${xy(cx - r, cy)}a${r},${r} 0 1,0 ${(2 * r).toFixed(1)},0a${r},${r} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;

const poly = (pts: [number, number][]) => `M${pts.map(([x, y]) => xy(x, y)).join("L")}Z`;

const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M${xy(cx - rx, cy)}a${rx},${ry} 0 1,0 ${(2 * rx).toFixed(1)},0a${rx},${ry} 0 1,0 ${(-2 * rx).toFixed(1)},0Z`;

/** Closed Catmull-Rom through the points, emitted as cubics. */
function smooth(pts: [number, number][]) {
  const n = pts.length;
  let d = `M${xy(pts[0][0], pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d +=
      `C${xy(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${xy(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${xy(p2[0], p2[1])}`;
  }
  return `${d}Z`;
}

/**
 * A closed organic shape from a radial profile, scaled about its OWN centre.
 * That last part matters: scaling a wing about the body anchor instead makes
 * the inner bands crowd the anchor rather than nest inside the wing.
 */
function blob(
  cx: number,
  cy: number,
  scale: number,
  prof: (t: number) => number,
  rot = 0,
  flip = 1,
  steps = 44,
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = prof(t) * scale;
    pts.push([cx + flip * r * Math.cos(t + rot), cy + r * Math.sin(t + rot)]);
  }
  return smooth(pts);
}

/** One cell of an annulus, between two radii and two angles. */
function ringCell(r0: number, r1: number, a0: number, a1: number) {
  const big = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 < 0.5) return `M${xy(C, C)}L${px(r1, a0)}A${r1},${r1} 0 ${big} 1 ${px(r1, a1)}Z`;
  return `M${px(r1, a0)}A${r1},${r1} 0 ${big} 1 ${px(r1, a1)}L${px(r0, a1)}A${r0},${r0} 0 ${big} 0 ${px(r0, a0)}Z`;
}

/** A leaf/petal: two quadratic curves bulging either side of a radial axis. */
function petal(a: number, r0: number, r1: number, w: number) {
  const p = a + Math.PI / 2;
  const mid = (r0 + r1) / 2;
  const base = xy(C + r0 * Math.cos(a), C + r0 * Math.sin(a));
  const tip = xy(C + r1 * Math.cos(a), C + r1 * Math.sin(a));
  const c1 = xy(C + mid * Math.cos(a) + w * Math.cos(p), C + mid * Math.sin(a) + w * Math.sin(p));
  const c2 = xy(C + mid * Math.cos(a) - w * Math.cos(p), C + mid * Math.sin(a) - w * Math.sin(p));
  return `M${base}Q${c1} ${tip}Q${c2} ${base}Z`;
}

/**
 * Concentric bands inside a shape. `shape(scale)` returns the same outline at
 * a given size; each band is the gap between two of them, drawn as two
 * subpaths and resolved with fill-rule evenodd. This is what gives petals and
 * wings their nested colouring-book look.
 */
function bands(shape: (scale: number) => string, scales: number[]) {
  const out: string[] = [];
  for (let i = 0; i < scales.length - 1; i++) out.push(`${shape(scales[i])} ${shape(scales[i + 1])}`);
  out.push(shape(scales[scales.length - 1]));
  return out;
}

// ---------------------------------------------------------------- patterns

/** A ring of plain annular cells — solid, gap-free, easy to fill. */
function sectorRing(out: string[], n: number, r0: number, r1: number, rot = 0) {
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a0 = (i + rot) * step - Math.PI / 2;
    out.push(ringCell(r0, r1, a0, a0 + step));
  }
}

/** A ring of petals. Leaves negative space between them, which is what stops
 *  a mandala reading as a brick wall. */
function petalRing(out: string[], n: number, r0: number, r1: number, rot = 0, fat = 0.46) {
  const step = (Math.PI * 2) / n;
  const w = fat * step * ((r0 + r1) / 2);
  for (let i = 0; i < n; i++) {
    const a = (i + rot) * step - Math.PI / 2;
    out.push(petal(a, r0, r1, w));
  }
}

function mandala() {
  const out: string[] = [];
  out.push(...bands(s => circlePath(C, C, 32 * s), [1, 0.6]));
  petalRing(out, 8, 32, 76, 0, 0.5);
  sectorRing(out, 16, 76, 100, 0.5);
  petalRing(out, 16, 100, 152, 0, 0.44);
  sectorRing(out, 24, 152, 174, 0);
  sectorRing(out, 24, 174, 198, 0.5);
  petalRing(out, 32, 198, R, 0, 0.46);
  return out;
}

function rosette() {
  const out: string[] = [circlePath(C, C, 36)];
  const petals = (n: number, r0: number, r1: number, rot: number) => {
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a0 = (i + rot) * step - Math.PI / 2;
      const a1 = a0 + step;
      const mid = (a0 + a1) / 2;
      out.push(
        `M${px(r0, a0)}Q${px(r0 + (r1 - r0) * 0.55, a0 + step * 0.1)} ${px(r1, mid)}` +
          `Q${px(r0 + (r1 - r0) * 0.55, a1 - step * 0.1)} ${px(r0, a1)}` +
          `A${r0},${r0} 0 0 0 ${px(r0, a0)}Z`,
      );
    }
  };
  petals(12, 36, 128, 0);
  const step = (Math.PI * 2) / 24;
  for (let i = 0; i < 24; i++) {
    const a0 = i * step - Math.PI / 2;
    out.push(ringCell(128, 158, a0, a0 + step));
  }
  for (let i = 0; i < 24; i++) {
    const a0 = (i + 0.5) * step - Math.PI / 2;
    out.push(ringCell(158, 186, a0, a0 + step));
  }
  petals(12, 186, R, 0.5);
  return out;
}

function kaleidoscope() {
  const wedges = 16;
  const radii = [42, 82, 120, 158, 198, R];
  const step = (Math.PI * 2) / wedges;
  const out: string[] = [circlePath(C, C, radii[0])];
  for (let b = 1; b < radii.length; b++) {
    const r0 = radii[b - 1];
    const r1 = radii[b];
    for (let k = 0; k < wedges; k++) {
      const a0 = k * step - Math.PI / 2;
      const a1 = a0 + step;
      // Flip the splitting diagonal every other cell so the mesh reads as woven.
      if ((b + k) % 2) {
        out.push(`M${px(r1, a0)}A${r1},${r1} 0 0 1 ${px(r1, a1)}L${px(r0, a1)}Z`);
        out.push(`M${px(r1, a0)}L${px(r0, a1)}A${r0},${r0} 0 0 0 ${px(r0, a0)}Z`);
      } else {
        out.push(`M${px(r1, a0)}A${r1},${r1} 0 0 1 ${px(r1, a1)}L${px(r0, a0)}Z`);
        out.push(`M${px(r1, a1)}L${px(r0, a1)}A${r0},${r0} 0 0 0 ${px(r0, a0)}Z`);
      }
    }
  }
  return out;
}

function hexagons() {
  const s = 25;
  const dx = Math.sqrt(3) * s;
  const dy = 1.5 * s;
  const out: string[] = [];
  for (let row = -9; row <= 9; row++) {
    for (let col = -8; col <= 8; col++) {
      const cx = C + col * dx + (Math.abs(row % 2) ? dx / 2 : 0);
      const cy = C + row * dy;
      if (Math.hypot(cx - C, cy - C) > R + s) continue;
      const pts: [number, number][] = [];
      for (let k = 0; k < 6; k++) {
        const a = ((60 * k - 90) * Math.PI) / 180;
        pts.push([cx + s * Math.cos(a), cy + s * Math.sin(a)]);
      }
      out.push(poly(pts));
    }
  }
  return out;
}

function triangles() {
  const w = 52;
  const h = (w * Math.sqrt(3)) / 2;
  const out: string[] = [];
  for (let row = -8; row <= 8; row++) {
    const y0 = C + row * h;
    for (let col = -8; col <= 8; col++) {
      const x0 = C + col * w + (Math.abs(row % 2) ? w / 2 : 0);
      const up: [number, number][] = [[x0, y0 + h], [x0 + w, y0 + h], [x0 + w / 2, y0]];
      const down: [number, number][] = [[x0 + w / 2, y0], [x0 + w * 1.5, y0], [x0 + w, y0 + h]];
      for (const t of [up, down]) {
        const gx = (t[0][0] + t[1][0] + t[2][0]) / 3;
        const gy = (t[0][1] + t[1][1] + t[2][1]) / 3;
        if (Math.hypot(gx - C, gy - C) > R + w) continue;
        out.push(poly(t));
      }
    }
  }
  return out;
}

function scales() {
  const s = 30;
  const out: string[] = [];
  for (let row = -9; row <= 9; row++) {
    const cy = C + row * s;
    for (let col = -9; col <= 9; col++) {
      const cx = C + col * 2 * s + (Math.abs(row % 2) ? s : 0);
      if (Math.hypot(cx - C, cy + s * 0.4 - C) > R + 2 * s) continue;
      out.push(`M${xy(cx - s, cy)}A${s},${s} 0 0,1 ${xy(cx + s, cy)}Z`);
    }
  }
  return out;
}

function spiral() {
  // Three fat turns, not seven thin ones. A thin spiral is geometrically
  // correct and reads as concentric circles — the offset per turn has to be
  // big enough to see. Each turn is split across its thickness so the ribbon
  // still has plenty of pieces to colour.
  const thickness = 56;
  const turns = 3;
  const sub = 2;
  const k = thickness / (Math.PI * 2);
  const r0 = 12;
  const end = turns * Math.PI * 2;
  const at = (t: number) => r0 + k * t;
  const out: string[] = [circlePath(C, C, r0)];
  // Divide by arc length, not by angle. A fixed angular step puts every turn's
  // dividers at the same bearing, and the aligned spokes read as a wheel
  // instead of a ribbon.
  for (let t = 0; t < end - 1e-6; ) {
    const rMid = at(t) + thickness / 2;
    const t1 = Math.min(t + Math.min(Math.max(46 / rMid, 0.17), 0.95), end);
    for (let s = 0; s < sub; s++) {
      const lo = (thickness * s) / sub;
      const hi = (thickness * (s + 1)) / sub;
      const fwd: string[] = [];
      const back: string[] = [];
      const N = 4;
      for (let i = 0; i <= N; i++) {
        const a = t + ((t1 - t) * i) / N;
        fwd.push(px(at(a) + lo, a - Math.PI / 2));
        back.push(px(at(a) + hi, a - Math.PI / 2));
      }
      out.push(`M${fwd.join("L")}L${back.reverse().join("L")}Z`);
    }
    t = t1;
  }
  return out;
}

function quilt() {
  const n = 7;
  const cell = 68;
  const origin = C - (n * cell) / 2;
  const out: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = origin + c * cell;
      const y = origin + r * cell;
      const m: [number, number] = [x + cell / 2, y + cell / 2];
      out.push(poly([[x, y], [x + cell, y], m]));
      out.push(poly([[x + cell, y], [x + cell, y + cell], m]));
      out.push(poly([[x + cell, y + cell], [x, y + cell], m]));
      out.push(poly([[x, y + cell], [x, y], m]));
    }
  }
  return out;
}

function diamonds() {
  // Sized for ~200 pieces. Tighter than this and the pattern is unreadable at
  // thumbnail size and needlessly heavy in the DOM.
  const d = 56;
  const out: string[] = [];
  for (let i = -8; i <= 8; i++) {
    for (let j = -8; j <= 8; j++) {
      const cx = C + (i - j) * d;
      const cy = C + (i + j) * d * 0.62;
      if (Math.hypot(cx - C, cy - C) > R + d) continue;
      const top: [number, number] = [cx, cy - d * 0.62];
      const right: [number, number] = [cx + d, cy];
      const bot: [number, number] = [cx, cy + d * 0.62];
      const left: [number, number] = [cx - d, cy];
      const m: [number, number] = [cx, cy];
      out.push(poly([top, right, m]));
      out.push(poly([right, bot, m]));
      out.push(poly([bot, left, m]));
      out.push(poly([left, top, m]));
    }
  }
  return out;
}

function sunburst() {
  const out: string[] = [circlePath(C, C, 40)];
  const step = (Math.PI * 2) / 20;
  for (let i = 0; i < 20; i++) {
    const a0 = i * step - Math.PI / 2;
    out.push(ringCell(40, 78, a0, a0 + step));
  }
  for (let i = 0; i < 20; i++) {
    const a0 = (i + 0.5) * step - Math.PI / 2;
    out.push(ringCell(78, 112, a0, a0 + step));
  }
  // Alternating long and short rays.
  for (let i = 0; i < 20; i++) {
    const a0 = i * step - Math.PI / 2;
    const mid = a0 + step / 2;
    const tip = i % 2 ? R : 186;
    out.push(`M${px(112, a0)}L${px(tip, mid)}L${px(112, a0 + step)}A112,112 0 0 0 ${px(112, a0)}Z`);
  }
  return out;
}

function flower() {
  const out: string[] = [];
  // Petals are wide relative to their length — narrow ones read as a spiky
  // star, not a flower.
  const ring = (n: number, r0: number, r1: number, w: number, rot: number, layers: number[]) => {
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a = (i + rot) * step - Math.PI / 2;
      out.push(...bands(s => petal(a, r0, r0 + (r1 - r0) * s, w * s), layers));
    }
  };
  ring(6, 46, R, 68, 0, [1, 0.72, 0.44]);
  ring(6, 44, 174, 54, 0.5, [1, 0.66, 0.36]);
  ring(12, 40, 100, 24, 0.25, [1, 0.55]);
  out.push(...bands(s => circlePath(C, C, 42 * s), [1, 0.68, 0.36]));
  return out;
}

function butterfly() {
  const out: string[] = [];
  const upperProf = (t: number) => 1 + 0.3 * Math.cos(t) + 0.14 * Math.cos(2 * t) - 0.07 * Math.sin(t);
  // Keep the cos(2t) term small — a strong one pinches the wing into a peanut
  // once the inner bands shrink.
  const lowerProf = (t: number) => 1 + 0.22 * Math.cos(t) - 0.09 * Math.cos(2 * t) + 0.08 * Math.sin(t);

  for (const side of [-1, 1]) {
    const ux = C + side * 92;
    const lx = C + side * 66;
    out.push(...bands(s => blob(ux, 224, 88 * s, upperProf, -0.35, side), [1, 0.74, 0.5, 0.27]));
    out.push(...bands(s => blob(lx, 336, 68 * s, lowerProf, 0.5, side), [1, 0.68, 0.38]));
    // Eyespots, placed out along the wing so they sit inside the outer bands.
    out.push(circlePath(ux + side * 46, 200, 15));
    out.push(circlePath(ux + side * 18, 268, 11));
    out.push(circlePath(lx + side * 22, 356, 12));
  }

  // Body, head to tail.
  out.push(circlePath(C, 186, 21));
  out.push(...bands(s => ellipsePath(C, 232, 23 * s, 36 * s), [1, 0.54]));
  out.push(ellipsePath(C, 292, 18, 30));
  out.push(ellipsePath(C, 340, 13, 24));

  const decor = [
    `M${xy(C - 9, 170)}Q${xy(C - 36, 132)} ${xy(C - 58, 118)}`,
    `M${xy(C + 9, 170)}Q${xy(C + 36, 132)} ${xy(C + 58, 118)}`,
    circlePath(C - 60, 116, 7),
    circlePath(C + 60, 116, 7),
  ];
  return { regions: out, decor };
}

type Pattern = { name: string; regions: string[]; decor?: string[]; stroke: number; clip?: boolean };

const BUILDERS: Record<string, () => Pattern> = {
  mandala: () => ({ name: "Mandala", regions: mandala(), stroke: 1.8 }),
  rosette: () => ({ name: "Rose window", regions: rosette(), stroke: 1.8 }),
  kaleidoscope: () => ({ name: "Kaleidoscope", regions: kaleidoscope(), stroke: 1.5 }),
  spiral: () => ({ name: "Spiral", regions: spiral(), stroke: 1.6 }),
  sunburst: () => ({ name: "Sunburst", regions: sunburst(), stroke: 2 }),
  flower: () => ({ name: "Flower", regions: flower(), stroke: 2 }),
  butterfly: () => ({ name: "Butterfly", ...butterfly(), stroke: 2.2 }),
  hexagons: () => ({ name: "Honeycomb", regions: hexagons(), stroke: 1.8, clip: true }),
  triangles: () => ({ name: "Triangles", regions: triangles(), stroke: 1.5, clip: true }),
  scales: () => ({ name: "Scales", regions: scales(), stroke: 1.8, clip: true }),
  diamonds: () => ({ name: "Diamonds", regions: diamonds(), stroke: 1.5, clip: true }),
  quilt: () => ({ name: "Quilt", regions: quilt(), stroke: 1.5 }),
};

const PATTERN_KEYS = Object.keys(BUILDERS);

// ---------------------------------------------------------------- palette

// Twenty-three, so the eraser completes the second row of twelve.
const PALETTE = [
  "#e11d48", "#f43f5e", "#fb7185", "#ea580c", "#f97316", "#f59e0b",
  "#eab308", "#facc15", "#84cc16", "#22c55e", "#15803d", "#0d9488",
  "#06b6d4", "#0ea5e9", "#2563eb", "#1e3a8a", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#7c2d12", "#a8a29e", "#44403c",
];

export default function ColorFill() {
  const svgRef = useRef<SVGSVGElement>(null);
  const painting = useRef(false);
  const [key, setKey] = useState("mandala");
  const [color, setColor] = useState("#2563eb");
  const [fills, setFills] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<Record<number, string>[]>([]);

  const pattern = useMemo(() => BUILDERS[key](), [key]);
  const clipId = `cf-clip-${key}`;

  const reset = useCallback(() => {
    setFills({});
    setHistory([]);
  }, []);

  useEffect(() => {
    reset();
    // On a phone the picker sits below the fold, so choosing a pattern would
    // otherwise leave you looking at the picker instead of the pattern you
    // just chose. "nearest" is a no-op when the canvas is already on screen.
    svgRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [key, reset]);

  // Snapshot before a change so undo reverts a whole stroke, not one region.
  const snapshot = useCallback(() => {
    setHistory(h => [...h.slice(-39), fills]);
  }, [fills]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.length) return h;
      setFills(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY);
      const raw = el instanceof Element ? el.getAttribute("data-region") : null;
      if (raw === null) return;
      const i = Number(raw);
      setFills(f => (f[i] === color ? f : { ...f, [i]: color }));
    },
    [color],
  );

  const onDown = (e: React.PointerEvent) => {
    snapshot();
    painting.current = true;
    paintAt(e.clientX, e.clientY);
  };

  // Drag to paint. Hit-testing via elementFromPoint rather than per-path
  // pointerenter, because a touch drag stays captured by the first element it
  // touched and never fires enter on its neighbours.
  const onMove = (e: React.PointerEvent) => {
    if (!painting.current) return;
    paintAt(e.clientX, e.clientY);
  };

  useEffect(() => {
    const up = () => { painting.current = false; };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  /**
   * Auto-colour everything on one sweep of the colour wheel. Region order is
   * spatial in every generator (rings outward, turns of the spiral, rows of
   * the grid), so walking hue by index lands as a coherent gradient rather
   * than confetti.
   */
  const surprise = () => {
    snapshot();
    const base = Math.random() * 360;
    const span = 70 + Math.random() * 250;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = pattern.regions.length;
    const next: Record<number, string> = {};
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const h = (((base + dir * span * t) % 360) + 360) % 360;
      const s = 62 + 22 * Math.sin(i * 1.7);
      const l = 55 + 14 * Math.sin(i * 0.85);
      next[i] = `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
    }
    setFills(next);
  };

  const handleSave = async () => {
    const src = svgRef.current;
    if (!src) return;
    const clone = src.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1024");
    clone.setAttribute("height", "1024");
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("render failed"));
      img.src = url;
    });
    const out = document.createElement("canvas");
    out.width = 1024;
    out.height = 1024;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.drawImage(img, 0, 0, 1024, 1024);
    saveImage(out.toDataURL(), `coloring-${key}.png`);
  };

  const filled = Object.keys(fills).length;
  const pill = "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillOff = "bg-paper text-ink-2 border-line hover:bg-paper-2";

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8 pt-4">
      <div className="rounded-2xl border border-line overflow-hidden" style={{ background: PAPER }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${S} ${S}`}
          className="block w-full h-auto select-none"
          style={{ touchAction: "none" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={C} cy={C} r={R} />
            </clipPath>
          </defs>
          <rect x="0" y="0" width={S} height={S} fill={PAPER} />
          <g clipPath={pattern.clip ? `url(#${clipId})` : undefined}>
            {pattern.regions.map((d, i) => (
              <path
                key={i}
                d={d}
                data-region={i}
                fill={fills[i] ?? PAPER}
                fillRule="evenodd"
                stroke={INK}
                strokeWidth={pattern.stroke}
                strokeLinejoin="round"
                style={{ cursor: "pointer" }}
              />
            ))}
          </g>
          {pattern.clip && (
            <circle cx={C} cy={C} r={R} fill="none" stroke={INK} strokeWidth={pattern.stroke * 1.4} />
          )}
          {pattern.decor?.map((d, i) => (
            <path
              key={`d${i}`}
              d={d}
              fill="none"
              stroke={INK}
              strokeWidth={pattern.stroke}
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={surprise}
          className="flex-1 py-3 rounded-full text-base font-semibold text-paper transition-transform active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Surprise colours
        </button>
        <button type="button" onClick={undo} disabled={!history.length} className={`${pill} ${pillOff} py-3 disabled:opacity-40`}>
          Undo
        </button>
        <button type="button" onClick={reset} disabled={!filled} className={`${pill} ${pillOff} py-3 disabled:opacity-40`}>
          Clear
        </button>
        <button type="button" onClick={handleSave} className={`${pill} ${pillOff} py-3`}>
          Save
        </button>
      </div>

      <p className="mt-2 text-center font-mono text-[11px] text-ink-3">
        {pattern.name} · {pattern.regions.length} pieces · {filled} coloured
      </p>

      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Colour</p>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              aria-pressed={color === c}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "scale-110" : ""}`}
              style={{ backgroundColor: c, borderColor: color === c ? "var(--accent)" : "var(--line)" }}
            />
          ))}
          <button
            type="button"
            onClick={() => setColor(PAPER)}
            aria-label="Eraser"
            aria-pressed={color === PAPER}
            className={`w-8 h-8 rounded-full border-2 text-[10px] transition-transform ${color === PAPER ? "scale-110" : ""}`}
            style={{ backgroundColor: PAPER, borderColor: color === PAPER ? "var(--accent)" : "var(--line)" }}
          >
            ⌫
          </button>
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Pattern</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {PATTERN_KEYS.map(k => (
            <PatternThumb key={k} id={k} selected={k === key} onSelect={() => setKey(k)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Thumbnails render to a small canvas rather than nested SVGs: twelve previews
 * of two-hundred-path patterns would put thousands of extra nodes in the DOM
 * for something the size of a postage stamp.
 */
function PatternThumb({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = BUILDERS[id]();
    setName(p.name);
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.scale(size / S, size / S);
    if (p.clip) {
      ctx.beginPath();
      ctx.arc(C, C, R, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.6, p.stroke) * (S / size) * 1.6;
    ctx.lineJoin = "round";
    for (const d of p.regions) ctx.stroke(new Path2D(d));
    ctx.restore();
    if (p.clip) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (R / S) * size, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [id]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={name}
      aria-pressed={selected}
      className={`rounded-xl border p-1 transition-colors ${selected ? "border-transparent bg-paper-2" : "border-line hover:bg-paper-2"}`}
      style={selected ? { outline: "2px solid var(--accent)", outlineOffset: "-2px" } : undefined}
    >
      <canvas ref={ref} width={128} height={128} className="w-full h-auto rounded-lg" />
      <span className={`block mt-0.5 font-mono text-[9px] truncate ${selected ? "text-ink" : "text-ink-3"}`}>{name}</span>
    </button>
  );
}
