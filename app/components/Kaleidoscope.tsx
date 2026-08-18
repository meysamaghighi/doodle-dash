"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { saveImage } from "../utils/saveImage";
import {
  type InkId,
  type PaperId,
  INKS,
  INK_ORDER,
  drawInkSegment,
  segmentLength,
  PAPERS,
  PAPER_ORDER,
  paintPaper,
} from "../lib/supplies";

const DEFAULT_BG = "#111827";

// "none" keeps DoodleLab's original flat-dark background as a real, always-
// available option alongside the Art Box papers — it is not itself an Art
// Box reward, so it lives here rather than in papers.ts.
type PaperChoice = PaperId | "none";

export default function Kaleidoscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [segments, setSegments] = useState(8);
  const [ink, setInk] = useState<InkId>("plain");
  const [paper, setPaper] = useState<PaperChoice>("none");
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  // Cumulative distance travelled along the current stroke, in canvas px —
  // drives the rainbow ink's hue ramp. Reset on every pointer-down.
  const strokeProgress = useRef(0);

  const paintBackground = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    if (paper === "none") {
      ctx.fillStyle = DEFAULT_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      paintPaper(ctx, paper, canvas.width, canvas.height);
    }
  }, [paper]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintBackground(canvas);
    // Re-paint whenever the chosen paper changes, same as the initial mount
    // paint — a supply swap should be visible immediately, not just on the
    // next Clear.
  }, [paintBackground]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) paintBackground(canvas);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawMirroredStroke = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const from = { x: fromX, y: fromY };
      const to = { x: toX, y: toY };

      // Advance once per real pointer-move, not once per mirror copy below —
      // otherwise the rainbow ink would cycle N-times-segments as fast as
      // intended, since every mirrored copy would each bump the ramp.
      strokeProgress.current += segmentLength(from, to);
      const inkOptions = { color, lineWidth: brushSize, progress: strokeProgress.current };

      // Draw in all segments
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

        drawInkSegment(ctx, ink, from, to, inkOptions);

        // Mirror horizontally within each segment
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        drawInkSegment(ctx, ink, from, to, inkOptions);

        ctx.restore();
      }
    },
    [color, brushSize, segments, ink]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      const pos = getPos(e);
      if (lastPos.current) {
        drawMirroredStroke(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
      }
      lastPos.current = pos;
    },
    [drawMirroredStroke]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    strokeProgress.current = 0;
    drawMirroredStroke(pos.x, pos.y, pos.x, pos.y);
  };

  const stopDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), "kaleidoscope.png");
  };

  const COLORS = [
    "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#006400",
    "#0033CC", "#8b5cf6", "#ec4899", "#f43f5e", "#8B4513", "#84cc16"
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-paper-2 hover:bg-paper-2 text-ink text-sm rounded-lg transition-colors"
        >
          Clear
        </button>
        <select
          value={segments}
          onChange={(e) => {
            setSegments(Number(e.target.value));
            clearCanvas();
          }}
          className="bg-paper-2 text-ink-2 text-sm rounded-lg px-3 py-2 border border-line"
        >
          <option value={4}>4-way</option>
          <option value={6}>6-way</option>
          <option value={8}>8-way</option>
          <option value={12}>12-way</option>
        </select>
        <input
          type="range"
          min={1}
          max={20}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 accent-purple-500"
        />
        <span className="text-xs text-ink-3">{brushSize}px</span>
        <button
          onClick={handleSave}
          className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 text-ink text-sm rounded-lg transition-colors"
        >
          Save
        </button>
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

      {/* Art Box supplies. Everything is unlocked here for now — the unlock
          gate lives elsewhere and wires in later; this is only the reference
          integration showing the supplies library actually works. */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-ink-2">
          Ink
          <select
            value={ink}
            onChange={(e) => setInk(e.target.value as InkId)}
            className="bg-paper-2 text-ink-2 text-sm rounded-lg px-3 py-1.5 border border-line"
          >
            {INK_ORDER.map((id) => (
              <option key={id} value={id}>
                {INKS[id].emoji} {INKS[id].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-2">
          Paper
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value as PaperChoice)}
            className="bg-paper-2 text-ink-2 text-sm rounded-lg px-3 py-1.5 border border-line"
          >
            <option value="none">Plain</option>
            {PAPER_ORDER.map((id) => (
              <option key={id} value={id}>
                {PAPERS[id].emoji} {PAPERS[id].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full aspect-square rounded-xl border border-line cursor-crosshair touch-none bg-paper-2"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
}
