"use client";

import type { Guess, RobotState } from "./useRobot";

/**
 * The robot thinking out loud.
 *
 * This is the whole thrill of the game, so it gets real estate and reacts on
 * every stroke. Runners-up are shown too: watching the guess list churn from
 * "duck, swan, bird" to "DRAGON" as you add a tail is the bit kids replay.
 */
export default function RobotSays({
  state,
  guesses,
  won,
  idleHint = "Start drawing and I'll guess!",
}: {
  state: RobotState;
  guesses: Guess[];
  won?: boolean;
  idleHint?: string;
}) {
  const top = guesses[0];
  const rest = guesses.slice(1, 4);

  return (
    <div
      className="rounded-2xl border border-line bg-paper-2 px-4 py-3 min-h-[92px] flex items-center gap-3 transition-colors"
      style={won ? { borderColor: "var(--accent-2)", background: "color-mix(in oklch, var(--accent-2) 12%, var(--paper-2))" } : undefined}
      aria-live="polite"
    >
      <span className="text-3xl shrink-0" aria-hidden="true">
        {state === "failed" ? "🙈" : won ? "🎉" : state === "loading" ? "🤖" : "🤖"}
      </span>

      <div className="min-w-0 flex-1">
        {state === "loading" && (
          <p className="text-sm text-ink-2">Waking up the robot…</p>
        )}

        {state === "failed" && (
          <p className="text-sm text-ink-2">
            The robot is having a nap — keep drawing, it still counts as art.
          </p>
        )}

        {state === "ready" && !top && (
          <p className="text-sm text-ink-2">{idleHint}</p>
        )}

        {state === "ready" && top && (
          <>
            <p className="font-display text-xl sm:text-2xl text-ink leading-tight truncate" style={{ fontWeight: 700 }}>
              {won ? "I see it — " : "Is it "}
              <span style={{ color: "var(--accent)" }}>{top.label}</span>
              {won ? "!" : "?"}
            </p>
            {rest.length > 0 && (
              <p className="mt-0.5 font-mono text-[11px] text-ink-3 truncate">
                or maybe {rest.map(g => g.label).join(" · ")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
