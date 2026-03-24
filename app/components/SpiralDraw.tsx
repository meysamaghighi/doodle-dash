"use client";

import { useState, useRef, useCallback } from "react";
import { usePersonalBest } from "../hooks/usePersonalBest";

type Phase = "ready" | "drawing" | "done";

export default function SpiralDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [score, setScore] = useState<number | null>(null);
  const pb = usePersonalBest("pb-spiral-draw", "higher", phase === "done" ? score : null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const points = useRef<{ x: number; y: number }[]>([]);

  const startGame = () => {
    setPhase("drawing");
    setScore(null);
    points.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw center dot as reference
      ctx.fillStyle = "#4b5563";
      ctx.beginPath();
      ctx.arc(256, 256, 4, 0, Math.PI * 2);
      ctx.fill();
    }
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
        points.current.push(pos);
      }
      lastPos.current = pos;
    },
    [phase, color, brushSize]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "drawing") return;
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    points.current.push(pos);
  };

  const stopDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const analyzeSpiral = () => {
    const pts = points.current;
    if (pts.length < 10) {
      setScore(0);
      setPhase("done");
      return;
    }

    const centerX = 256;
    const centerY = 256;

    // Calculate distances from center and angles
    const distances = pts.map((p) =>
      Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
    );
    const angles = pts.map((p) => Math.atan2(p.y - centerY, p.x - centerX));

    // Check if distances increase smoothly (spiral outward)
    let smoothness = 0;
    for (let i = 1; i < distances.length; i++) {
      const diff = distances[i] - distances[i - 1];
      if (diff >= 0 && diff < 5) smoothness++;
    }
    const smoothnessRatio = smoothness / (distances.length - 1);

    // Check if we cover a good range of angles (full rotations)
    const angleChanges = [];
    for (let i = 1; i < angles.length; i++) {
      let change = angles[i] - angles[i - 1];
      // Handle wrap-around
      if (change > Math.PI) change -= 2 * Math.PI;
      if (change < -Math.PI) change += 2 * Math.PI;
      angleChanges.push(change);
    }
    const totalRotation = Math.abs(angleChanges.reduce((a, b) => a + b, 0)) / (2 * Math.PI);

    // Check roundness (distance variation should be low at each rotation)
    let roundness = 1;
    if (distances.length > 0) {
      const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
      const variance = distances.reduce((sum, d) => sum + (d - avgDist) ** 2, 0) / distances.length;
      const stdDev = Math.sqrt(variance);
      roundness = Math.max(0, 1 - stdDev / 50);
    }

    // Final score: combination of smoothness, rotations, and roundness
    const finalScore = Math.round(
      (smoothnessRatio * 40 + Math.min(totalRotation * 20, 40) + roundness * 20)
    );
    setScore(Math.min(100, finalScore));
    setPhase("done");
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="max-w-lg mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">
            Draw a spiral from the center outward. Try to make it smooth and round!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Start Drawing
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-indigo-400">Draw a Spiral</div>
            {phase === "done" && score !== null && (
              <div className="text-lg font-bold text-indigo-400">{score}% Score</div>
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
                className="w-24 accent-indigo-500"
              />
              <span className="text-xs text-gray-500">{brushSize}px</span>
              <button
                onClick={analyzeSpiral}
                className="ml-auto px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {phase === "done" && score !== null && (
            <div className="mt-3 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">{score}%</div>
              <div className="text-gray-500 text-sm mb-2">
                {score >= 80 ? "Perfect spiral!" : score >= 60 ? "Good spiral!" : score >= 40 ? "Not bad!" : "Keep practicing!"}
              </div>
              {pb.isNewBest && <p className="text-yellow-400 font-bold text-sm animate-pulse">New Personal Best!</p>}
              {pb.best !== null && !pb.isNewBest && <p className="text-gray-500 text-xs">Personal Best: {pb.best}%</p>}
              <button
                onClick={startGame}
                className="mt-3 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
