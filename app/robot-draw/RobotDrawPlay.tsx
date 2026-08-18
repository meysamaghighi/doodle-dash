"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CanvasShell from "../components/CanvasShell";
import DrawPad, { type DrawPadHandle, type Point } from "./DrawPad";
import RobotSays from "./RobotSays";
import { useRobot, type Guess } from "./useRobot";
import { useProgress } from "../hooks/useProgress";

const HOW_TO = (
  <div className="space-y-2">
    <p>Draw anything you like. The robot watches every stroke and shouts out what it thinks you&apos;re making.</p>
    <p>It knows 100 things — animals, food, vehicles, weather. Try to surprise it.</p>
  </div>
);

export default function RobotDrawPlay() {
  const padRef = useRef<DrawPadHandle>(null);
  const { state, load, guess } = useRobot();
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [saved, setSaved] = useState(false);
  const { saveDrawing } = useProgress();

  useEffect(() => {
    void load();
  }, [load]);

  // Re-guess once per completed stroke rather than per pointer move: the
  // recogniser costs a few milliseconds and a stroke is the natural unit of
  // "the drawing changed".
  const onStrokesChange = useCallback(
    (strokes: Point[][]) => {
      setGuesses(guess(strokes));
      setSaved(false);
    },
    [guess],
  );

  const clear = () => {
    padRef.current?.clear();
    setGuesses([]);
    setSaved(false);
  };

  const keep = () => {
    const url = padRef.current?.toDataURL();
    if (!url) return;
    saveDrawing("robot-draw", url);
    setSaved(true);
  };

  const pill = "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillOff = "bg-paper text-ink-2 border-line hover:bg-paper-2";

  return (
    <CanvasShell id="robot-draw" title="Robot Draw" howTo={HOW_TO} status="idle">
      <div className="mx-auto w-full max-w-lg px-4 pb-8 pt-4">
        <DrawPad ref={padRef} onStrokesChange={onStrokesChange} />

        <div className="mt-3">
          <RobotSays state={state} guesses={guesses} />
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => padRef.current?.undo()} className={`${pill} ${pillOff}`}>
            Undo
          </button>
          <button type="button" onClick={clear} className={`${pill} ${pillOff}`}>
            Clear
          </button>
          <button type="button" onClick={keep} disabled={saved} className={`${pill} ${pillOff} ml-auto disabled:opacity-40`}>
            {saved ? "Kept ✓" : "Keep it"}
          </button>
        </div>
      </div>
    </CanvasShell>
  );
}
