"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveImage } from "../utils/saveImage";

const CANVAS_SIZE = 768;

// The toy is modelled on a real Spirograph set: a fixed 96-tooth ring and a
// tray of toothed wheels. Tooth counts (not raw radii) are the control kids
// understand — and because the gear ratio is the tooth ratio, every pattern is
// guaranteed to close on itself.
const RING_TEETH = 96;
const WHEELS = [24, 30, 32, 36, 40, 45, 48, 56, 63, 72, 80, 84];

// Pen holes, outermost first, as a fraction of the wheel's radius, laid out in
// a spiral like the real thing. Six rather than seven, spaced a full radian
// apart: any tighter and the innermost holes collide in the picker, which
// makes them fiddly to tap.
const HOLE_FRACTIONS = [0.88, 0.76, 0.64, 0.52, 0.4, 0.28];
const HOLE_SPIRAL = 1.0; // radians between adjacent holes

// Total draw time per curve, slowest → fastest. Time-based rather than
// steps-based so a simple 3-lobe flower and a 21-revolution star take the same
// (predictable) time to appear.
const DURATIONS = [9000, 6000, 3800, 2300, 1300];

// Two palettes, index-matched: switching the paper flips every swatch to the
// version that stays legible on that background.
const COLORS = [
  { night: "#ffffff", paper: "#131A2A" },
  { night: "#ef4444", paper: "#dc2626" },
  { night: "#f97316", paper: "#ea580c" },
  { night: "#eab308", paper: "#ca8a04" },
  { night: "#22c55e", paper: "#16a34a" },
  { night: "#06d6a0", paper: "#0d9488" },
  { night: "#06b6d4", paper: "#0891b2" },
  { night: "#3b82f6", paper: "#2563eb" },
  { night: "#8b5cf6", paper: "#7c3aed" },
  { night: "#ec4899", paper: "#db2777" },
  { night: "#f43f5e", paper: "#e11d48" },
  { night: "#84cc16", paper: "#65a30d" },
];

const RAINBOW = -1; // sentinel colour index

type Bg = "night" | "paper";

const PAPER_HEX = { night: "#0d1424", paper: "#FBF6EB" } as const;

// Ink used for the machine itself (ring, wheel, arm) — never for the drawing.
const MACHINE = {
  night: { ring: "rgba(255,255,255,0.2)", tooth: "rgba(255,255,255,0.22)", gearTooth: "rgba(255,255,255,0.4)", gear: "rgba(255,255,255,0.045)", edge: "rgba(255,255,255,0.55)", hole: "rgba(255,255,255,0.4)", ghost: "rgba(255,255,255,0.2)" },
  paper: { ring: "rgba(19,26,42,0.22)", tooth: "rgba(19,26,42,0.28)", gearTooth: "rgba(19,26,42,0.45)", gear: "rgba(19,26,42,0.05)", edge: "rgba(19,26,42,0.6)", hole: "rgba(19,26,42,0.45)", ghost: "rgba(19,26,42,0.28)" },
} as const;

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Everything needed to both draw and animate one pattern, in ring-radius=1 units. */
function geometry(wheel: number, hole: number, mode: "inside" | "outside") {
  const r = wheel / RING_TEETH;
  const d = r * HOLE_FRACTIONS[hole];
  const inside = mode === "inside";
  // Distance from ring centre to wheel centre, and the wheel's own spin rate.
  const armR = inside ? 1 - r : 1 + r;
  const spin = inside ? -(1 - r) / r : (1 + r) / r;
  // Curve closes after this many trips around the ring.
  const revolutions = wheel / gcd(RING_TEETH, wheel);
  const totalT = 2 * Math.PI * revolutions;
  // The machine must fit the canvas. Three things can be the outermost: the
  // ring (1), the pen (armR + d), and — in "outside" mode — the wheel's own
  // rim (armR + r), which is what actually sticks out furthest for big wheels.
  // Miss that last one and the wheel gets clipped by the canvas edge.
  const extent = Math.max(1, armR + d, armR + r);

  const centerAt = (t: number) => ({ x: armR * Math.cos(t), y: armR * Math.sin(t) });
  // The wheel's own rotation. The pen sits on this angle at distance d, so the
  // teeth we draw always roll in lockstep with the pen.
  const gearAngle = (t: number) => (inside ? spin * t : spin * t + Math.PI);
  const penAt = (t: number) => {
    const c = centerAt(t);
    const a = gearAngle(t);
    return { x: c.x + d * Math.cos(a), y: c.y + d * Math.sin(a) };
  };

  return { r, d, armR, revolutions, totalT, extent, centerAt, penAt, gearAngle };
}

