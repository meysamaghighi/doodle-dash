"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { usePersonalBest } from "../hooks/usePersonalBest";

type Phase = "ready" | "playing" | "done";

interface Dot {
  x: number;
  y: number;
  number: number;
}

interface Segment {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const LEVELS = [
  { dots: 5, name: "Beginner" },
  { dots: 8, name: "Easy" },
  { dots: 12, name: "Medium" },
  { dots: 16, name: "Hard" },
  { dots: 20, name: "Expert" },
];

export default function DotConnect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [dots, setDots] = useState<Dot[]>([]);
  const [currentDot, setCurrentDot] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const pb = usePersonalBest("pb-dot-connect", "lower", completionTime);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  // Store completed segments (dot-to-dot connections) and freehand strokes
  const segmentsRef = useRef<Segment[]>([]);
  const freehandRef = useRef<Segment[]>([]);

  const generateDots = (count: number): Dot[] => {
    const margin = 60;
    const result: Dot[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        x: margin + Math.random() * (512 - 2 * margin),
        y: margin + Math.random() * (512 - 2 * margin),
        number: i + 1,
      });
    }
    return result;
  };

  const startGame = () => {
    const newDots = generateDots(LEVELS[level].dots);
    setDots(newDots);
    setCurrentDot(1);
    setPhase("playing");
    setStartTime(Date.now());
    setCompletionTime(null);
    segmentsRef.current = [];
    freehandRef.current = [];
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dots.length === 0) return;
    const ctx = canvas.getContext("2d")!;

    // Clear
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw completed connection lines (dot-to-dot)
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const seg of segmentsRef.current) {
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.stroke();
    }

    // Draw freehand strokes
    for (const seg of freehandRef.current) {
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.stroke();
    }

    // Draw dots
    dots.forEach((dot) => {
      const isNext = dot.number === currentDot;
      const isPast = dot.number < currentDot;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, isNext ? 14 : 10, 0, Math.PI * 2);
      ctx.fillStyle = isPast ? "#22c55e" : isNext ? "#f97316" : "#ffffff";
      ctx.fill();

      // Pulsing ring on next dot
      if (isNext) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "#f9731680";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
      }

      ctx.font = isPast ? "12px sans-serif" : isNext ? "bold 14px sans-serif" : "12px sans-serif";
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(dot.number), dot.x, dot.y);
    });
  }, [dots, currentDot]);

  useEffect(() => {
    if (phase === "playing" || phase === "done") {
      redrawCanvas();
    }
  }, [phase, redrawCanvas]);

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
      if (!drawing.current || phase !== "playing") return;
      const pos = getPos(e);

      // Check if near next dot
      const nextDot = dots.find((d) => d.number === currentDot);
      if (nextDot) {
        const dx = pos.x - nextDot.x;
        const dy = pos.y - nextDot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          // Add a connection line from previous dot to this dot
          if (currentDot > 1) {
            const prevDot = dots.find((d) => d.number === currentDot - 1);
            if (prevDot) {
              segmentsRef.current.push({
                from: { x: prevDot.x, y: prevDot.y },
                to: { x: nextDot.x, y: nextDot.y },
              });
            }
          }

          if (currentDot === dots.length) {
            const time = ((Date.now() - startTime) / 1000).toFixed(2);
            setCompletionTime(parseFloat(time));
            setCurrentDot(currentDot + 1);
            setPhase("done");
            return;
          }
          setCurrentDot((c) => c + 1);
        }
      }

      // Draw freehand stroke
      if (lastPos.current) {
        freehandRef.current.push({
          from: { x: lastPos.current.x, y: lastPos.current.y },
          to: { x: pos.x, y: pos.y },
        });
        // Incremental draw (no full redraw needed)
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d")!;
          ctx.beginPath();
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(lastPos.current.x, lastPos.current.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
      }
      lastPos.current = pos;
    },
    [phase, dots, currentDot, startTime]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "playing") return;
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
    saveImage(canvas.toDataURL(), `doodlelab-dot-connect.png`);
  };

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(level + 1);
      setPhase("ready");
    } else {
      startGame();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            Level {level + 1}: {LEVELS[level].name}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Connect {LEVELS[level].dots} dots in order as fast as you can.
          </p>
          <div className="flex gap-3 justify-center">
            {level > 0 && (
              <button
                onClick={() => setLevel(level - 1)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Previous Level
              </button>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Start
            </button>
            {level < LEVELS.length - 1 && (
              <button
                onClick={() => setLevel(level + 1)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Next Level
              </button>
            )}
          </div>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              Level {level + 1}: {LEVELS[level].name}
            </div>
            {phase === "playing" && (
              <div className="text-sm font-mono text-gray-300">
                Dot {Math.min(currentDot, dots.length)} of {dots.length}
              </div>
            )}
            {phase === "done" && completionTime && (
              <div className="text-lg font-bold text-orange-400">
                {completionTime}s
              </div>
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

          {phase === "playing" && (
            <p className="text-center text-gray-500 text-sm mt-3">
              Draw lines connecting the dots in numerical order
            </p>
          )}

          {phase === "done" && completionTime && (
            <div className="mt-3 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {completionTime} seconds
              </div>
              <div className="text-gray-500 text-sm">Completion Time</div>
              {pb.isNewBest && (
                <p className="text-yellow-400 font-bold text-sm animate-pulse mt-2">
                  New Personal Best!
                </p>
              )}
              {pb.best !== null && !pb.isNewBest && (
                <p className="text-gray-500 text-xs mt-2">
                  Personal Best: {pb.best}s
                </p>
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
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Play Again
              </button>
              {level < LEVELS.length - 1 && (
                <button
                  onClick={nextLevel}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Next Level
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
