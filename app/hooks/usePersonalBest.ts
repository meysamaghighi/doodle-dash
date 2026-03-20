"use client";

import { useState, useEffect, useRef } from "react";

export function usePersonalBest(key: string, mode: "lower" | "higher", score: number | null) {
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setBest(parseFloat(stored));
    } catch {}
    initialized.current = true;
  }, [key]);

  useEffect(() => {
    if (score === null || !initialized.current) {
      setIsNewBest(false);
      return;
    }
    const isBetter =
      best === null ||
      (mode === "higher" ? score > best : score < best);
    if (isBetter) {
      setBest(score);
      setIsNewBest(true);
      try { localStorage.setItem(key, String(score)); } catch {}
    } else {
      setIsNewBest(false);
    }
  }, [score]);

  return { best, isNewBest };
}
