"use client";

import { useState, useRef, useEffect } from "react";
import { saveImage } from "../utils/saveImage";

// Line-art patterns (SVG path data)
const PATTERNS = {
  cat: {
    name: "Cat",
    paths: [
      // Head
      "M256,180 Q200,180 180,220 Q170,250 180,280 L190,300 Q220,320 256,320 Q292,320 322,300 L332,280 Q342,250 332,220 Q312,180 256,180 Z",
      // Left ear
      "M200,180 L180,140 L210,160 Z",
      // Right ear
      "M312,180 L302,160 L332,140 Z",
      // Eyes
      "M220,230 Q220,220 230,220 Q240,220 240,230 Q240,240 230,240 Q220,240 220,230 Z",
      "M272,230 Q272,220 282,220 Q292,220 292,230 Q292,240 282,240 Q272,240 272,230 Z",
      // Nose
      "M246,260 L256,270 L266,260",
      // Mouth
      "M256,270 Q246,280 240,275 M256,270 Q266,280 272,275",
      // Whiskers left
      "M200,250 L160,245 M200,260 L160,260 M200,270 L160,275",
      // Whiskers right
      "M312,250 L352,245 M312,260 L352,260 M312,270 L352,275",
      // Body
      "M190,300 Q180,340 190,380 L210,420 L240,440 L256,445 L272,440 L302,420 L322,380 Q332,340 322,300",
    ],
  },
  dog: {
    name: "Dog",
    paths: [
      // Head
      "M256,200 Q210,200 190,230 Q180,260 190,290 L210,310 Q240,330 256,330 Q272,330 302,310 L322,290 Q332,260 322,230 Q302,200 256,200 Z",
      // Left ear (floppy)
      "M210,200 Q190,200 180,220 Q175,240 185,260 L200,240",
      // Right ear (floppy)
      "M302,200 Q322,200 332,220 Q337,240 327,260 L312,240",
      // Eyes
      "M220,240 A8,8 0 1,1 236,240 A8,8 0 1,1 220,240 Z",
      "M276,240 A8,8 0 1,1 292,240 A8,8 0 1,1 276,240 Z",
      // Nose
      "M246,270 Q246,260 256,260 Q266,260 266,270 Q266,280 256,285 Q246,280 246,270 Z",
      // Mouth
      "M256,285 L256,295 M256,295 Q240,305 230,300 M256,295 Q272,305 282,300",
      // Tongue
      "M246,295 Q246,310 256,315 Q266,310 266,295",
      // Body
      "M210,310 Q200,350 210,390 L230,430 L256,440 L282,430 L302,390 Q312,350 302,310",
      // Front legs
      "M230,390 L220,450 M230,390 L240,450 M282,390 L272,450 M282,390 L292,450",
    ],
  },
  butterfly: {
    name: "Butterfly",
    paths: [
      // Body
      "M256,200 Q250,250 250,280 Q250,320 256,350 Q262,320 262,280 Q262,250 256,200 Z",
      // Head
      "M246,200 A10,10 0 1,1 266,200 A10,10 0 1,1 246,200 Z",
      // Antennae
      "M250,200 Q245,180 240,170 M262,200 Q267,180 272,170",
      // Upper left wing outer
      "M250,240 Q210,210 180,220 Q150,240 160,280 Q170,310 200,300 Q230,290 250,270 Z",
      // Upper left wing inner
      "M250,240 Q230,235 215,245 Q205,260 215,275 Q225,285 240,280 Q248,270 250,260 Z",
      // Upper right wing outer
      "M262,240 Q302,210 332,220 Q362,240 352,280 Q342,310 312,300 Q282,290 262,270 Z",
      // Upper right wing inner
      "M262,240 Q282,235 297,245 Q307,260 297,275 Q287,285 272,280 Q264,270 262,260 Z",
      // Lower left wing outer
      "M250,280 Q220,300 190,320 Q170,350 185,380 Q205,395 230,380 Q248,360 250,340 Z",
      // Lower left wing inner
      "M250,290 Q235,305 225,320 Q220,335 230,345 Q240,350 248,340 Q252,325 250,310 Z",
      // Lower right wing outer
      "M262,280 Q292,300 322,320 Q342,350 327,380 Q307,395 282,380 Q264,360 262,340 Z",
      // Lower right wing inner
      "M262,290 Q277,305 287,320 Q292,335 282,345 Q272,350 264,340 Q260,325 262,310 Z",
    ],
  },
  fish: {
    name: "Fish",
    paths: [
      // Body
      "M140,256 Q160,210 210,200 Q270,195 320,210 Q350,230 360,256 Q350,282 320,302 Q270,317 210,312 Q160,302 140,256 Z",
      // Tail
      "M360,256 L410,230 L400,256 L410,282 Z",
      // Top fin
      "M240,200 Q250,170 260,160 Q270,170 280,200",
      // Bottom fin
      "M240,312 Q250,342 260,352 Q270,342 280,312",
      // Eye outer
      "M200,240 A15,15 0 1,1 230,240 A15,15 0 1,1 200,240 Z",
      // Eye inner (pupil)
      "M210,240 A5,5 0 1,1 220,240 A5,5 0 1,1 210,240 Z",
      // Mouth
      "M170,256 Q175,265 185,268",
      // Scales
      "M220,230 Q230,230 235,240 Q230,250 220,250 Z",
      "M245,230 Q255,230 260,240 Q255,250 245,250 Z",
      "M270,230 Q280,230 285,240 Q280,250 270,250 Z",
      "M220,260 Q230,260 235,270 Q230,280 220,280 Z",
      "M245,260 Q255,260 260,270 Q255,280 245,280 Z",
      "M270,260 Q280,260 285,270 Q280,280 270,280 Z",
    ],
  },
  bird: {
    name: "Bird",
    paths: [
      // Body
      "M256,260 Q220,260 200,280 Q190,300 200,320 Q220,340 256,340 Q292,340 312,320 Q322,300 312,280 Q292,260 256,260 Z",
      // Head
      "M256,220 Q230,220 215,235 Q210,250 220,265 Q240,280 256,280 Q272,280 292,265 Q302,250 297,235 Q282,220 256,220 Z",
      // Beak
      "M215,245 L180,250 L215,255 Z",
      // Eye
      "M235,245 A6,6 0 1,1 247,245 A6,6 0 1,1 235,245 Z",
      // Wing
      "M220,280 Q200,290 190,310 Q195,320 210,315 Q225,305 235,295",
      // Tail feathers
      "M292,310 Q310,330 320,350 M297,315 Q315,335 325,355 M302,320 Q320,340 330,360",
      // Legs
      "M240,340 L235,380 L225,380 M235,380 L245,380 M272,340 L277,380 L267,380 M277,380 L287,380",
      // Top feather
      "M256,220 Q260,200 265,190 Q270,200 268,210",
    ],
  },
  horse: {
    name: "Horse",
    paths: [
      // Head
      "M280,200 Q260,190 240,200 Q230,220 235,240 L240,260 Q250,275 270,275 Q290,275 300,260 L305,240 Q310,220 300,200 Z",
      // Snout
      "M235,240 Q225,245 225,255 Q225,265 235,270 L240,268",
      // Eye
      "M270,230 A6,6 0 1,1 282,230 A6,6 0 1,1 270,230 Z",
      // Ear
      "M280,200 L285,180 L275,190 Z",
      // Mane
      "M270,190 Q265,185 260,180 M275,195 Q270,190 265,185 M280,200 Q275,195 270,190",
      // Neck
      "M270,275 Q280,300 280,330 L275,360 M240,260 Q235,290 240,330 L245,360",
      // Body
      "M245,360 Q230,380 240,420 L260,450 L280,450 L300,420 Q310,380 295,360 Z",
      // Front legs
      "M260,420 L255,480 M265,420 L270,480",
      // Back legs
      "M280,420 L275,480 M285,420 L290,480",
      // Tail
      "M300,380 Q320,390 330,410 Q335,430 325,445",
    ],
  },
  flower: {
    name: "Flower",
    paths: [
      // Center
      "M236,236 A20,20 0 1,1 276,236 A20,20 0 1,1 236,236 Z",
      // Top petal
      "M256,236 Q256,200 240,180 Q230,175 225,185 Q220,200 230,215 Q240,230 256,236 Z",
      "M256,236 Q256,200 272,180 Q282,175 287,185 Q292,200 282,215 Q272,230 256,236 Z",
      // Right petal
      "M276,236 Q312,236 332,220 Q337,210 327,205 Q312,200 297,210 Q282,220 276,236 Z",
      "M276,236 Q312,236 332,252 Q337,262 327,267 Q312,272 297,262 Q282,252 276,236 Z",
      // Bottom petal
      "M256,276 Q256,312 240,332 Q230,337 225,327 Q220,312 230,297 Q240,282 256,276 Z",
      "M256,276 Q256,312 272,332 Q282,337 287,327 Q292,312 282,297 Q272,282 256,276 Z",
      // Left petal
      "M236,236 Q200,236 180,220 Q175,210 185,205 Q200,200 215,210 Q230,220 236,236 Z",
      "M236,236 Q200,236 180,252 Q175,262 185,267 Q200,272 215,262 Q230,252 236,236 Z",
      // Stem
      "M256,276 L256,400 Q254,405 256,410 Q258,405 256,400",
      // Leaves
      "M256,320 Q240,330 235,345 Q240,355 256,350 Z",
      "M256,360 Q272,370 277,385 Q272,395 256,390 Z",
    ],
  },
  tree: {
    name: "Tree",
    paths: [
      // Trunk
      "M236,300 L236,420 L276,420 L276,300",
      // Roots
      "M236,420 Q220,435 210,440 M276,420 Q292,435 302,440 M246,420 L246,440 M266,420 L266,440",
      // Bottom foliage
      "M160,300 Q150,280 160,260 Q180,240 210,245 Q240,250 256,260 Q272,250 302,245 Q332,240 352,260 Q362,280 352,300 Z",
      // Middle foliage
      "M180,260 Q170,240 180,220 Q200,200 230,205 Q256,210 256,230 Q256,210 282,205 Q312,200 332,220 Q342,240 332,260 Z",
      // Top foliage
      "M200,220 Q195,200 205,180 Q220,165 240,170 Q256,175 256,190 Q256,175 272,170 Q292,165 307,180 Q317,200 312,220 Z",
      // Small top
      "M230,180 Q230,160 245,150 Q256,145 267,150 Q282,160 282,180 Z",
    ],
  },
  sun: {
    name: "Sun",
    paths: [
      // Center circle
      "M196,256 A60,60 0 1,1 316,256 A60,60 0 1,1 196,256 Z",
      // Inner circle
      "M216,256 A40,40 0 1,1 296,256 A40,40 0 1,1 216,256 Z",
      // Top ray
      "M256,136 L246,176 L266,176 Z",
      // Top-right ray
      "M325,165 L297,195 L315,210 Z",
      // Right ray
      "M376,256 L336,246 L336,266 Z",
      // Bottom-right ray
      "M325,347 L315,302 L297,317 Z",
      // Bottom ray
      "M256,376 L266,336 L246,336 Z",
      // Bottom-left ray
      "M187,347 L197,302 L215,317 Z",
      // Left ray
      "M136,256 L176,266 L176,246 Z",
      // Top-left ray
      "M187,165 L215,195 L197,210 Z",
    ],
  },
  mountain: {
    name: "Mountain",
    paths: [
      // Back mountain
      "M50,350 L180,180 L280,280 L350,200 L460,350 Z",
      // Front mountain left
      "M80,350 L200,220 L320,350 Z",
      // Front mountain right
      "M280,350 L380,240 L450,350 Z",
      // Snow cap left
      "M200,220 L180,250 L220,250 Z",
      // Snow cap right
      "M380,240 L365,265 L395,265 Z",
      // Sun
      "M400,120 A30,30 0 1,1 460,120 A30,30 0 1,1 400,120 Z",
      // Clouds
      "M120,140 Q110,130 120,120 Q130,115 140,120 Q150,115 160,120 Q170,130 160,140 Z",
      "M300,100 Q290,90 300,80 Q310,75 320,80 Q330,75 340,80 Q350,90 340,100 Z",
      // Ground
      "M50,350 L460,350 L460,450 L50,450 Z",
      // Trees on ground
      "M100,350 L90,390 L110,390 Z M95,365 L105,365 L105,385 L95,385 Z",
      "M250,350 L240,390 L260,390 Z M245,365 L255,365 L255,385 L245,385 Z",
    ],
  },
  house: {
    name: "House",
    paths: [
      // Main house body
      "M160,250 L160,390 L352,390 L352,250 Z",
      // Roof
      "M140,250 L256,150 L372,250 Z",
      // Chimney
      "M300,180 L300,150 L330,150 L330,200",
      // Door
      "M220,310 L220,390 L270,390 L270,310 Z",
      // Door knob
      "M258,350 A4,4 0 1,1 266,350 A4,4 0 1,1 258,350 Z",
      // Left window
      "M180,270 L180,310 L220,310 L220,270 Z M200,270 L200,310 M180,290 L220,290",
      // Right window
      "M290,270 L290,310 L330,310 L330,270 Z M310,270 L310,310 M290,290 L330,290",
      // Upper window
      "M230,200 Q230,185 245,185 L267,185 Q282,185 282,200 L282,230 L230,230 Z M256,185 L256,230 M230,215 L282,215",
      // Ground
      "M120,390 L392,390 L392,395 L120,395 Z",
      // Bushes
      "M140,370 Q135,360 140,350 Q150,345 160,350 Q170,345 180,350 Q185,360 180,370 Z",
      "M332,370 Q327,360 332,350 Q342,345 352,350 Q362,345 372,350 Q377,360 372,370 Z",
    ],
  },
  rocket: {
    name: "Rocket",
    paths: [
      // Main body
      "M226,200 L226,360 Q226,380 256,380 Q286,380 286,360 L286,200 Z",
      // Nose cone
      "M226,200 Q226,160 256,140 Q286,160 286,200 Z",
      // Window
      "M236,210 A20,20 0 1,1 276,210 A20,20 0 1,1 236,210 Z",
      // Window inner
      "M244,210 A12,12 0 1,1 268,210 A12,12 0 1,1 244,210 Z",
      // Left fin
      "M226,330 L180,380 L180,420 L226,370 Z",
      // Right fin
      "M286,330 L332,380 L332,420 L286,370 Z",
      // Left wing detail
      "M190,390 L205,390 L205,410 L190,410 Z",
      // Right wing detail
      "M307,390 L322,390 L322,410 L307,410 Z",
      // Body stripes
      "M226,250 L286,250 M226,280 L286,280 M226,310 L286,310",
      // Flames
      "M236,380 Q230,400 236,420 Q236,400 240,420 Q240,400 246,420 Q246,400 256,430 Q256,400 266,420 Q266,400 272,420 Q272,400 276,420 Q276,400 286,380",
    ],
  },
  heart: {
    name: "Heart",
    paths: [
      // Main heart
      "M256,380 Q200,330 170,290 Q150,260 150,230 Q150,190 180,170 Q210,150 240,170 Q256,185 256,200 Q256,185 272,170 Q302,150 332,170 Q362,190 362,230 Q362,260 342,290 Q312,330 256,380 Z",
      // Inner heart
      "M256,350 Q215,310 195,280 Q185,260 185,240 Q185,215 205,200 Q225,185 245,200 Q256,210 256,220 Q256,210 267,200 Q287,185 307,200 Q327,215 327,240 Q327,260 317,280 Q297,310 256,350 Z",
      // Smallest heart
      "M256,310 Q235,290 225,270 Q220,255 220,245 Q220,230 232,220 Q244,210 256,220 Q268,210 280,220 Q292,230 292,245 Q292,255 287,270 Q277,290 256,310 Z",
      // Shine detail top-left
      "M200,200 Q195,195 200,190 Q205,185 210,190 Q215,195 210,200 Q205,205 200,200 Z",
    ],
  },
  mandala: {
    name: "Mandala",
    paths: [
      // Outer circle
      "M106,256 A150,150 0 1,1 406,256 A150,150 0 1,1 106,256 Z",
      // Ring 1
      "M136,256 A120,120 0 1,1 376,256 A120,120 0 1,1 136,256 Z",
      // Ring 2
      "M166,256 A90,90 0 1,1 346,256 A90,90 0 1,1 166,256 Z",
      // Ring 3
      "M196,256 A60,60 0 1,1 316,256 A60,60 0 1,1 196,256 Z",
      // Center circle
      "M226,256 A30,30 0 1,1 286,256 A30,30 0 1,1 226,256 Z",
      // Top petal
      "M256,106 Q246,136 256,166 Q266,136 256,106 Z",
      "M256,166 Q246,186 256,196 Q266,186 256,166 Z",
      // Right petal
      "M406,256 Q376,246 346,256 Q376,266 406,256 Z",
      "M346,256 Q326,246 316,256 Q326,266 346,256 Z",
      // Bottom petal
      "M256,406 Q266,376 256,346 Q246,376 256,406 Z",
      "M256,346 Q266,326 256,316 Q246,326 256,346 Z",
      // Left petal
      "M106,256 Q136,266 166,256 Q136,246 106,256 Z",
      "M166,256 Q186,266 196,256 Q186,246 166,256 Z",
      // Diagonal petals
      "M331,181 Q311,191 301,211 Q311,201 331,181 Z",
      "M181,181 Q201,191 211,211 Q201,201 181,181 Z",
      "M181,331 Q191,311 211,301 Q201,311 181,331 Z",
      "M331,331 Q321,311 301,301 Q311,311 331,331 Z",
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
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#006400",
    "#0033CC", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#8B4513", "#a3a3a3", "#ffffff", "#000000"
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value as PatternKey)}
          className="bg-paper-2 text-ink-2 text-sm rounded-lg px-3 py-1.5 border border-line"
        >
          {Object.entries(PATTERNS).map(([key, pattern]) => (
            <option key={key} value={key}>
              {pattern.name}
            </option>
          ))}
        </select>
        <button
          onClick={drawPattern}
          className="px-3 py-1.5 text-sm bg-paper-2 text-ink-2 hover:bg-paper-2 rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-ink rounded-lg ml-auto"
        >
          Save
        </button>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-md border-2 transition-transform ${color === c ? "border-white scale-110" : "border-line"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        className="w-full aspect-square rounded-xl border border-line cursor-pointer touch-none"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />

      <p className="text-xs text-ink-3 text-center mt-3">
        Tap or click a region to fill it with the selected color
      </p>
    </div>
  );
}
