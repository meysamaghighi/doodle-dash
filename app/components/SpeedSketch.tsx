"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveImage } from "../utils/saveImage";
import { getDrawingStats } from "../utils/canvasStats";
import { usePersonalBest } from "../hooks/usePersonalBest";
import { DAILY_WORDS } from "../lib/daily-word";
import type { CompiledModel, Point, Prediction, Strokes } from "../lib/quickdraw";

// The type of the quickdraw module's exports, used only to type the ref that
// holds the dynamically-imported module -- this line has zero runtime cost
// (erased by TypeScript) and does NOT pull the model into this route's
// eagerly-loaded bundle. See ensureModelLoaded() for the actual import().
type QuickdrawModule = typeof import("../lib/quickdraw");

// The old pool was 30 hand-written words, and a third of them ("ghost",
// "robot", "alien", "castle") are things the recogniser was never trained on
// — prompting for one would be unwinnable however well a kid draws.
//
// Intersecting the old list against the model would have left just 19 words,
// making an already-repetitive game more repetitive. But the model is the
// richer source here, not the constraint: DAILY_WORDS is exactly its 100
// curated kid-safe categories, so drawing prompts straight from it more than
// triples the variety AND guarantees every prompt is winnable.
const PROMPTS: readonly string[] = DAILY_WORDS;

type Phase = "ready" | "drawing" | "done";
type ModelState = "idle" | "loading" | "ready" | "error";

