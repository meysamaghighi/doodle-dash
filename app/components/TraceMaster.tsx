"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { compareImages } from "../utils/canvasStats";
import { usePersonalBest } from "../hooks/usePersonalBest";

type Phase = "ready" | "tracing" | "done";

interface Shape {
  name: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const SHAPES: Shape[] = [
  {
    name: "Circle",
    draw: (ctx, w, h) => {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    name: "Star",
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2, r = 120;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r / 2;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    },
  },
  {
    name: "Heart",
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2 + 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx, cy - 30, cx - 60, cy - 80, cx - 80, cy - 60);
      ctx.bezierCurveTo(cx - 100, cy - 40, cx - 100, cy - 10, cx - 80, cy + 10);
      ctx.bezierCurveTo(cx - 60, cy + 30, cx, cy + 60, cx, cy + 80);
      ctx.bezierCurveTo(cx, cy + 60, cx + 60, cy + 30, cx + 80, cy + 10);
      ctx.bezierCurveTo(cx + 100, cy - 10, cx + 100, cy - 40, cx + 80, cy - 60);
      ctx.bezierCurveTo(cx + 60, cy - 80, cx, cy - 30, cx, cy);
      ctx.stroke();
    },
  },
  {
    name: "Spiral",
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      let r = 5;
      for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        r += 0.8;
      }
      ctx.stroke();
    },
  },
  {
    name: "Wave",
    draw: (ctx, w, h) => {
      ctx.beginPath();
      ctx.moveTo(50, h / 2);
      for (let x = 50; x < w - 50; x += 5) {
        const y = h / 2 + Math.sin((x - 50) * 0.03) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  },
  {
    name: "Square",
    draw: (ctx, w, h) => {
      const size = 200;
      ctx.strokeRect((w - size) / 2, (h - size) / 2, size, size);
    },
  },
  {
    name: "Triangle",
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 100);
      ctx.lineTo(cx - 100, cy + 80);
      ctx.lineTo(cx + 100, cy + 80);
      ctx.closePath();
      ctx.stroke();
    },
  },
  {
    name: "Infinity",
    draw: (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      const a = 80;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const x = cx + (a * Math.cos(t)) / (1 + Math.sin(t) ** 2);
        const y = cy + (a * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  },
];

export default function TraceMaster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [shapeIndex, setShapeIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const pb = usePersonalBest("pb-trace-master", "higher", score);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#22c55e");

  const shape = SHAPES[shapeIndex];

  const drawGhostShape = useCallback(() => {
    const canvas = ghostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    shape.draw(ctx, canvas.width, canvas.height);
  }, [shape]);

  const startGame = () => {
    setPhase("tracing");
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faded ghost shape
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      shape.draw(ctx, canvas.width, canvas.height);
      ctx.restore();
    }
    drawGhostShape();
  };

  useEffect(() => {
    if (phase === "tracing") {
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase, startTime]);

  const finishTrace = async () => {
    const canvas = canvasRef.current;
    const ghostCanvas = ghostCanvasRef.current;
    if (!canvas || !ghostCanvas) return;

    // Calculate score
    const refDataUrl = ghostCanvas.toDataURL();
    const drawDataUrl = canvas.toDataURL();
    const similarity = await compareImages(refDataUrl, drawDataUrl);
    setScore(similarity);
    setPhase("done");
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

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current || phase !== "tracing") return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      if (lastPos.current) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    },
    [phase, color]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "tracing") return;
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const stopDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), `doodlelab-trace-${shape.name}.png`);
  };

  const nextShape = () => {
    if (shapeIndex < SHAPES.length - 1) {
      setShapeIndex(shapeIndex + 1);
      setPhase("ready");
    } else {
      startGame();
    }
  };

  const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#ec4899", "#eab308", "#8b5cf6", "#ffffff"];

  return (
    <div className="max-w-lg mx-auto">
      <canvas ref={ghostCanvasRef} width={512} height={512} className="hidden" />

      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            Shape {shapeIndex + 1} of {SHAPES.length}: {shape.name}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Trace over the faded shape as accurately as you can.
          </p>
          <div className="flex gap-3 justify-center">
            {shapeIndex > 0 && (
              <button
                onClick={() => setShapeIndex(shapeIndex - 1)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Previous Shape
              </button>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Start Tracing
            </button>
            {shapeIndex < SHAPES.length - 1 && (
              <button
                onClick={() => setShapeIndex(shapeIndex + 1)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Next Shape
              </button>
            )}
          </div>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              {shape.name} ({shapeIndex + 1}/{SHAPES.length})
            </div>
            {phase === "tracing" && (
              <div className="text-sm font-mono text-gray-300">
                {elapsedTime.toFixed(1)}s
              </div>
            )}
            {phase === "done" && score !== null && (
              <div className="text-lg font-bold text-green-400">{score}%</div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="w-full aspect-square rounded-xl border border-gray-700 cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          {phase === "tracing" && (
            <div className="mt-3 flex items-center gap-3 flex-wrap justify-between">
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-gray-600"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={finishTrace}
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}

          {phase === "done" && score !== null && (
            <div className="mt-3 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{score}%</div>
              <div className="text-gray-500 text-sm mb-1">Accuracy</div>
              <div className="text-xs text-gray-600">
                Time: {elapsedTime.toFixed(1)}s
              </div>
              {pb.isNewBest && (
                <p className="text-yellow-400 font-bold text-sm animate-pulse mt-2">
                  New Personal Best!
                </p>
              )}
              {pb.best !== null && !pb.isNewBest && (
                <p className="text-gray-500 text-xs mt-2">Personal Best: {pb.best}%</p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Save Drawing
              </button>
              <button
                onClick={startGame}
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              {shapeIndex < SHAPES.length - 1 && (
                <button
                  onClick={nextShape}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next Shape
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
