"use client";

import { useCallback, useRef, useState } from "react";
import type { Point } from "./DrawPad";

export type Guess = { label: string; prob: number };
export type RobotState = "idle" | "loading" | "ready" | "failed";

/**
 * Lazy access to the on-device recogniser.
 *
 * The model and its 250KB of weights are pulled in with a dynamic import so
 * they never reach the shared bundle — the other fifteen games ship no
 * dependencies today and must stay that way.
 *
 * Failure is never fatal. If the weights can't be fetched (offline, a flaky
 * tablet, a bad deploy) the caller keeps a fully playable drawing toy that
 * simply isn't scored, which is much better than a broken page.
 */
export function useRobot() {
  const modelRef = useRef<unknown>(null);
  const apiRef = useRef<{
    classify: (m: unknown, b: Float32Array, k?: number) => Guess[];
    rasterize: (s: Point[][]) => Float32Array;
  } | null>(null);
  const [state, setState] = useState<RobotState>("idle");
  const inFlight = useRef<Promise<boolean> | null>(null);

  const load = useCallback(async (): Promise<boolean> => {
    if (modelRef.current) return true;
    if (inFlight.current) return inFlight.current;

    const run = (async () => {
      setState("loading");
      try {
        const qd = await import("../lib/quickdraw");
        const model = await qd.loadModel();
        modelRef.current = model;
        apiRef.current = {
          classify: (m, b, k) =>
            qd.classify(m as Parameters<typeof qd.classify>[0], b, k) as Guess[],
          rasterize: qd.strokesToBitmap,
        };
        setState("ready");
        return true;
      } catch {
        setState("failed");
        return false;
      } finally {
        inFlight.current = null;
      }
    })();

    inFlight.current = run;
    return run;
  }, []);

  /** Top-k guesses for the strokes drawn so far. Empty if the model isn't up. */
  const guess = useCallback((strokes: Point[][], k = 5): Guess[] => {
    const model = modelRef.current;
    const api = apiRef.current;
    if (!model || !api || !strokes.some(s => s.length)) return [];
    return api.classify(model, api.rasterize(strokes), k);
  }, []);

  return { state, load, guess };
}
