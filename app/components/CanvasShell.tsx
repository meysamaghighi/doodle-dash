"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

export type ActivityStatus = "idle" | "playing" | "ended";

export type ActivityResult = {
  score: number;
  mode: "higher" | "lower";
  unit?: string;
  extra?: ReactNode;
};

export type CanvasShellProps = {
  id: string;
  title: string;
  howTo: ReactNode;
  status: ActivityStatus;
  result?: ActivityResult;
  onRestart?: () => void;
  onShare?: () => void;
  fullscreen?: boolean;
  children: ReactNode;
};

export default function CanvasShell({
  id,
  title,
  howTo,
  status,
  result,
  onRestart,
  onShare,
  fullscreen = true,
  children,
}: CanvasShellProps) {
  const [showHowTo, setShowHowTo] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [cssFs, setCssFs] = useState(false);
  const wrapRef = useRef<HTMLElement>(null);

  type DocExt = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?(): void };
  type ElExt = HTMLElement & { webkitRequestFullscreen?(): void };

  useEffect(() => {
    const sync = () => {
      const doc = document as DocExt;
      if (!(doc.fullscreenElement ?? doc.webkitFullscreenElement) && !cssFs) setIsFs(false);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [cssFs]);

  useEffect(() => {
    if (!cssFs) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsFs(false); setCssFs(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cssFs]);

  const toggleFs = async () => {
    if (!fullscreen || !wrapRef.current) return;
    const el = wrapRef.current as ElExt;
    const doc = document as DocExt;
    if (isFs) {
      setIsFs(false); setCssFs(false);
      if (doc.fullscreenElement) doc.exitFullscreen().catch(() => {});
      else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.();
      return;
    }
    if (el.requestFullscreen) {
      try { await el.requestFullscreen(); setIsFs(true); }
      catch { setIsFs(true); setCssFs(true); }
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen(); setIsFs(true);
    } else { setIsFs(true); setCssFs(true); }
  };

  return (
    <section
      ref={wrapRef}
      data-activity={id}
      data-status={status}
      className={`relative bg-paper text-ink${cssFs && isFs ? " fixed inset-0 z-[9999] overflow-auto" : ""}`}
    >
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs text-ink-3 hover:text-ink"
            aria-label="Back to home"
          >
            ← Home
          </Link>
          <h1
            className="font-display text-lg sm:text-xl"
            style={{ fontWeight: 700 }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHowTo(true)}
            aria-label="How to play"
            className="px-2.5 py-1 border border-line rounded-full text-xs text-ink-2 hover:bg-paper-2"
          >
            ?
          </button>
          {fullscreen && (
            <button
              type="button"
              onClick={toggleFs}
              aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
              className="px-2.5 py-1 border border-line rounded-full text-xs text-ink-2 hover:bg-paper-2"
            >
              {isFs ? "Exit" : "⛶"}
            </button>
          )}
        </div>
      </header>

      <div className="relative">{children}</div>

      {status === "ended" && result && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-0 bottom-0 mx-auto mb-6 max-w-md rounded-2xl border border-line bg-paper-2 p-5 text-center shadow-lg"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
            Result
          </p>
          <p
            className="font-display text-4xl text-ink mt-1"
            style={{ fontWeight: 700 }}
          >
            {result.score}
            {result.unit ? (
              <span className="text-base text-ink-2 ml-1">{result.unit}</span>
            ) : null}
          </p>
          {result.extra && (
            <div className="mt-2 text-sm text-ink-2">{result.extra}</div>
          )}
          <div className="mt-4 flex justify-center gap-2">
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="px-4 py-2 rounded-full text-sm font-medium text-paper"
                style={{ background: "var(--accent)" }}
              >
                Play again
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="px-4 py-2 rounded-full text-sm font-medium border border-line text-ink hover:bg-paper"
              >
                Share
              </button>
            )}
          </div>
        </div>
      )}

      {showHowTo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-howto-title`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => setShowHowTo(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-paper p-6"
            onClick={e => e.stopPropagation()}
          >
            <p
              id={`${id}-howto-title`}
              className="font-mono text-xs uppercase tracking-wider text-ink-3"
            >
              How to play
            </p>
            <div className="mt-2 text-sm text-ink-2 leading-relaxed">
              {howTo}
            </div>
            <button
              type="button"
              onClick={() => setShowHowTo(false)}
              className="mt-5 w-full px-4 py-2 rounded-full text-sm font-medium text-paper"
              style={{ background: "var(--accent)" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
