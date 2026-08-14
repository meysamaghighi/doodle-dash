"use client";

import { useState, useRef, useCallback } from "react";
import { saveImage } from "../utils/saveImage";

const GRID_SIZE = 16;
const PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#0033CC", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#78716c", "#8B4513", "#006400", "#a3e635",
];

// Bresenham line between two cell indices on a `size`x`size` grid, inclusive
// of both endpoints, ordered from `fromIdx` to `toIdx`. Used to fill in the
// gap between two pointermove samples so fast drags don't skip cells.
function cellLine(size: number, fromIdx: number, toIdx: number): number[] {
  let x0 = fromIdx % size;
  let y0 = Math.floor(fromIdx / size);
  const x1 = toIdx % size;
  const y1 = Math.floor(toIdx / size);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const cells: number[] = [];
  while (true) {
    cells.push(y0 * size + x0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
}

export default function PixelArt() {
  const [grid, setGrid] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill("#111827")
  );
  const [color, setColor] = useState("#ffffff");
  const [tool, setTool] = useState<"draw" | "fill" | "erase">("draw");
  const [gridSize, setGridSize] = useState(GRID_SIZE);
  const painting = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const paintCell = useCallback((index: number) => {
    if (index < 0 || index >= gridSize * gridSize) return;
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
  }, [tool, color, gridSize, floodFill]);

  // Paints several cells (e.g. an interpolated drag path) in a single
  // setGrid update instead of one copy-and-set per cell. Only used for the
  // draw/erase tools -- fill is single-shot and never interpolated.
  const paintCells = useCallback((indices: number[]) => {
    if (indices.length === 0) return;
    const fillValue = tool === "erase" ? "#111827" : color;
    setGrid((g) => {
      const n = [...g];
      for (const idx of indices) {
        if (idx >= 0 && idx < gridSize * gridSize) n[idx] = fillValue;
      }
      return n;
    });
  }, [tool, color, gridSize]);

  const getCellFromPoint = (clientX: number, clientY: number): number => {
    const el = gridRef.current;
    if (!el) return -1;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor((x / rect.width) * gridSize);
    const row = Math.floor((y / rect.height) * gridSize);
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return -1;
    return row * gridSize + col;
  };

  const lastPaintedCell = useRef(-1);

  const handlePointerDown = (e: React.PointerEvent) => {
    painting.current = true;
    const idx = getCellFromPoint(e.clientX, e.clientY);
    lastPaintedCell.current = idx;
    paintCell(idx);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!painting.current) return;
    // Fill is a single-shot action fired on pointerdown -- ignore drag
    // entirely so a finger drifting slightly while tapping the bucket
    // doesn't flood-fill every region it crosses.
    if (tool === "fill") return;

    const idx = getCellFromPoint(e.clientX, e.clientY);
    if (idx === -1) {
      // Left the grid. Drop the last-painted anchor so that if the pointer
      // comes back inside, we don't draw a straight line from wherever it
      // exited to wherever it re-enters -- painting simply resumes fresh
      // at the re-entry cell.
      lastPaintedCell.current = -1;
      return;
    }
    if (idx === lastPaintedCell.current) return;

    if (lastPaintedCell.current === -1) {
      // Fresh start (first move after pointerdown, or re-entering the grid
      // after leaving it): just paint this one cell, nothing to bridge to.
      lastPaintedCell.current = idx;
      paintCell(idx);
      return;
    }

    // Bridge the gap between the last sampled cell and this one so a fast
    // drag paints a continuous stroke instead of leaving holes. The start
    // cell was already painted on the previous move (or pointerdown), so
    // skip it here.
    const path = cellLine(gridSize, lastPaintedCell.current, idx);
    lastPaintedCell.current = idx;
    paintCells(path.slice(1));
  };

  const handlePointerUp = () => {
    painting.current = false;
    lastPaintedCell.current = -1;
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
    saveImage(canvas.toDataURL(), "pixel-art.png");
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1">
          {(["draw", "fill", "erase"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${tool === t ? "bg-purple-500 text-ink" : "bg-paper-2 text-ink-2 hover:bg-paper-2"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={gridSize}
          onChange={(e) => resetGrid(Number(e.target.value))}
          className="bg-paper-2 text-ink-2 text-sm rounded-lg px-2 py-1.5 border border-line"
        >
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
        </select>
        <button
          onClick={() => resetGrid(gridSize)}
          className="px-3 py-1.5 text-sm bg-paper-2 text-ink-2 hover:bg-paper-2 rounded-lg"
        >
          Clear
        </button>
        <button
          onClick={exportImage}
          className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-ink rounded-lg ml-auto"
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
            className={`w-7 h-7 rounded-md border-2 transition-transform ${color === c && tool !== "erase" ? "border-white scale-110" : "border-line"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div
        ref={gridRef}
        className="aspect-square border border-line rounded-xl overflow-hidden select-none touch-none cursor-pointer"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {grid.map((cellColor, i) => (
          <div
            key={i}
            style={{ backgroundColor: cellColor }}
            className="pointer-events-none"
          />
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