export default function SpeedSketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [prompt, setPrompt] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [stats, setStats] = useState<{ coverage: number; colorsUsed: number } | null>(null);
  const pb = usePersonalBest("pb-speed-sketch", "higher", phase === "done" && stats ? stats.coverage : null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Recogniser state. Kept separate from `stats`/`pb` above so a model that
  // fails to load never touches the scoring the game already had.
  const [modelState, setModelState] = useState<ModelState>("idle");
  const quickdrawRef = useRef<QuickdrawModule | null>(null);
  const modelRef = useRef<CompiledModel | null>(null);
  const [liveGuess, setLiveGuess] = useState<Prediction[] | null>(null);
  const [recognisedAt, setRecognisedAt] = useState<number | null>(null);
  const recognisedRef = useRef(false);
  const strokesRef = useRef<Strokes>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const startTimeRef = useRef(0);
  const speedPb = usePersonalBest(
    "pb-speed-sketch-robot-time",
    "lower",
    phase === "done" && recognisedAt !== null ? recognisedAt : null
  );

  // Dynamic import so the ~model + inference code never lands in the shared
  // bundle the other 15 games pay for -- only fetched once a round of Speed
  // Sketch actually starts. Safe to call repeatedly: guarded against
  // re-entry, and loadModel() itself caches the parsed model after the
  // first successful fetch.
  const ensureModelLoaded = useCallback(() => {
    if (modelState === "loading" || modelState === "ready") return;
    setModelState("loading");
    (async () => {
      try {
        const mod = quickdrawRef.current ?? (await import("../lib/quickdraw"));
        quickdrawRef.current = mod;
        modelRef.current = await mod.loadModel();
        setModelState("ready");
      } catch (err) {
        // Offline, a flaky fetch, or a slow tablet timing out -- the game
        // must stay exactly as playable as it was before this feature, just
        // without a score. Never let a network failure break the canvas.
        console.warn("speed-sketch: quickdraw model unavailable, playing unscored", err);
        setModelState("error");
      }
    })();
  }, [modelState]);

  const startGame = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
    setTimeLeft(30);
    setPhase("drawing");
    strokesRef.current = [];
    currentStrokeRef.current = [];
    recognisedRef.current = false;
    setRecognisedAt(null);
    setLiveGuess(null);
    startTimeRef.current = Date.now();
    ensureModelLoaded();
  };

  // The canvas only mounts once phase !== "ready", so painting it inside
  // startGame() read a stale (null) ref on the very first click — the
  // background fill silently never happened until the user moved to a
  // phase where the canvas was already in the DOM. Kept separate from the
  // countdown effect below so it doesn't refire (and wipe the drawing)
  // every time timeLeft ticks.
  useEffect(() => {
    if (phase !== "drawing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [phase]);

  useEffect(() => {
    if (phase !== "drawing") return;
    if (timeLeft <= 0) {
      const canvas = canvasRef.current;
      if (canvas) setStats(getDrawingStats(canvas));
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

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

  const drawStroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [color, brushSize]
  );

  // Runs the recogniser on the strokes drawn so far. Called once per
  // completed stroke (pointer up), never on every pointer move -- at ~5ms
  // (measured) to ~50ms (slow tablet, assumed) per call, running it on
  // every move event would burn a noticeable chunk of frame budget for no
  // extra signal, since a stroke in progress doesn't change the picture the
  // model would see until it's finished.
  const classifyCurrentDrawing = useCallback(() => {
    if (modelState !== "ready" || !modelRef.current || !quickdrawRef.current) return;
    if (strokesRef.current.length === 0) return;
    try {
      const { classify, strokesToBitmap } = quickdrawRef.current;
      const bitmap = strokesToBitmap(strokesRef.current);
      const preds = classify(modelRef.current, bitmap, 3);
      setLiveGuess(preds);
      if (!recognisedRef.current && preds[0]?.label === prompt) {
        recognisedRef.current = true;
        setRecognisedAt((Date.now() - startTimeRef.current) / 1000);
      }
    } catch (err) {
      // A malformed bitmap or an unexpected model shape shouldn't ever take
      // the canvas down with it -- fall back to unscored play, same as a
      // failed model load.
      console.warn("speed-sketch: classification failed, disabling robot feedback", err);
      setModelState("error");
    }
  }, [modelState, prompt]);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current || phase !== "drawing") return;
      const pos = getPos(e);
      if (lastPos.current) {
        drawStroke(lastPos.current, pos);
      }
      lastPos.current = pos;
      currentStrokeRef.current.push(pos);
    },
    [phase, drawStroke]
  );

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "drawing") return;
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    currentStrokeRef.current = [pos];
    // A tap with no intervening move never reaches draw()'s stroke code —
    // paint a zero-length stroke here through the same drawStroke function
    // so a tap produces the round-cap dot a minimal drag would.
    drawStroke(pos, pos);
  };

  const stopDraw = () => {
    if (drawing.current && currentStrokeRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      currentStrokeRef.current = [];
      if (phase === "drawing") classifyCurrentDrawing();
    }
    drawing.current = false;
    lastPos.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveImage(canvas.toDataURL(), `doodlelab-${prompt}.png`);
  };

  const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#006400", "#0033CC", "#8b5cf6", "#ec4899", "#8B4513", "#000000"];

  return (
    <div className="max-w-lg mx-auto">
      {phase === "ready" && (
        <div className="text-center py-12">
          <p className="text-ink-2 mb-6">
            You have 30 seconds to draw the prompt. Ready?
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-ink font-bold rounded-xl transition-colors text-lg"
          >
            Start Drawing
          </button>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold">
              Draw: <span className="text-orange-400">{prompt}</span>
            </div>
            {phase === "drawing" && (
              <div
                className={`text-lg font-mono font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-ink-2"}`}
              >
                {timeLeft}s
              </div>
            )}
            {phase === "done" && (
              <span className="text-sm text-ink-2">Time's up!</span>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="w-full aspect-square rounded-xl border border-line cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          {/* Fixed-height row so the robot's live guess popping in/out never
              shifts the color palette below it. */}
          {phase === "drawing" && (
            <div className="mt-2 h-6 flex items-center justify-center text-sm">
              {modelState === "loading" && (
                <span className="text-ink-3">🤖 waking up…</span>
              )}
              {modelState === "ready" && liveGuess && liveGuess[0] && (
                <span className={recognisedRef.current ? "text-green-400 font-bold" : "text-ink-2"}>
                  🤖 I think it&apos;s a {liveGuess[0].label}!
                </span>
              )}
            </div>
          )}

          {phase === "drawing" && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-line"}`}
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
                className="w-24 accent-orange-500"
              />
              <span className="text-xs text-ink-3">{brushSize}px</span>
            </div>
          )}

          {phase === "done" && stats && (
            <div className="mt-3 flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.coverage}%</div>
                <div className="text-ink-3">Canvas used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.colorsUsed}</div>
                <div className="text-ink-3">Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.coverage >= 15 ? (stats.colorsUsed >= 3 ? "A" : "B") : (stats.coverage >= 5 ? "C" : "D")}
                </div>
                <div className="text-ink-3">Grade</div>
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="text-center mt-2">
              {pb.isNewBest && <p className="text-yellow-400 font-bold text-sm animate-pulse">New Personal Best!</p>}
              {pb.best !== null && !pb.isNewBest && <p className="text-ink-3 text-xs">Personal Best: {pb.best}% coverage</p>}
            </div>
          )}

          {/* Robot score. Only rendered when the model actually loaded --
              if it didn't (offline, slow tablet, fetch error), the game
              ends exactly the way it always has, just without this block. */}
          {phase === "done" && modelState === "ready" && (
            <div className="text-center mt-3">
              {recognisedAt !== null ? (
                <>
                  <p className="text-2xl font-bold text-green-400">
                    🤖 GOT IT in {recognisedAt.toFixed(1)}s!
                  </p>
                  {speedPb.isNewBest && (
                    <p className="text-yellow-400 font-bold text-xs animate-pulse mt-1">New fastest robot guess!</p>
                  )}
                  {speedPb.best !== null && !speedPb.isNewBest && (
                    <p className="text-ink-3 text-xs mt-1">Fastest robot guess: {speedPb.best.toFixed(1)}s</p>
                  )}
                </>
              ) : (
                <p className="text-ink-2 text-sm">
                  🤖 The robot couldn&apos;t tell it was a {prompt} this time.
                </p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-paper-2 hover:bg-paper-2 text-ink rounded-lg transition-colors"
              >
                Save Drawing
              </button>
              <button
                onClick={startGame}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-ink rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
