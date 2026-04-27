"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";

type Prompt = {
  noun: string;
  qualifier: string;
};

const POOL: Prompt[] = [
  { noun: "cat",         qualifier: "wearing a hat." },
  { noun: "robot",       qualifier: "in love." },
  { noun: "dragon",      qualifier: "drinking tea." },
  { noun: "spaceship",   qualifier: "made of cheese." },
  { noun: "monster",     qualifier: "under a bed." },
  { noun: "dinosaur",    qualifier: "on a skateboard." },
  { noun: "pirate ship", qualifier: "in a bathtub." },
  { noun: "wizard",      qualifier: "lost at the mall." },
  { noun: "octopus",     qualifier: "playing chess." },
  { noun: "ghost",       qualifier: "doing yoga." },
  { noun: "alien",       qualifier: "on vacation." },
  { noun: "robot dog",   qualifier: "fetching the moon." },
  { noun: "house",       qualifier: "with chicken legs." },
  { noun: "snowman",     qualifier: "on fire." },
  { noun: "knight",      qualifier: "afraid of the dark." },
  { noun: "panda",       qualifier: "running a coffee shop." },
  { noun: "tornado",     qualifier: "made of frogs." },
  { noun: "submarine",   qualifier: "on a mountain." },
  { noun: "vampire",     qualifier: "at the beach." },
  { noun: "skeleton",    qualifier: "throwing a party." },
  { noun: "tree",        qualifier: "with feelings." },
  { noun: "fish",        qualifier: "riding a bicycle." },
  { noun: "robot king",  qualifier: "made of toast." },
  { noun: "rainbow",     qualifier: "going the wrong way." },
  { noun: "sandwich",    qualifier: "with too many secrets." },
  { noun: "mountain",    qualifier: "wearing a sweater." },
  { noun: "bear",        qualifier: "writing a novel." },
  { noun: "bird",        qualifier: "running for mayor." },
  { noun: "cloud",       qualifier: "with a job." },
  { noun: "moon",        qualifier: "on a coffee break." },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daySeed(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayPrompt(dateKey: string): Prompt {
  const seed = daySeed(dateKey);
  return POOL[seed % POOL.length];
}

function formatToday(): string {
  const d = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function DailyPrompt() {
  const { state, bumpStreak } = useProgress();
  const [hydrated, setHydrated] = useState(false);
  const dateKey = todayKey();
  const prompt = todayPrompt(dateKey);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const drewToday = hydrated && state.streak.lastDate === dateKey;
  const streakCount = hydrated ? state.streak.count : 0;

  const handleStart = () => {
    bumpStreak();
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pt-6 pb-12">
      <section
        className="relative overflow-hidden rounded-3xl border border-line p-8 sm:p-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.96 0.04 80) 0%, oklch(0.94 0.04 25) 100%)",
        }}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
          Today&apos;s Prompt · {formatToday()}
        </p>

        <h1
          className="font-display text-ink mt-2"
          style={{ fontSize: "clamp(64px, 11vw, 120px)", fontWeight: 700, lineHeight: 0.9 }}
        >
          Draw a {prompt.noun}
          <br />
          <span style={{ color: "var(--accent)" }}>{prompt.qualifier}</span>
        </h1>

        <p className="text-ink-2 text-base sm:text-lg mt-5 max-w-md">
          A new prompt every day. 60 seconds, no eraser. Share your doodle, see
          what others made.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link
            href="/speed-sketch"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-paper transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", fontSize: 15 }}
          >
            {drewToday ? "Draw it again →" : "Start drawing →"}
          </Link>
          <Link
            href="/"
            className="px-5 py-3 rounded-full text-sm text-ink-2 border border-line hover:bg-paper-2 transition-colors"
          >
            Skip · pick a tool
          </Link>
          <div
            className="px-4 py-3 rounded-full text-sm text-ink-2"
            style={{ background: "rgba(19,26,42,0.06)" }}
          >
            Streak ·{" "}
            <span className="font-bold text-ink">
              {streakCount} {streakCount === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        <p
          className="font-display mt-6 text-ink-3"
          style={{ fontSize: 22, fontWeight: 500 }}
        >
          ↑ no account · your art stays in your browser
        </p>
      </section>

      <section className="mt-10 text-center">
        <p className="text-sm text-ink-3">
          Today&apos;s prompt is the same for everyone, every day.
        </p>
      </section>
    </main>
  );
}
