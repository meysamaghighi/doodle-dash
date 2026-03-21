"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { usePersonalBest } from "../hooks/usePersonalBest";

export default function OneLineDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [lineLength, setLineLength] = useState(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStarted(false);
    setIsDrawing(false);
    setLineLength(0);
    lastPos.current = null;
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

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
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

        const dx = pos.x - lastPos.current.x;
        const dy = pos.y - lastPos.current.y;
        setLineLength((l) => l + Math.sqrt(dx * dx + dy * dy));
      }
      lastPos.current = pos;
    },
    [isDrawing, color, brushSize]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (hasStarted && !isDrawing) return; // pen was lifted, can't restart
    setIsDrawing(true);
    setHasStarted(true);
    lastPos.current = getPos(e);
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Once you lift, you can't draw again (one continuous line rule)
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), "one-line-art.png");
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
  const penLifted = hasStarted && !isDrawing;
  const roundedLength = Math.round(lineLength);
  const { best, isNewBest } = usePersonalBest("pb-one-line", "higher", penLifted ? roundedLength : null);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {penLifted && (
          <div className="flex flex-col">
            <span className="text-yellow-400 text-sm font-medium">
              Pen lifted! {roundedLength}px drawn.
            </span>
            {isNewBest ? (
              <span className="text-emerald-400 text-xs font-bold">New Personal Best!</span>
            ) : best !== null ? (
              <span className="text-gray-500 text-xs">Best: {best}px</span>
            ) : null}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"
          >
            Start Over
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg"
          >
            Save
          </button>
        </div>
      </div>

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
          className="w-24 accent-yellow-500"
        />
        <span className="text-xs text-gray-500">
          {Math.round(lineLength)}px drawn
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className={`w-full aspect-square rounded-xl border transition-colors touch-none ${
          penLifted
            ? "border-yellow-500/50 cursor-not-allowed"
            : "border-gray-700 cursor-crosshair"
        }`}
        onMouseDown={startDraw}
        onMouseMove={onMove}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={onMove}
        onTouchEnd={stopDraw}
      />

      {!hasStarted && (
        <p className="text-center text-gray-500 text-sm mt-3">
          Click and drag to draw. One continuous line -- don't lift your pen!
        </p>
      )}
    </div>
  );
}
