"use client";

import { useState, useRef, useEffect } from "react";
import { usePersonalBest } from "../hooks/usePersonalBest";

type ShapeType = "circle" | "square" | "triangle";
type PlacedShape = { type: ShapeType; x: number; y: number; size: number; color: string };
type TargetShape = { type: ShapeType; x: number; y: number; size: number; color: string };

const LEVELS: TargetShape[][] = [
  // Level 1: Single circle
  [{ type: "circle", x: 128, y: 128, size: 60, color: "#3b82f6" }],
  // Level 2: Two shapes
  [
    { type: "square", x: 90, y: 128, size: 50, color: "#22c55e" },
    { type: "circle", x: 180, y: 128, size: 40, color: "#eab308" },
  ],
  // Level 3: Triangle on square
  [
    { type: "square", x: 128, y: 150, size: 70, color: "#ef4444" },
    { type: "triangle", x: 128, y: 100, size: 60, color: "#8b5cf6" },
  ],
  // Level 4: Simple house
  [
    { type: "square", x: 128, y: 160, size: 90, color: "#ef4444" },
    { type: "triangle", x: 128, y: 90, size: 80, color: "#b91c1c" },
    { type: "square", x: 128, y: 180, size: 30, color: "#7c3aed" },
  ],
  // Level 5: Snowman
  [
    { type: "circle", x: 128, y: 180, size: 60, color: "#ffffff" },
    { type: "circle", x: 128, y: 110, size: 45, color: "#ffffff" },
    { type: "circle", x: 128, y: 60, size: 30, color: "#ffffff" },
  ],
  // Level 6: Robot
  [
    { type: "square", x: 128, y: 150, size: 70, color: "#6366f1" },
    { type: "square", x: 128, y: 90, size: 50, color: "#6366f1" },
    { type: "circle", x: 110, y: 85, size: 10, color: "#ffffff" },
    { type: "circle", x: 146, y: 85, size: 10, color: "#ffffff" },
  ],
  // Level 7: Tree
  [
    { type: "square", x: 128, y: 200, size: 30, color: "#78716c" },
    { type: "triangle", x: 128, y: 160, size: 70, color: "#22c55e" },
    { type: "triangle", x: 128, y: 120, size: 60, color: "#22c55e" },
    { type: "triangle", x: 128, y: 85, size: 50, color: "#22c55e" },
  ],
  // Level 8: Car
  [
    { type: "square", x: 128, y: 150, size: 80, color: "#ef4444" },
    { type: "circle", x: 95, y: 185, size: 20, color: "#000000" },
    { type: "circle", x: 161, y: 185, size: 20, color: "#000000" },
    { type: "square", x: 128, y: 130, size: 40, color: "#93c5fd" },
  ],
  // Level 9: Castle
  [
    { type: "square", x: 80, y: 170, size: 60, color: "#78716c" },
    { type: "square", x: 176, y: 170, size: 60, color: "#78716c" },
    { type: "square", x: 128, y: 180, size: 50, color: "#78716c" },
    { type: "triangle", x: 80, y: 125, size: 30, color: "#ef4444" },
    { type: "triangle", x: 176, y: 125, size: 30, color: "#ef4444" },
  ],
  // Level 10: Complex pattern
  [
    { type: "circle", x: 128, y: 128, size: 80, color: "#8b5cf6" },
    { type: "square", x: 128, y: 128, size: 50, color: "#ec4899" },
    { type: "triangle", x: 128, y: 128, size: 40, color: "#eab308" },
    { type: "circle", x: 128, y: 128, size: 20, color: "#ffffff" },
  ],
];

type Phase = "ready" | "building" | "done";