/** A toothed circle. `outward` puts the teeth on the outside (a wheel). */
function toothedCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  teeth: number,
  depth: number,
  phase: number,
  outward: boolean,
  strokeStyle: string,
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = Math.max(1, depth * 0.32);
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = phase + (i / teeth) * Math.PI * 2;
    const r1 = radius;
    const r2 = outward ? radius + depth : radius - depth;
    ctx.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
    ctx.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
  }
  ctx.stroke();
}

/** Small SVG gear used in the wheel tray and the pen-hole picker. */
function GearIcon({ teeth, size, tone, hub }: { teeth: number; size: number; tone: string; hub: string }) {
  const drawn = Math.max(9, Math.min(22, Math.round(teeth / 4)));
  const R = 40;
  const depth = 6;
  let path = "";
  for (let i = 0; i < drawn; i++) {
    const a0 = (i / drawn) * Math.PI * 2;
    const step = (Math.PI * 2) / drawn / 4;
    const pts = [
      [R, a0 - step],
      [R + depth, a0 - step * 0.45],
      [R + depth, a0 + step * 0.45],
      [R, a0 + step],
    ] as const;
    pts.forEach(([rr, aa], j) => {
      const x = (rr * Math.cos(aa)).toFixed(2);
      const y = (rr * Math.sin(aa)).toFixed(2);
      path += `${i === 0 && j === 0 ? "M" : "L"}${x} ${y}`;
    });
  }
  path += "Z";
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true">
      <path d={path} fill={tone} />
      <circle cx="0" cy="0" r={R * 0.42} fill={hub} />
    </svg>
  );
}

