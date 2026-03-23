"use client";

import { useState, useRef, useEffect } from "react";
import { saveImage } from "../utils/saveImage";

// Line-art patterns (SVG path data)
const PATTERNS = {
  mandala: {
    name: "Mandala",
    paths: [
      "M256,100 A156,156 0 1,1 256,412 A156,156 0 1,1 256,100 Z",
      "M256,140 A116,116 0 1,1 256,372 A116,116 0 1,1 256,140 Z",
      "M256,180 A76,76 0 1,1 256,332 A76,76 0 1,1 256,180 Z",
      "M256,220 A36,36 0 1,1 256,292 A36,36 0 1,1 256,220 Z",
      "M256,100 L280,140 L256,180 L232,140 Z M280,140 L320,180 L300,220 L280,180 Z",
      "M256,332 L280,372 L256,412 L232,372 Z M280,372 L320,332 L300,292 L280,332 Z",
      "M100,256 L140,232 L180,256 L140,280 Z M140,232 L180,192 L220,212 L180,256 Z",
      "M412,256 L372,232 L332,256 L372,280 Z M372,232 L332,192 L292,212 L332,256 Z",
    ],
  },
  house: {
    name: "House",
    paths: [
      "M150,250 L256,150 L362,250 Z",
      "M170,250 L170,380 L342,380 L342,250",
      "M200,300 L240,300 L240,380 L200,380 Z",
      "M272,300 L312,300 L312,340 L272,340 Z",
      "M140,390 L372,390",
    ],
  },
  flower: {
    name: "Flower",
    paths: [
      "M256,220 Q236,200 256,180 Q276,200 256,220 Z",
      "M276,230 Q296,230 296,210 Q286,200 276,210 Z",
      "M236,230 Q216,230 216,210 Q226,200 236,210 Z",
      "M266,250 Q276,270 266,280 Q256,270 266,250 Z",
      "M246,250 Q236,270 246,280 Q256,270 246,250 Z",
      "M256,280 L256,360 Q246,350 256,340 Q266,350 256,360",
      "M256,300 Q236,310 226,300 L246,290",
      "M256,320 Q276,330 286,320 L266,310",
    ],
  },
  butterfly: {
    name: "Butterfly",
    paths: [
      "M256,256 Q246,200 220,180 Q190,170 180,200 Q180,230 210,240 Q230,250 256,256 Z",
      "M256,256 Q266,200 292,180 Q322,170 332,200 Q332,230 302,240 Q282,250 256,256 Z",
      "M256,256 Q246,310 220,330 Q190,340 180,310 Q180,280 210,270 Q230,260 256,256 Z",
      "M256,256 Q266,310 292,330 Q322,340 332,310 Q332,280 302,270 Q282,260 256,256 Z",
      "M256,220 L256,290",
      "M246,220 A10,10 0 1,1 266,220 A10,10 0 1,1 246,220 Z",
    ],
  },
  star: {
    name: "Star",
    paths: [
      "M256,120 L280,200 L360,220 L300,270 L320,350 L256,310 L192,350 L212,270 L152,220 L232,200 Z",
      "M256,180 L270,230 L320,240 L285,275 L295,325 L256,300 L217,325 L227,275 L192,240 L242,230 Z",
    ],
  },
  fish: {
    name: "Fish",
    paths: [
      "M150,256 Q180,220 220,220 Q280,220 320,240 Q340,250 350,256 Q340,262 320,272 Q280,292 220,292 Q180,292 150,256 Z",
      "M350,256 L400,236 L380,256 L400,276 Z",
      "M220,240 A8,8 0 1,1 236,240 A8,8 0 1,1 220,240 Z",
      "M190,256 Q200,230 220,230 Q200,256 220,282 Q200,282 190,256 Z",
      "M240,256 L280,256 M250,246 L270,246 M250,266 L270,266",
    ],
  },
};

type PatternKey = keyof typeof PATTERNS;

export default function ColorFill() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternKey>("mandala");
  const [color, setColor] = useState("#3b82f6");
  const [regions, setRegions] = useState<ImageData | null>(null);

  useEffect(() => {
    drawPattern();
  }, [selectedPattern]);

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Clear canvas
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, 512, 512);

    // Draw white background for coloring
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);

    // Draw pattern outlines
    const pattern = PATTERNS[selectedPattern];
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    pattern.paths.forEach((pathData) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });

    // Store original image data for flood fill reference
    setRegions(ctx.getImageData(0, 0, 512, 512));
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !regions) return;

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

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    floodFill(x, y);
  };

  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    const startIdx = (startY * 512 + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    // Parse target color
    const hex = color.replace("#", "");
    const targetR = parseInt(hex.substring(0, 2), 16);
    const targetG = parseInt(hex.substring(2, 4), 16);
    const targetB = parseInt(hex.substring(4, 6), 16);

    // Don't fill if clicking on same color or black outline
    if (
      (startR === targetR && startG === targetG && startB === targetB) ||
      (startR === 0 && startG === 0 && startB === 0)
    ) {
      return;
    }

    const stack: Array<[number, number]> = [[startX, startY]];
    const visited = new Set<number>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= 512 || y < 0 || y >= 512) continue;

      const idx = (y * 512 + x) * 4;
      if (visited.has(idx)) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if this pixel matches the start color
      if (r !== startR || g !== startG || b !== startB) continue;

      visited.add(idx);
      data[idx] = targetR;
      data[idx + 1] = targetG;
      data[idx + 2] = targetB;

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    setRegions(imageData);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), `color-fill-${selectedPattern}.png`);
  };

  const COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#78716c", "#a3a3a3", "#ffffff", "#000000"
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value as PatternKey)}
          className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700"
        >
          {Object.entries(PATTERNS).map(([key, pattern]) => (
            <option key={key} value={key}>
              {pattern.name}
            </option>
          ))}
        </select>
        <button
          onClick={drawPattern}
          className="px-3 py-1.5 text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg ml-auto"
        >
          Save
        </button>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-md border-2 transition-transform ${color === c ? "border-white scale-110" : "border-gray-600"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full aspect-square rounded-xl border border-gray-700 cursor-pointer touch-none"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />

      <p className="text-xs text-gray-500 text-center mt-3">
        Tap or click a region to fill it with the selected color
      </p>
    </div>
  );
}