export default function ShapeBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);
  const [selectedType, setSelectedType] = useState<ShapeType>("circle");
  const [score, setScore] = useState<number | null>(null);
  const pb = usePersonalBest("pb-shape-builder", "higher", phase === "done" ? score : null);
  const [draggedShape, setDraggedShape] = useState<PlacedShape | null>(null);

  const startLevel = () => {
    setPhase("building");
    setPlacedShapes([]);
    setScore(null);
  };

  // Draw target canvas when phase becomes "building"
  useEffect(() => {
    if (phase === "building") {
      // Draw target
      const target = LEVELS[level];
      const canvas = targetRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, 256, 256);
          target.forEach((shape) => drawShapeOnCanvas(ctx, shape));
        }
      }

      // Clear working canvas
      const workCanvas = canvasRef.current;
      if (workCanvas) {
        const ctx = workCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, 256, 256);
        }
      }
    }
  }, [phase, level]);

  const drawShapeOnCanvas = (ctx: CanvasRenderingContext2D, shape: { type: ShapeType; x: number; y: number; size: number; color: string }) => {
    ctx.fillStyle = shape.color;
    ctx.beginPath();

    switch (shape.type) {
      case "circle":
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        break;
      case "square":
        ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        break;
      case "triangle": {
        const h = shape.size / 2;
        ctx.moveTo(shape.x, shape.y - h);
        ctx.lineTo(shape.x + h * 0.866, shape.y + h * 0.5);
        ctx.lineTo(shape.x - h * 0.866, shape.y + h * 0.5);
        ctx.closePath();
        break;
      }
    }
    ctx.fill();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, 256, 256);
    placedShapes.forEach((shape) => drawShapeOnCanvas(ctx, shape));
    if (draggedShape) {
      ctx.globalAlpha = 0.7;
      drawShapeOnCanvas(ctx, draggedShape);
      ctx.globalAlpha = 1;
    }
  };

  useEffect(() => {
    if (phase === "building") {
      redrawCanvas();
    }
  }, [placedShapes, draggedShape, phase]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "building") return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Generate a color based on shape type for variety
    const colors: Record<ShapeType, string> = {
      circle: "#3b82f6",
      square: "#22c55e",
      triangle: "#eab308",
    };

    const newShape: PlacedShape = {
      type: selectedType,
      x,
      y,
      size: 50,
      color: colors[selectedType],
    };

    setPlacedShapes([...placedShapes, newShape]);
  };

  const checkScore = () => {
    const target = LEVELS[level];
    if (placedShapes.length === 0) {
      setScore(0);
      setPhase("done");
      return;
    }

    let totalError = 0;
    let matched = 0;

    // For each target shape, find closest placed shape
    target.forEach((tShape) => {
      let minDist = Infinity;
      placedShapes.forEach((pShape) => {
        if (pShape.type === tShape.type) {
          const dist = Math.sqrt((pShape.x - tShape.x) ** 2 + (pShape.y - tShape.y) ** 2);
          const sizeDiff = Math.abs(pShape.size - tShape.size);
          const totalDiff = dist + sizeDiff;
          if (totalDiff < minDist) minDist = totalDiff;
        }
      });
      if (minDist < Infinity) {
        totalError += minDist;
        matched++;
      }
    });

    // Penalty for extra shapes
    const extraShapes = Math.max(0, placedShapes.length - target.length);
    totalError += extraShapes * 50;

    // Calculate score (0-100, lower error = higher score)
    const maxError = target.length * 100 + extraShapes * 50;
    const rawScore = Math.max(0, 100 - (totalError / maxError) * 100);
    const finalScore = Math.round(rawScore);

    setScore(finalScore);
    setPhase("done");
  };

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(level + 1);
      setPhase("ready");
    } else {
      setLevel(0);
      setPhase("ready");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-ink-2 mb-2">Level {level + 1} of {LEVELS.length}</p>
          <p className="text-ink-2 mb-6">
            Build the target image using shapes!
          </p>
          <button
            onClick={startLevel}
            className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-ink font-bold rounded-xl transition-colors text-lg"
          >
            Start
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <div>
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-pink-400">
              Level {level + 1} - {phase === "done" ? `Score: ${score}%` : "Drag shapes to build!"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-center text-sm text-ink-2 mb-2">Target</p>
              <canvas
                ref={targetRef}
                width={256}
                height={256}
                className="w-full aspect-square rounded-xl border border-line"
              />
            </div>
            <div>
              <p className="text-center text-sm text-ink-2 mb-2">Your Build</p>
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="w-full aspect-square rounded-xl border border-line cursor-crosshair touch-none"
                onClick={handleCanvasClick}
                onTouchEnd={handleCanvasClick}
              />
            </div>
          </div>

          {phase === "building" && (
            <div className="text-center space-y-3">
              <div className="flex gap-2 justify-center">
                {(["circle", "square", "triangle"] as ShapeType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 text-sm capitalize rounded-lg ${selectedType === type ? "bg-pink-500 text-ink" : "bg-paper-2 text-ink-2 hover:bg-paper-2"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setPlacedShapes([]);
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext("2d")!;
                      ctx.fillStyle = "#111827";
                      ctx.fillRect(0, 0, 256, 256);
                    }
                  }}
                  className="px-4 py-2 bg-paper-2 hover:bg-paper-2 text-ink text-sm rounded-lg"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (placedShapes.length > 0) {
                      setPlacedShapes(placedShapes.slice(0, -1));
                    }
                  }}
                  className="px-4 py-2 bg-paper-2 hover:bg-paper-2 text-ink text-sm rounded-lg"
                >
                  Undo
                </button>
                <button
                  onClick={checkScore}
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-ink font-bold rounded-lg"
                >
                  Check
                </button>
              </div>
            </div>
          )}

          {phase === "done" && score !== null && (
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">{score}%</div>
              <p className="text-ink-2 text-sm mb-2">
                {score >= 80 ? "Perfect build!" : score >= 60 ? "Good job!" : score >= 40 ? "Not bad!" : "Keep trying!"}
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
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-ink font-bold rounded-lg"
                >
                  {level < LEVELS.length - 1 ? "Next Level" : "Restart"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
