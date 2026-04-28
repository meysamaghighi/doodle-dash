"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress, type GalleryItem } from "../hooks/useProgress";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return "";
  }
}

function downloadItem(item: GalleryItem) {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = item.dataUrl;
  a.download = `${item.gameId}-${item.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function GalleryView() {
  const { state, removeDrawing } = useProgress();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Newest first
  const items = [...state.gallery].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  if (!hydrated) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
          Your gallery
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-2">
            Your gallery
          </p>
          <h1
            className="font-display text-ink"
            style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 0.95 }}
          >
            {items.length === 0 ? "Empty for now." : `${items.length} ${items.length === 1 ? "doodle" : "doodles"}.`}
          </h1>
        </div>
        <p className="text-sm text-ink-2 max-w-xs">
          Saved locally in your browser. We never see your art.
        </p>
      </header>

      {items.length === 0 ? (
        <section className="rounded-3xl border border-line bg-paper-2 p-12 text-center">
          <p className="text-ink-2 mb-4">
            Your gallery fills up as you complete drawing prompts. Try the
            blind-draw or today&apos;s prompt to make your first one.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/daily"
              className="px-5 py-2 rounded-full text-sm font-medium text-paper transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Today&apos;s prompt
            </Link>
            <Link
              href="/blind-draw"
              className="px-5 py-2 rounded-full text-sm text-ink border border-line hover:bg-paper transition-colors"
            >
              Blind Draw
            </Link>
          </div>
        </section>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
          }}
        >
          {items.map(item => (
            <figure
              key={item.id}
              className="group relative rounded-xl border border-line bg-paper-2 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.dataUrl}
                alt={item.gameId}
                className="w-full aspect-square object-cover bg-paper"
              />
              <figcaption className="px-3 py-2 flex items-center justify-between text-xs">
                <span className="font-mono text-ink-2 truncate">
                  {item.gameId}
                </span>
                <span className="font-mono text-ink-3 ml-2">
                  {formatDate(item.createdAt)}
                </span>
              </figcaption>
              <div className="absolute inset-x-0 bottom-0 hidden group-hover:flex group-focus-within:flex justify-center gap-2 p-2 bg-paper/90 border-t border-line">
                <button
                  type="button"
                  onClick={() => downloadItem(item)}
                  className="px-3 py-1 rounded-full text-xs text-ink border border-line hover:bg-paper-2 transition-colors"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this doodle? It cannot be recovered.")) {
                      removeDrawing(item.id);
                    }
                  }}
                  className="px-3 py-1 rounded-full text-xs text-ink-2 border border-line hover:bg-paper-2 transition-colors"
                >
                  Delete
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
