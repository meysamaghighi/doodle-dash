"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { getDrawingStats } from "../utils/canvasStats";
import { usePersonalBest } from "../hooks/usePersonalBest";

const PROMPTS = [
  "cat", "house", "tree", "sun", "car", "fish", "star", "heart", "flower",
  "rocket", "pizza", "ghost", "robot", "mountain", "boat", "umbrella",
  "guitar", "crown", "cactus", "snowman", "bicycle", "butterfly", "mushroom",
  "whale", "castle", "lightning", "alien", "cupcake", "dragon", "penguin",
];

type Phase = "ready" | "drawing" | "done";

export default function SpeedSketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [prompt, setPrompt] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [stats, setStats] = useState<{ coverage: number; colorsUsed: number } | null>(null);
  const pb = usePersonalBest("pb-speed-sketch", "higher", phase === "done" && stats ? stats.coverage : null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startGame = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
    setTimeLeft(30);
    setPhase("drawing");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    if (phase !== "drawing") return;
    if (timeLeft <= 0) {
      const canvas = canvasRef.current;
      if (canvas) setStats(getDrawingStats(canvas));
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

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
      if (!drawing.current || phase !== "drawing") return;
      const canvas = canvasRef.current!;
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

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "drawing") return;
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
    saveImage(canvas.toDataURL(), `doodlelab-${prompt}.png`);
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#000000"];

  return (
    <div className="max-w-lg mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">
            You have 30 seconds to draw the prompt. Ready?
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Start Drawing
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold">
              Draw: <span className="text-orange-400">{prompt}</span>
            </div>
            {phase === "drawing" && (
              <div
                className={`text-lg font-mono font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-gray-300"}`}
              >
                {timeLeft}s
              </div>
            )}
            {phase === "done" && (
              <span className="text-sm text-gray-400">Time's up!</span>
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

          {phase === "drawing" && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
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
              <input
                type="range"
                min={1}
                max={20}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-orange-500"
              />
              <span className="text-xs text-gray-500">{brushSize}px</span>
            </div>
          )}

          {phase === "done" && stats && (
            <div className="mt-3 flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.coverage}%</div>
                <div className="text-gray-500">Canvas used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.colorsUsed}</div>
                <div className="text-gray-500">Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.coverage >= 15 ? (stats.colorsUsed >= 3 ? "A" : "B") : (stats.coverage >= 5 ? "C" : "D")}
                </div>
                <div className="text-gray-500">Grade</div>
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="text-center mt-2">
              {pb.isNewBest && <p className="text-yellow-400 font-bold text-sm animate-pulse">New Personal Best!</p>}
              {pb.best !== null && !pb.isNewBest && <p className="text-gray-500 text-xs">Personal Best: {pb.best}% coverage</p>}
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
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
