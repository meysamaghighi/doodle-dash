"use client";

import { useState, useRef, useCallback } from "react";
import { saveImage } from "../utils/saveImage";

export default function GradientPaint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color1, setColor1] = useState("#ff00ff");
  const [color2, setColor2] = useState("#00ffff");
  const [brushSize, setBrushSize] = useState(40);
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

  const drawGradientBrush = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize / 2);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [color1, color2, brushSize]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      const pos = getPos(e);

      // If we have a last position, draw gradient circles along the line
      if (lastPos.current) {
        const dx = pos.x - lastPos.current.x;
        const dy = pos.y - lastPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / (brushSize / 4)));

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = lastPos.current.x + dx * t;
          const y = lastPos.current.y + dy * t;
          drawGradientBrush(x, y);
        }
      } else {
        drawGradientBrush(pos.x, pos.y);
      }

      lastPos.current = pos;
    },
    [drawGradientBrush, brushSize]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const pos = getPos(e);
    drawGradientBrush(pos.x, pos.y);
    lastPos.current = pos;
  };

  const stopDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), "gradient-paint.png");
  };

  const PRESET_GRADIENTS = [
    { color1: "#ff00ff", color2: "#00ffff", label: "Cyber" },
    { color1: "#ff6b6b", color2: "#feca57", label: "Sunset" },
    { color1: "#4facfe", color2: "#00f2fe", label: "Ocean" },
    { color1: "#fa709a", color2: "#fee140", label: "Peach" },
    { color1: "#30cfd0", color2: "#330867", label: "Deep" },
    { color1: "#a8edea", color2: "#fed6e3", label: "Pastel" },
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
        <input
          type="range"
          min={10}
          max={100}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32 accent-pink-500"
        />
        <span className="text-xs text-gray-500">{brushSize}px</span>
        <button
          onClick={handleSave}
          className="ml-auto px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors"
        >
          Save PNG
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Start:</label>
          <input
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">End:</label>
          <input
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESET_GRADIENTS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setColor1(preset.color1);
              setColor2(preset.color2);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            style={{
              background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            {preset.label}
          </button>
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
