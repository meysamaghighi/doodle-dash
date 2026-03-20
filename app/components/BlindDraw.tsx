"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { getDrawingStats } from "../utils/canvasStats";
import { usePersonalBest } from "../hooks/usePersonalBest";

const PROMPTS = [
  "cat", "house", "tree", "car", "fish", "star", "heart", "flower",
  "rocket", "pizza", "robot", "boat", "umbrella", "guitar", "crown",
  "cactus", "snowman", "bicycle", "mushroom", "castle",
];

type Phase = "ready" | "drawing" | "revealed";

export default function BlindDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [prompt, setPrompt] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [stats, setStats] = useState<{ coverage: number; colorsUsed: number } | null>(null);
  const pb = usePersonalBest("pb-blind-draw", "higher", phase === "revealed" && stats ? stats.coverage : null);
  const drawingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startGame = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
    setPhase("drawing");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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

  const onDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawingRef.current || phase !== "drawing") return;
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
    drawingRef.current = true;
    lastPos.current = getPos(e);
  };

  const stopDraw = () => {
    drawingRef.current = false;
    lastPos.current = null;
  };

  const reveal = () => {
    const canvas = canvasRef.current;
    if (canvas) setStats(getDrawingStats(canvas));
    setPhase("revealed");
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), `blind-draw-${prompt}.png`);
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="max-w-lg mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">
            Draw the prompt without seeing the canvas. Reveal when you're done!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Start
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold">
              Draw: <span className="text-red-400">{prompt}</span>
            </div>
            {phase === "drawing" && (
              <span className="text-sm text-gray-400">Canvas is hidden!</span>
            )}
          </div>

          {phase === "drawing" && (
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-white scale-110" : "border-gray-600"}`}
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
                className="w-24 accent-red-500"
              />
            </div>
          )}

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              className="w-full aspect-square rounded-xl border border-gray-700 touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={onDraw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={onDraw}
              onTouchEnd={stopDraw}
            />
            {phase === "drawing" && (
              <div className="absolute inset-0 bg-gray-900 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">Drawing blind...</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Your strokes are being recorded
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center mt-4">
            {phase === "drawing" && (
              <button
                onClick={reveal}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
              >
                Reveal Drawing
              </button>
            )}
            {phase === "revealed" && stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.coverage}%</div>
                  <div className="text-gray-500">Canvas used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.colorsUsed}</div>
                  <div className="text-gray-500">Colors</div>
                </div>
              </div>
            )}
            {phase === "revealed" && (
              <div className="text-center">
                {pb.isNewBest && <p className="text-yellow-400 font-bold text-sm animate-pulse">New Personal Best!</p>}
                {pb.best !== null && !pb.isNewBest && <p className="text-gray-500 text-xs">Personal Best: {pb.best}% coverage</p>}
              </div>
            )}
            {phase === "revealed" && (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={startGame}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Play Again
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
