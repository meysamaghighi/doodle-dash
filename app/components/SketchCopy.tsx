"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { compareImages } from "../utils/canvasStats";
import { usePersonalBest } from "../hooks/usePersonalBest";

type Phase = "ready" | "drawing" | "compare";

const REFERENCE_SHAPES = [
  // Level 1: Simple circle
  (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(128, 128, 60, 0, Math.PI * 2);
    ctx.fill();
  },
  // Level 2: Square
  (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(80, 80, 96, 96);
  },
  // Level 3: Triangle
  (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(128, 60);
    ctx.lineTo(180, 160);
    ctx.lineTo(76, 160);
    ctx.closePath();
    ctx.fill();
  },
  // Level 4: Star
  (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#8b5cf6";
    ctx.beginPath();
    const cx = 128, cy = 128, outerR = 70, innerR = 28;
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + (2 * Math.PI) / 10;
      const ox = cx + Math.cos(outerAngle) * outerR;
      const oy = cy + Math.sin(outerAngle) * outerR;
      const ix = cx + Math.cos(innerAngle) * innerR;
      const iy = cy + Math.sin(innerAngle) * innerR;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
  },
  // Level 5: House
  (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(70, 100, 116, 80); // body
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.moveTo(128, 50);
    ctx.lineTo(200, 100);
    ctx.lineTo(56, 100);
    ctx.closePath();
    ctx.fill(); // roof
    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(100, 130, 30, 50); // door
  },
];

export default function SketchCopy() {
  const drawRef = useRef<HTMLCanvasElement>(null);
  const refRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const pb = usePersonalBest("pb-sketch-copy", "higher", phase === "compare" ? similarity : null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startLevel = () => {
    setPhase("drawing");
    setSimilarity(null);
  };

  // Draw reference canvas when phase becomes "drawing"
  useEffect(() => {
    if (phase === "drawing") {
      // Draw reference shape
      const refCanvas = refRef.current;
      if (refCanvas) {
        const ctx = refCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, 256, 256);
          REFERENCE_SHAPES[level](ctx);
          setReferenceImage(refCanvas.toDataURL());
        }
      }

      // Clear drawing canvas
      const drawCanvas = drawRef.current;
      if (drawCanvas) {
        const ctx = drawCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, 256, 256);
        }
      }
    }
  }, [phase, level]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawRef.current!;
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

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current || phase !== "drawing") return;
      const canvas = drawRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      if (lastPos.current) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    },
    [phase, color, brushSize]
  );

  const handleCompare = async () => {
    const drawCanvas = drawRef.current;
    if (drawCanvas && referenceImage) {
      const drawUrl = drawCanvas.toDataURL();
      const score = await compareImages(referenceImage, drawUrl);
      setSimilarity(score);
    }
    setPhase("compare");
  };

  const nextLevel = () => {
    if (level < REFERENCE_SHAPES.length - 1) {
      setLevel(level + 1);
      setPhase("ready");
    } else {
      setLevel(0);
      setPhase("ready");
    }
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#006400", "#0033CC", "#8b5cf6", "#ec4899", "#8B4513"];

  return (
    <div className="max-w-2xl mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-ink-2 mb-2">Level {level + 1} of {REFERENCE_SHAPES.length}</p>
          <p className="text-ink-2 mb-6">
            Copy the shape on the left as accurately as you can!
          </p>
          <button
            onClick={startLevel}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-ink font-bold rounded-xl transition-colors text-lg"
          >
            Start
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <div>
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-teal-400">
              Level {level + 1} - {phase === "drawing" ? "Copy the shape!" : `${similarity}% Match`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-center text-sm text-ink-2 mb-2">Reference</p>
              <canvas
                ref={refRef}
                width={256}
                height={256}
                className="w-full aspect-square rounded-xl border border-line"
              />
            </div>
            <div>
              <p className="text-center text-sm text-ink-2 mb-2">Your Drawing</p>
              <canvas
                ref={drawRef}
                width={256}
                height={256}
                className="w-full aspect-square rounded-xl border border-line cursor-crosshair touch-none"
                onMouseDown={(e) => {
                  if (phase !== "drawing") return;
                  drawing.current = true;
                  lastPos.current = getPos(e);
                }}
                onMouseMove={draw}
                onMouseUp={() => {
                  drawing.current = false;
                  lastPos.current = null;
                }}
                onMouseLeave={() => {
                  drawing.current = false;
                  lastPos.current = null;
                }}
                onTouchStart={(e) => {
                  if (phase !== "drawing") return;
                  drawing.current = true;
                  lastPos.current = getPos(e);
                }}
                onTouchMove={draw}
                onTouchEnd={() => {
                  drawing.current = false;
                  lastPos.current = null;
                }}
              />
            </div>
          </div>

          {phase === "drawing" && (
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-white scale-110" : "border-line"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-teal-500"
              />
              <button
                onClick={handleCompare}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-ink font-bold rounded-lg"
              >
                Compare
              </button>
            </div>
          )}

          {phase === "compare" && similarity !== null && (
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">{similarity}%</div>
              <p className="text-ink-2 text-sm mb-2">
                {similarity >= 80 ? "Excellent copy!" : similarity >= 60 ? "Good job!" : similarity >= 40 ? "Not bad!" : "Keep trying!"}
              </p>
              {pb.isNewBest && <p className="text-yellow-400 font-bold text-sm animate-pulse">New Personal Best!</p>}
              {pb.best !== null && !pb.isNewBest && <p className="text-ink-3 text-xs">Personal Best: {pb.best}%</p>}
              <div className="flex gap-3 justify-center mt-4">
                <button
                  onClick={startLevel}
                  className="px-5 py-2 bg-paper-2 hover:bg-paper-2 text-ink rounded-lg"
                >
                  Retry
                </button>
                <button
                  onClick={nextLevel}
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-ink font-bold rounded-lg"
                >
                  {level < REFERENCE_SHAPES.length - 1 ? "Next Level" : "Restart"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
