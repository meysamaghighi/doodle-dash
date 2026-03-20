"use client";

import { useState, useRef, useCallback } from "react";

const GRID_SIZE = 16;
const PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#78716c", "#a3a3a3", "#0ea5e9", "#a3e635",
];

export default function PixelArt() {
  const [grid, setGrid] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill("#111827")
  );
  const [color, setColor] = useState("#ffffff");
  const [tool, setTool] = useState<"draw" | "fill" | "erase">("draw");
  const [gridSize, setGridSize] = useState(GRID_SIZE);
  const painting = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetGrid = (size: number) => {
    setGridSize(size);
    setGrid(Array(size * size).fill("#111827"));
  };

  const floodFill = useCallback(
    (index: number, targetColor: string, fillColor: string, g: string[]) => {
      if (targetColor === fillColor) return g;
      const newGrid = [...g];
      const stack = [index];
      while (stack.length > 0) {
        const i = stack.pop()!;
        if (i < 0 || i >= gridSize * gridSize) continue;
        if (newGrid[i] !== targetColor) continue;
        newGrid[i] = fillColor;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        if (col > 0) stack.push(i - 1);
        if (col < gridSize - 1) stack.push(i + 1);
        if (row > 0) stack.push(i - gridSize);
        if (row < gridSize - 1) stack.push(i + gridSize);
      }
      return newGrid;
    },
    [gridSize]
  );

  const paintCell = (index: number) => {
    if (tool === "fill") {
      setGrid((g) => floodFill(index, g[index], color, g));
    } else if (tool === "erase") {
      setGrid((g) => {
        const n = [...g];
        n[index] = "#111827";
        return n;
      });
    } else {
      setGrid((g) => {
        const n = [...g];
        n[index] = color;
        return n;
      });
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const scale = 32;
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    for (let i = 0; i < grid.length; i++) {
      const x = (i % gridSize) * scale;
      const y = Math.floor(i / gridSize) * scale;
      ctx.fillStyle = grid[i];
      ctx.fillRect(x, y, scale, scale);
    }
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const cellSize = `${100 / gridSize}%`;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1">
          {(["draw", "fill", "erase"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${tool === t ? "bg-purple-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={gridSize}
          onChange={(e) => resetGrid(Number(e.target.value))}
          className="bg-gray-800 text-gray-300 text-sm rounded-lg px-2 py-1.5 border border-gray-700"
        >
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
        </select>
        <button
          onClick={() => resetGrid(gridSize)}
          className="px-3 py-1.5 text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"
        >
          Clear
        </button>
        <button
          onClick={exportImage}
          className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg ml-auto"
        >
          Export PNG
        </button>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              if (tool === "erase") setTool("draw");
            }}
            className={`w-7 h-7 rounded-md border-2 transition-transform ${color === c && tool !== "erase" ? "border-white scale-110" : "border-gray-600"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div
        className="aspect-square border border-gray-700 rounded-xl overflow-hidden relative select-none touch-none"
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        onMouseDown={() => (painting.current = true)}
        onMouseUp={() => (painting.current = false)}
        onMouseLeave={() => (painting.current = false)}
        onTouchEnd={() => (painting.current = false)}
      >
        {grid.map((cellColor, i) => (
          <div
            key={i}
            style={{ backgroundColor: cellColor, width: cellSize, paddingBottom: cellSize }}
            className="cursor-pointer"
            onMouseDown={() => paintCell(i)}
            onMouseEnter={() => painting.current && paintCell(i)}
            onTouchStart={() => {
              painting.current = true;
              paintCell(i);
            }}
          />
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
