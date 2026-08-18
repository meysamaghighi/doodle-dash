"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import DrawPad, { type DrawPadHandle, type Point } from "../robot-draw/DrawPad";
import RobotSays from "../robot-draw/RobotSays";
import { useRobot, type Guess } from "../robot-draw/useRobot";
import { useProgress } from "../hooks/useProgress";
import { UNLOCKS, type UnlockDef } from "../lib/artbox";
import { dayKey, wordForDay } from "../lib/daily-word";

/**
 * The robot only has to *see* it, not be certain. Requiring the target as the
 * outright top guess makes the challenge brittle — a child's dragon is a hard
 * drawing, and 100-way top-1 is 72% even on adult reference doodles. Landing
 * in the top three is a fair, winnable bar that still means the drawing really
 * does read as the thing.
 */
const WIN_RANK = 3;

export default function DailyPrompt() {
  const padRef = useRef<DrawPadHandle>(null);
  const { state, load, guess } = useRobot();
  const { state: progress, completeDaily, saveDrawing } = useProgress();

  const [word, setWord] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [wonAt, setWonAt] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockDef[]>([]);
  // Whether this win is what earned today's sticker. Has to be captured at win
  // time: `alreadyDone` is derived from state that completeDaily has, by the
  // time we render, already updated — so reading it afterwards always says yes.
  const [earnedSticker, setEarnedSticker] = useState(false);
  const startedAt = useRef<number | null>(null);

  // Resolve the date client-side: the word is a function of the *viewer's*
  // UTC day, and prerendering it on the server would freeze yesterday's word
  // into the static HTML.
  useEffect(() => {
    setWord(wordForDay());
    setToday(dayKey());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const alreadyDone = today !== null && progress.artbox.completedDates.includes(today);
  const stickers = progress.artbox.completedDates.length;
  const next = UNLOCKS.find(u => u.threshold > stickers);

  const onStrokesChange = useCallback(
    (strokes: Point[][]) => {
      if (startedAt.current === null && strokes.length) startedAt.current = Date.now();
      const g = guess(strokes);
      setGuesses(g);

      if (wonAt !== null || !word) return;
      const rank = g.findIndex(x => x.label === word);
      if (rank >= 0 && rank < WIN_RANK) {
        const secs = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0;
        setWonAt(secs);
        setEarnedSticker(!alreadyDone);
        const url = padRef.current?.toDataURL();
        if (url) saveDrawing("daily", url);
        const { newlyUnlocked } = completeDaily(today ?? undefined);
        setUnlocked(newlyUnlocked);
      }
    },
    [guess, word, wonAt, today, alreadyDone, completeDaily, saveDrawing],
  );

  const retry = () => {
    padRef.current?.clear();
    setGuesses([]);
    setWonAt(null);
    startedAt.current = null;
  };

  const pill = "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const pillOff = "bg-paper text-ink-2 border-line hover:bg-paper-2";

  if (!word || !today) {
    return <div className="mx-auto w-full max-w-lg px-4 py-16 text-center text-ink-3">Loading today&apos;s word…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8 pt-4">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">
          {alreadyDone && wonAt === null ? "You already did today's" : "Today's challenge"}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl text-ink mt-1" style={{ fontWeight: 700 }}>
          {word}
        </h2>
        <p className="mt-1 text-sm text-ink-2">Can you make the robot see it?</p>
      </div>

      <div className="mt-4">
        <DrawPad ref={padRef} onStrokesChange={onStrokesChange} />
      </div>

      <div className="mt-3">
        <RobotSays
          state={state}
          guesses={guesses}
          won={wonAt !== null}
          idleHint={`Draw a ${word} and I'll try to guess it!`}
        />
      </div>

      {wonAt !== null && (
        <div className="mt-3 rounded-2xl border border-line bg-paper-2 p-4 text-center">
          <p className="font-display text-2xl text-ink" style={{ fontWeight: 700 }}>
            Got it in {wonAt.toFixed(1)}s!
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {earnedSticker
              ? `Sticker earned. That's ${stickers} day${stickers === 1 ? "" : "s"}.`
              : "Already counted for today — but that's a better one."}
          </p>
          <p className="mt-1 text-xs text-ink-3">Keep drawing if you want to finish your picture.</p>
          {unlocked.length > 0 && (
            <p className="mt-2 font-medium" style={{ color: "var(--accent)" }}>
              🎁 Unlocked: {unlocked.map(u => u.label).join(", ")}
            </p>
          )}
          <div className="mt-3 flex justify-center gap-2">
            <button type="button" onClick={retry} className={`${pill} ${pillOff}`}>
              Draw it again
            </button>
            <Link href="/gallery" className={`${pill} ${pillOff}`}>
              See your drawings
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => padRef.current?.undo()} className={`${pill} ${pillOff}`}>
          Undo
        </button>
        <button type="button" onClick={retry} className={`${pill} ${pillOff}`}>
          Start over
        </button>
        <Link href="/robot-draw" className={`${pill} ${pillOff} ml-auto`}>
          Free draw →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Your art box</p>
        <p className="mt-1 text-ink">
          <span className="font-display text-2xl" style={{ fontWeight: 700 }}>{stickers}</span>
          <span className="text-sm text-ink-2"> sticker{stickers === 1 ? "" : "s"}</span>
        </p>
        {next ? (
          <p className="mt-1 text-sm text-ink-2">
            {next.threshold - stickers} more to unlock <strong className="text-ink">{next.label}</strong>.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-2">Everything unlocked. You legend.</p>
        )}
        <p className="mt-2 font-mono text-[11px] text-ink-3">
          Miss a day and you lose nothing — stickers only ever add up.
        </p>
      </div>
    </div>
  );
}