export default function Spirograph() {
  const artRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<HTMLCanvasElement>(null);
  const undoRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  // Defaults matter: the first thing a kid sees has to be a clean, obviously
  // pretty flower, not a 21-lap thicket.
  const [wheel, setWheel] = useState(40);
  const [hole, setHole] = useState(2);
  const [mode, setMode] = useState<"inside" | "outside">("inside");
  const [colorIdx, setColorIdx] = useState(8);
  const [lineWidth, setLineWidth] = useState(2);
  const [speed, setSpeed] = useState(3);
  const [bg, setBg] = useState<Bg>("night");
  const [isPlaying, setIsPlaying] = useState(false);
  const [layers, setLayers] = useState(0);

  // Colour and width apply live mid-draw; the rAF closure is fixed at
  // draw-start, so it reads these refs rather than stale state.
  const colorRef = useRef(colorIdx);
  const widthRef = useRef(lineWidth);
  const bgRef = useRef(bg);
  useEffect(() => { colorRef.current = colorIdx; }, [colorIdx]);
  useEffect(() => { widthRef.current = lineWidth; }, [lineWidth]);
  useEffect(() => { bgRef.current = bg; }, [bg]);

  const strokeFor = (t01: number) => {
    const b = bgRef.current;
    if (colorRef.current === RAINBOW) {
      return `hsl(${(t01 * 360 + 200) % 360} 85% ${b === "night" ? 62 : 44}%)`;
    }
    return COLORS[colorRef.current][b];
  };

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => () => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  /**
   * Paint the machine layer: the ring, the wheel parked at angle `t`, its pen
   * holes, the arm out to the selected hole, and (when idle) a ghost of the
   * curve this setting will draw. This is the whole point of the redesign —
   * you can see what you picked before anything is drawn.
   */
  const paintMachine = useCallback(
    (t: number, opts: { ghost: boolean; penGlow?: boolean }) => {
      const canvas = machineRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const g = geometry(wheel, hole, mode);
      const cx = CANVAS_SIZE / 2;
      const cy = CANVAS_SIZE / 2;
      const scale = (CANVAS_SIZE / 2 - 26) / g.extent;
      // Read through the ref, not state: mid-draw the rAF loop is calling a
      // closure captured at draw-start, and the paper can change under it.
      const paper = bgRef.current;
      const ink = MACHINE[paper];
      const px = (p: { x: number; y: number }) => ({ x: cx + p.x * scale, y: cy - p.y * scale });

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 0;

      // Ghost of the finished curve, so the pattern is visible before you
      // commit. Kept hairline and solid — a dashed or heavy ghost turns a
      // 21-lap pattern into noise, which is the opposite of the point.
      if (opts.ghost) {
        ctx.strokeStyle = ink.ghost;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const steps = Math.ceil(g.totalT / 0.03);
        for (let i = 0; i <= steps; i++) {
          const p = px(g.penAt((i / steps) * g.totalT));
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // The fixed ring, teeth pointing inward.
      const R = scale;
      ctx.strokeStyle = ink.ring;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2.5, 0, Math.PI * 2);
      ctx.stroke();
      // The real ring is toothed on both edges, but drawing both rows reads as
      // a fuzzy band. Show only the row the wheel is actually meshing with.
      if (mode === "inside") toothedCircle(ctx, cx, cy, R, RING_TEETH, 5, 0, false, ink.tooth);
      else toothedCircle(ctx, cx, cy, R + 5, RING_TEETH, 5, 0, true, ink.tooth);

      // The rolling wheel.
      const c = px(g.centerAt(t));
      const wr = g.r * scale;
      const spin = -g.gearAngle(t); // negate: canvas y grows downward
      ctx.fillStyle = ink.gear;
      ctx.beginPath();
      ctx.arc(c.x, c.y, wr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ink.edge;
      ctx.lineWidth = 2;
      ctx.stroke();
      toothedCircle(ctx, c.x, c.y, wr, wheel, Math.max(4, Math.min(9, wr * 0.06)), spin, true, ink.gearTooth);

      // Every pen hole on the wheel, in the same spiral as the picker below.
      // Offsets are measured from the selected hole so that one lands exactly
      // under the pen arm, and it gets the live drawing colour.
      HOLE_FRACTIONS.forEach((f, i) => {
        const a = spin + (i - hole) * HOLE_SPIRAL;
        const hx = c.x + wr * f * Math.cos(a);
        const hy = c.y + wr * f * Math.sin(a);
        ctx.beginPath();
        ctx.arc(hx, hy, Math.max(2.5, wr * 0.055), 0, Math.PI * 2);
        ctx.strokeStyle = ink.hole;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (i === hole) {
          ctx.fillStyle = strokeFor(0);
          ctx.fill();
        }
      });

      // The arm from wheel centre to the pen, then the pen tip itself.
      const pen = px(g.penAt(t));
      ctx.strokeStyle = ink.edge;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(pen.x, pen.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = ink.edge;
      ctx.fill();

      const penColor = strokeFor(opts.penGlow ? t / g.totalT : 0);
      if (opts.penGlow && paper === "night") {
        ctx.shadowBlur = 18;
        ctx.shadowColor = penColor;
      }
      ctx.beginPath();
      ctx.arc(pen.x, pen.y, opts.penGlow ? 7 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = penColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    },
    // strokeFor reads refs that mirror colorIdx/bg, so both belong here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wheel, hole, mode, bg, colorIdx, lineWidth],
  );

  // Whenever the setup changes and nothing is drawing, re-park the machine and
  // re-ghost the curve.
  useEffect(() => {
    if (!isPlaying) paintMachine(0, { ghost: true });
  }, [isPlaying, paintMachine]);

  const draw = useCallback(() => {
    const art = artRef.current;
    if (!art) return;
    const ctx = art.getContext("2d");
    if (!ctx) return;

    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    // Snapshot for one level of undo — layering is the point of this toy, and
    // one bad layer shouldn't cost you the whole picture.
    if (!undoRef.current) {
      undoRef.current = document.createElement("canvas");
      undoRef.current.width = CANVAS_SIZE;
      undoRef.current.height = CANVAS_SIZE;
    }
    const uctx = undoRef.current.getContext("2d");
    if (uctx) {
      uctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      uctx.drawImage(art, 0, 0);
    }

    const g = geometry(wheel, hole, mode);
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const scale = (CANVAS_SIZE / 2 - 26) / g.extent;
    const px = (t: number) => {
      const p = g.penAt(t);
      return { x: cx + p.x * scale, y: cy - p.y * scale };
    };

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const duration = DURATIONS[speed - 1];
    const startTime = performance.now();
    let prevT = 0;

    runningRef.current = true;
    setIsPlaying(true);

    const tick = (now: number) => {
      if (!runningRef.current) return;
      const target = Math.min(1, (now - startTime) / duration) * g.totalT;

      // Walk from prevT to target in small increments, re-colouring every few
      // segments so rainbow mode gradates smoothly instead of banding.
      const stepSize = 0.02;
      const width = widthRef.current * 2;
      const glow = bgRef.current === "night";
      while (prevT < target) {
        const chunkEnd = Math.min(target, prevT + stepSize * 8);
        ctx.strokeStyle = strokeFor(prevT / g.totalT);
        ctx.lineWidth = width;
        ctx.shadowBlur = glow ? width * 2.2 : 0;
        ctx.shadowColor = glow ? ctx.strokeStyle : "transparent";
        ctx.beginPath();
        const from = px(prevT);
        ctx.moveTo(from.x, from.y);
        for (let t = prevT + stepSize; t < chunkEnd; t += stepSize) {
          const p = px(t);
          ctx.lineTo(p.x, p.y);
        }
        const end = px(chunkEnd);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        prevT = chunkEnd;
      }
      ctx.shadowBlur = 0;

      paintMachine(target, { ghost: false, penGlow: true });

      if (target >= g.totalT) {
        runningRef.current = false;
        rafRef.current = null;
        setIsPlaying(false);
        setLayers(n => n + 1);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [wheel, hole, mode, speed, paintMachine]);

  const clearArt = useCallback(() => {
    stop();
    const art = artRef.current;
    art?.getContext("2d")?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    undoRef.current = null;
    setLayers(0);
  }, [stop]);

  const undo = useCallback(() => {
    stop();
    const art = artRef.current;
    const snap = undoRef.current;
    if (!art || !snap) return;
    const ctx = art.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(snap, 0, 0);
    undoRef.current = null;
    setLayers(n => Math.max(0, n - 1));
  }, [stop]);

  // Surprise me: randomise, then draw once the new params have landed in
  // state. The tick guarantees a re-render even when the dice happen to match
  // the current setup, so the draw always fires exactly once.
  const [surpriseTick, setSurpriseTick] = useState(0);
  const drawRef = useRef(draw);
  useEffect(() => { drawRef.current = draw; });

  const handleSurprise = () => {
    stop();
    setWheel(WHEELS[Math.floor(Math.random() * WHEELS.length)]);
    setHole(Math.floor(Math.random() * HOLE_FRACTIONS.length));
    setMode(Math.random() < 0.3 ? "outside" : "inside");
    setColorIdx(Math.random() < 0.3 ? RAINBOW : Math.floor(Math.random() * COLORS.length));
    setSurpriseTick(n => n + 1);
  };

  useEffect(() => {
    if (surpriseTick === 0) return;
    drawRef.current();
  }, [surpriseTick]);

  // The drawing canvas is transparent and the paper colour lives on the
  // wrapper, so switching night/paper never destroys the artwork. Export
  // composites the two back together.
  const handleSave = () => {
    const art = artRef.current;
    if (!art) return;
    const out = document.createElement("canvas");
    out.width = CANVAS_SIZE;
    out.height = CANVAS_SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = PAPER_HEX[bg];
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(art, 0, 0);
    saveImage(out.toDataURL(), "spirograph.png");
  };

  const swatch = colorIdx === RAINBOW ? "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899, #ef4444)" : COLORS[colorIdx][bg];
  const g = geometry(wheel, hole, mode);
  // Real tooth counts are unreadable at picker scale, so draw a proportional
  // stand-in — big wheel still reads as more teeth than small wheel.
  const pickerTeeth = Math.max(9, Math.min(22, Math.round(wheel / 4)));

  const pillBase = "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillOn = "bg-ink text-paper border-ink";
  const pillOff = "bg-paper text-ink-2 border-line hover:bg-paper-2";

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8 pt-4">
      {/* The machine, front and centre. */}
      <div
        className="relative w-full aspect-square rounded-2xl border border-line overflow-hidden transition-colors duration-300"
        style={{ background: PAPER_HEX[bg] }}
      >
        <canvas ref={artRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 w-full h-full" />
        <canvas ref={machineRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-2 right-2 flex gap-1">
          {(["night", "paper"] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBg(b)}
              aria-label={b === "night" ? "Night paper" : "White paper"}
              aria-pressed={bg === b}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${bg === b ? "scale-110" : "opacity-70"}`}
              style={{ background: PAPER_HEX[b], borderColor: bg === b ? "var(--accent)" : "rgba(128,128,128,0.4)" }}
            />
          ))}
        </div>

        {layers > 0 && (
          <p className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wider" style={{ color: bg === "night" ? "rgba(255,255,255,0.35)" : "var(--ink-3)" }}>
            {layers} layer{layers === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Primary actions. */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={isPlaying ? stop : draw}
          className="flex-1 py-3 rounded-full text-base font-semibold text-paper transition-transform active:scale-[0.98]"
          style={{ background: isPlaying ? "var(--ink-2)" : "var(--accent)" }}
        >
          {isPlaying ? "Stop" : layers > 0 ? "Draw another" : "Draw"}
        </button>
        <button
          type="button"
          onClick={handleSurprise}
          aria-label="Surprise me"
          className="px-4 py-3 rounded-full text-sm font-semibold border border-line text-ink hover:bg-paper-2"
        >
          🎲
        </button>
      </div>

      {/* Undo/Clear/Save sit directly under Draw, not at the foot of the
          controls — you reach for Clear right after a layer you dislike, and
          it shouldn't need a scroll to find. */}
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={undo} disabled={layers === 0} className={`${pillBase} ${pillOff} disabled:opacity-40`}>
          Undo layer
        </button>
        <button type="button" onClick={clearArt} disabled={layers === 0} className={`${pillBase} ${pillOff} disabled:opacity-40`}>
          Clear
        </button>
        <button type="button" onClick={handleSave} className={`${pillBase} ${pillOff} ml-auto`}>
          Save PNG
        </button>
      </div>

      <p className="mt-3 text-center font-mono text-[11px] text-ink-3">
        {wheel} teeth · hole {hole + 1} · {mode === "inside" ? "inside" : "around"} · {g.revolutions} lap{g.revolutions === 1 ? "" : "s"}
      </p>

      {/* Wheel tray — sized to scale, so a big wheel looks like a big wheel. */}
      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Pick a wheel</p>
        {/* Wrapped, not scrolled: seeing all twelve wheels at once is the
            whole point of having a tray. */}
        <div className="flex flex-wrap items-end gap-1.5">
          {WHEELS.map(t => {
            const on = t === wheel;
            return (
              <button
                key={t}
                type="button"
                onClick={() => { stop(); setWheel(t); }}
                aria-label={`${t} tooth wheel`}
                aria-pressed={on}
                className={`shrink-0 flex flex-col items-center justify-end gap-1 rounded-xl border px-2 py-2 transition-colors ${on ? "border-transparent bg-paper-2" : "border-line hover:bg-paper-2"}`}
                style={on ? { outline: "2px solid var(--accent)", outlineOffset: "-2px" } : undefined}
              >
                <GearIcon
                  teeth={t}
                  size={26 + Math.round((t / RING_TEETH) * 30)}
                  tone={on ? "var(--accent)" : "var(--ink-3)"}
                  hub={on ? "var(--paper-2)" : "var(--paper)"}
                />
                <span className={`font-mono text-[10px] ${on ? "text-ink" : "text-ink-3"}`}>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pen holes, drawn on the actual selected wheel. */}
      <div className="mt-4 flex gap-4 items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Pen hole</p>
          <svg viewBox="-50 -50 100 100" width={150} height={150} className="rounded-xl bg-paper-2 border border-line">
            <circle cx="0" cy="0" r="44" fill="none" stroke="var(--line)" strokeWidth="2" />
            {Array.from({ length: pickerTeeth }, (_, i) => {
              const a = (i / pickerTeeth) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={44 * Math.cos(a)} y1={44 * Math.sin(a)}
                  x2={49 * Math.cos(a)} y2={49 * Math.sin(a)}
                  stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round"
                />
              );
            })}
            {HOLE_FRACTIONS.map((f, i) => {
              const a = i * HOLE_SPIRAL;
              const x = 44 * f * Math.cos(a);
              const y = 44 * f * Math.sin(a);
              const on = i === hole;
              return (
                <g key={i} onClick={() => { stop(); setHole(i); }} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r="10" fill="transparent" />
                  <circle
                    cx={x} cy={y} r={on ? 6 : 4}
                    fill={on ? (colorIdx === RAINBOW ? "#8b5cf6" : COLORS[colorIdx].paper) : "var(--paper)"}
                    stroke={on ? "var(--accent)" : "var(--ink-3)"}
                    strokeWidth={on ? 3 : 2}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Where it rolls</p>
          <div className="flex gap-2">
            {(["inside", "outside"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { stop(); setMode(m); }}
                aria-pressed={mode === m}
                className={`${pillBase} ${mode === m ? pillOn : pillOff}`}
              >
                {m === "inside" ? "Inside" : "Around"}
              </button>
            ))}
          </div>

          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mt-4 mb-2">Speed</p>
          <input
            type="range" min={1} max={5} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            aria-label="Drawing speed"
            className="w-full accent-[var(--accent)]"
          />

          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mt-3 mb-2">Pen width</p>
          <div className="flex items-center gap-2">
            <input
              type="range" min={1} max={8} value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              aria-label="Pen width"
              className="flex-1 accent-[var(--accent)]"
            />
            <span
              className="shrink-0 rounded-full"
              style={{ width: lineWidth * 2 + 4, height: lineWidth * 2 + 4, background: swatch }}
            />
          </div>
        </div>
      </div>

      {/* Ink. */}
      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-2">Ink</p>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setColorIdx(i)}
              aria-label={`Colour ${i + 1}`}
              aria-pressed={colorIdx === i}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${colorIdx === i ? "scale-110" : "border-line"}`}
              style={{ backgroundColor: c[bg], borderColor: colorIdx === i ? "var(--accent)" : "var(--line)" }}
            />
          ))}
          <button
            type="button"
            onClick={() => setColorIdx(RAINBOW)}
            aria-label="Rainbow"
            aria-pressed={colorIdx === RAINBOW}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${colorIdx === RAINBOW ? "scale-110" : "border-line"}`}
            style={{
              background: "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899, #ef4444)",
              borderColor: colorIdx === RAINBOW ? "var(--accent)" : "var(--line)",
            }}
          />
        </div>
      </div>

    </div>
  );
}
