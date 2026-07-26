"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveImage } from "../utils/saveImage";

const CANVAS_SIZE = 512;
const BG = "#111827";
const DT = 0.015; // radians per micro-step — fixes point density, independent of speed
const MAX_STEPS = 24000; // safety cap so near-coprime R/r pairs can't run forever

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

const COLORS = [
  "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#84cc16", "#06d6a0",
];

export default function Spirograph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const colorRef = useRef("#8b5cf6");
  const lineWidthRef = useRef(2);

  const [ringRadius, setRingRadius] = useState(150); // R — fixed outer ring
  const [gearRadius, setGearRadius] = useState(50); // r — moving inner gear, always < R
  const [penOffset, setPenOffset] = useState(80); // d — pen offset from gear center
  const [color, setColor] = useState("#8b5cf6");
  const [lineWidth, setLineWidth] = useState(2);
  const [speed, setSpeed] = useState(3); // 1 (slow) – 5 (fast)
  const [isPlaying, setIsPlaying] = useState(false);

  // Color and line width apply live mid-animation; keep refs in sync so the
  // running rAF loop (whose closure is fixed at draw-start) reads current
  // values instead of stale ones.
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    lineWidthRef.current = lineWidth;
  }, [lineWidth]);

  const stopAnimation = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const clearCanvas = useCallback(() => {
    stopAnimation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [stopAnimation]);

  // Cancel any in-flight animation on unmount so it never ticks against an
  // unmounted canvas.
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cancel any loop already in flight — guards against stacking multiple
    // rAF loops from rapid Draw clicks.
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const R = ringRadius;
    // Guard: gear radius must be > 0 and < R (never equal) to avoid a
    // division by zero in (R - r) / r and a degenerate zero-amplitude curve.
    const r = Math.min(Math.max(1, gearRadius), R - 1);
    const d = penOffset;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const ratio = (R - r) / r;

    // The curve closes after t = 2π · r / gcd(R, r) radians. Cap the total
    // step count for near-coprime pairs so the animation can't run forever.
    const revolutions = r / gcd(R, r);
    const totalT = Math.min(2 * Math.PI * revolutions, DT * MAX_STEPS);

    // Curve can reach at most |R - r| + d from center — scale so it always
    // fits inside the canvas with a small margin, whatever R/r/d are.
    const maxReach = Math.abs(R - r) + d || 1;
    const scale = (canvas.width / 2 - 16) / maxReach;

    const point = (t: number) => ({
      x: centerX + scale * ((R - r) * Math.cos(t) + d * Math.cos(ratio * t)),
      y: centerY + scale * ((R - r) * Math.sin(t) - d * Math.sin(ratio * t)),
    });

    let t = 0;
    const start = point(0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    runningRef.current = true;
    setIsPlaying(true);

    const microstepsPerFrame = speed * 5;

    const tick = () => {
      if (!runningRef.current) return;
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = lineWidthRef.current;
      ctx.beginPath();
      ctx.moveTo(point(t).x, point(t).y);

      for (let i = 0; i < microstepsPerFrame; i++) {
        if (t >= totalT) break;
        t = Math.min(t + DT, totalT);
        const p = point(t);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      if (t >= totalT) {
        runningRef.current = false;
        rafRef.current = null;
        setIsPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [ringRadius, gearRadius, penOffset, speed]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), "spirograph.png");
  };

  // Keep the gear radius (r) valid whenever the ring radius (R) shrinks
  // below it.
  const handleRingChange = (value: number) => {
    setRingRadius(value);
    if (gearRadius >= value) setGearRadius(Math.max(1, value - 1));
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-paper-2 hover:bg-paper-2 text-ink text-sm rounded-lg transition-colors"
        >
          Clear
        </button>
        <button
          onClick={isPlaying ? stopAnimation : startDraw}
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-ink text-sm rounded-lg transition-colors"
        >
          {isPlaying ? "Stop" : "Draw"}
        </button>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-2">Speed</label>
          <input
            type="range"
            min={1}
            max={5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 accent-violet-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="ml-auto px-4 py-2 bg-violet-500 hover:bg-violet-600 text-ink text-sm rounded-lg transition-colors"
        >
          Save PNG
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-2">Ring R</label>
          <input
            type="range"
            min={30}
            max={200}
            value={ringRadius}
            onChange={(e) => handleRingChange(Number(e.target.value))}
            className="w-20 accent-violet-500"
          />
          <span className="text-xs text-ink-3">{ringRadius}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-2">Gear r</label>
          <input
            type="range"
            min={1}
            max={Math.max(1, ringRadius - 1)}
            value={Math.min(gearRadius, ringRadius - 1)}
            onChange={(e) => setGearRadius(Number(e.target.value))}
            className="w-20 accent-violet-500"
          />
          <span className="text-xs text-ink-3">{Math.min(gearRadius, ringRadius - 1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-2">Offset d</label>
          <input
            type="range"
            min={0}
            max={150}
            value={penOffset}
            onChange={(e) => setPenOffset(Number(e.target.value))}
            className="w-20 accent-violet-500"
          />
          <span className="text-xs text-ink-3">{penOffset}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-2">Width</label>
          <input
            type="range"
            min={1}
            max={8}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-violet-500"
          />
          <span className="text-xs text-ink-3">{lineWidth}px</span>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-line"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full aspect-square rounded-xl border border-line touch-none bg-paper-2"
      />
    </div>
  );
}
