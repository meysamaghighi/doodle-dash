"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";

export default function SymmetryDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw vertical mirror line in center
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw mirror line
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    ctx.setLineDash([]);
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

  const drawLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      from: { x: number; y: number },
      to: { x: number; y: number }
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw on the original position
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Mirror across vertical center line (x = 256)
      const mirrorFromX = 512 - from.x;
      const mirrorToX = 512 - to.x;

      ctx.beginPath();
      ctx.moveTo(mirrorFromX, from.y);
      ctx.lineTo(mirrorToX, to.y);
      ctx.stroke();
    },
    [color, brushSize]
  );

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      if (lastPos.current) {
        drawLine(ctx, lastPos.current, pos);
      }
      lastPos.current = pos;
    },
    [drawLine]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
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
    saveImage(canvas.toDataURL(), "symmetry-draw.png");
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#000000"];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={clearCanvas}
          className="px-3 py-1.5 text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg ml-auto"
        >
          Save
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
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
          className="w-24 accent-blue-500"
        />
        <span className="text-xs text-gray-500">{brushSize}px</span>
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full aspect-square rounded-xl border border-gray-700 cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={onMove}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={onMove}
        onTouchEnd={stopDraw}
      />
    </div>
  );
}
