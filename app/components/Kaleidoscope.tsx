"use client";

import { useState, useRef, useCallback } from "react";
import { saveImage } from "../utils/saveImage";

export default function Kaleidoscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [segments, setSegments] = useState(8);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  const drawMirroredStroke = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;

      // Draw in all segments
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Mirror horizontally within each segment
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.restore();
      }
    },
    [color, brushSize, segments]
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
    lastPos.current = getPos(e);
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
    "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#f43f5e", "#06b6d4", "#14b8a6", "#84cc16"
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Clear
        </button>
        <select
          value={segments}
          onChange={(e) => {
            setSegments(Number(e.target.value));
            clearCanvas();
          }}
          className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-700"
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
        <span className="text-xs text-gray-500">{brushSize}px</span>
        <button
          onClick={handleSave}
          className="ml-auto px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
        >
          Save
        </button>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-gray-600"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full aspect-square rounded-xl border border-gray-700 cursor-crosshair touch-none bg-gray-900"
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
