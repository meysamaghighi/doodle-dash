"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import { dayKey, wordForDay } from "../lib/daily-word";
import { UNLOCKS } from "../lib/artbox";

/**
 * The front door for the daily challenge.
 *
 * It lives on the homepage because that is where the audience actually is:
 * 86% of visitors land there and return to it 4.3 times a session, using it as
 * a menu. /daily had everything it needed and got 8 visitors a month purely
 * because nothing pointed at it.
 *
 * Rendered client-side: the word depends on the viewer's UTC day, and
 * prerendering would bake yesterday's word into the static HTML.
 */
export default function DailyBanner() {
  const { state } = useProgress();
  const [word, setWord] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setWord(wordForDay());
    setDone(state.artbox.completedDates.includes(dayKey()));
  }, [state.artbox.completedDates]);

  const stickers = state.artbox.completedDates.length;
  const next = UNLOCKS.find(u => u.threshold > stickers);

  // Reserve the height before hydration so the grid below doesn't jump.
  if (!word) return <div className="mb-6 h-[104px] sm:h-[92px]" aria-hidden="true" />;

  return (
    <Link
      href="/daily"
      className="group relative block mb-6 overflow-hidden rounded-2xl border border-line bg-paper-2 p-4 sm:p-5 hover:border-ink-3 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity" />
      <div className="relative flex items-center gap-4">
        <span className="text-4xl sm:text-5xl shrink-0" aria-hidden="true">
          {done ? "🎉" : "🤖"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">
            {done ? "Done today" : "Today's challenge"}
          </p>
          <p className="font-display text-xl sm:text-2xl text-ink leading-tight" style={{ fontWeight: 700 }}>
            {done ? "Come back tomorrow for a new word" : <>Draw a <span style={{ color: "var(--accent)" }}>{word}</span></>}
          </p>
          <p className="mt-0.5 text-xs sm:text-sm text-ink-2 truncate">
            {done
              ? `${stickers} sticker${stickers === 1 ? "" : "s"} collected${next ? ` · ${next.threshold - stickers} more for the ${next.label.toLowerCase()}` : ""}`
              : "Can you make the robot see it?"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-ink-3 group-hover:text-ink hidden sm:block">
          {done ? "→" : "Play →"}
        </span>
      </div>
    </Link>
  );
}
