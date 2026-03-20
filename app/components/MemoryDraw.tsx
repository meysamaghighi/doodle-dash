"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Shape {
  type: "circle" | "rect" | "triangle" | "star";
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

function generateShapes(level: number): Shape[] {
  const count = Math.min(1 + level, 5);
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6"];
  const types: Shape["type"][] = ["circle", "rect", "triangle", "star"];
  const shapes: Shape[] = [];
  for (let i = 0; i < count; i++) {
    shapes.push({
      type: types[Math.floor(Math.random() * types.length)],
      x: 80 + Math.random() * 352,
      y: 80 + Math.random() * 352,
      size: 30 + Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
    });
  }
  return shapes;
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();
  ctx.translate(shape.x, shape.y);
  ctx.rotate(shape.rotation);
  ctx.fillStyle = shape.color;
  ctx.beginPath();

  switch (shape.type) {
    case "circle":
      ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
      break;
    case "rect":
      ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
      break;
    case "triangle": {
      const r = shape.size / 2;
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.866, r * 0.5);
      ctx.lineTo(-r * 0.866, r * 0.5);
      ctx.closePath();
      break;
    }
    case "star": {
      const outer = shape.size / 2;
      const inner = outer * 0.4;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const ax = Math.cos(angle) * outer;
        const ay = Math.sin(angle) * outer;
        const bAngle = angle + (2 * Math.PI) / 10;
        const bx = Math.cos(bAngle) * inner;
        const by = Math.sin(bAngle) * inner;
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
      }
      ctx.closePath();
      break;
    }
  }
  ctx.fill();
  ctx.restore();
}

type Phase = "ready" | "memorize" | "draw" | "compare";

export default function MemoryDraw() {
  const drawRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(1);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [memorizeTime, setMemorizeTime] = useState(0);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [drawingImage, setDrawingImage] = useState<string | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  // Off-screen canvas for generating the reference image
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const startRound = useCallback(() => {
    const newShapes = generateShapes(level);
    setPhase("memorize");
    setReferenceImage(null);
    setDrawingImage(null);

    const duration = Math.max(2, 5 - level * 0.5);
    setMemorizeTime(Math.ceil(duration));

    // Draw reference on an offscreen canvas and capture as data URL
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
      offscreenRef.current.width = 512;
      offscreenRef.current.height = 512;
    }
    const offCtx = offscreenRef.current.getContext("2d")!;
    offCtx.fillStyle = "#111827";
    offCtx.fillRect(0, 0, 512, 512);
    newShapes.forEach((s) => drawShape(offCtx, s));
    setReferenceImage(offscreenRef.current.toDataURL());

    setTimeout(() => {
      setPhase("draw");
      const drawCanvas = drawRef.current;
      if (drawCanvas) {
        const ctx = drawCanvas.getContext("2d")!;
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, 512, 512);
      }
    }, duration * 1000);
  }, [level]);

  useEffect(() => {
    if (phase !== "memorize") return;
    if (memorizeTime <= 0) return;
    const t = setTimeout(() => setMemorizeTime((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, memorizeTime]);

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

  const onDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawingRef.current || phase !== "draw") return;
      const canvas = drawRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      if (lastPosRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPosRef.current = pos;
    },
    [phase, color, brushSize]
  );

  const handleCompare = () => {
    // Capture the drawing canvas before unmounting it
    const drawCanvas = drawRef.current;
    if (drawCanvas) {
      setDrawingImage(drawCanvas.toDataURL());
    }
    setPhase("compare");
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="max-w-2xl mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">Level {level}</p>
          <p className="text-gray-400 mb-6">
            Study the shapes carefully, then draw them from memory.
          </p>
          <button
            onClick={startRound}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Start
          </button>
        </div>
      )}

      {phase === "memorize" && (
        <div>
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-yellow-400">
              Memorize! {memorizeTime}s
            </span>
          </div>
          {referenceImage && (
            <img
              src={referenceImage}
              alt="Shapes to memorize"
              className="w-full max-w-lg mx-auto aspect-square rounded-xl border border-gray-700"
            />
          )}
        </div>
      )}

      {phase === "draw" && (
        <div>
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-green-400">
              Now draw what you remember!
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
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
              className="w-24 accent-green-500"
            />
          </div>
          <canvas
            ref={drawRef}
            width={512}
            height={512}
            className="w-full max-w-lg mx-auto aspect-square rounded-xl border border-gray-700 cursor-crosshair touch-none"
            onMouseDown={(e) => {
              drawingRef.current = true;
              lastPosRef.current = getPos(e);
            }}
            onMouseMove={onDraw}
            onMouseUp={() => {
              drawingRef.current = false;
              lastPosRef.current = null;
            }}
            onMouseLeave={() => {
              drawingRef.current = false;
              lastPosRef.current = null;
            }}
            onTouchStart={(e) => {
              drawingRef.current = true;
              lastPosRef.current = getPos(e);
            }}
            onTouchMove={onDraw}
            onTouchEnd={() => {
              drawingRef.current = false;
              lastPosRef.current = null;
            }}
          />
          <div className="text-center mt-4">
            <button
              onClick={handleCompare}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Done - Compare
            </button>
          </div>
        </div>
      )}

      {phase === "compare" && (
        <div>
          <div className="text-center mb-4">
            <span className="text-lg font-bold text-gray-300">
              How did you do?
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-center text-sm text-gray-400 mb-2">Original</p>
              {referenceImage && (
                <img
                  src={referenceImage}
                  alt="Original shapes"
                  className="w-full aspect-square rounded-xl border border-gray-700"
                />
              )}
            </div>
            <div>
              <p className="text-center text-sm text-gray-400 mb-2">Yours</p>
              {drawingImage && (
                <img
                  src={drawingImage}
                  alt="Your drawing"
                  className="w-full aspect-square rounded-xl border border-gray-700"
                />
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => {
                setLevel((l) => l + 1);
                setPhase("ready");
              }}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              Next Level
            </button>
            <button
              onClick={() => {
                setLevel(1);
                setPhase("ready");
              }}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
