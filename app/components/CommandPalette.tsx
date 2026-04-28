"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Item = { label: string; href: string; group: string };

const ITEMS: Item[] = [
  { label: "Home", href: "/", group: "Pages" },
  { label: "Daily Prompt", href: "/daily", group: "Pages" },
  { label: "Gallery", href: "/gallery", group: "Pages" },
  { label: "About", href: "/about", group: "Pages" },
  { label: "Speed Sketch", href: "/speed-sketch", group: "Games" },
  { label: "Pixel Art", href: "/pixel-art", group: "Games" },
  { label: "Mirror Draw", href: "/mirror-draw", group: "Games" },
  { label: "Memory Draw", href: "/memory-draw", group: "Games" },
  { label: "One Line", href: "/one-line", group: "Games" },
  { label: "Blind Draw", href: "/blind-draw", group: "Games" },
  { label: "Dot Connect", href: "/dot-connect", group: "Games" },
  { label: "Trace Master", href: "/trace-master", group: "Games" },
  { label: "Symmetry Draw", href: "/symmetry", group: "Games" },
  { label: "Color Fill", href: "/color-fill", group: "Games" },
  { label: "Spiral Draw", href: "/spiral-draw", group: "Games" },
  { label: "Sketch Copy", href: "/sketch-copy", group: "Games" },
  { label: "Kaleidoscope", href: "/kaleidoscope", group: "Games" },
  { label: "Shape Builder", href: "/shape-builder", group: "Games" },
  { label: "Gradient Paint", href: "/gradient-paint", group: "Games" },
];

function matches(item: Item, q: string): boolean {
  const haystack = `${item.label} ${item.group}`.toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  let pos = 0;
  for (const ch of needle) {
    const idx = haystack.indexOf(ch, pos);
    if (idx === -1) return false;
    pos = idx + 1;
  }
  return true;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = ITEMS.filter(i => matches(i, query));

  useEffect(() => {
    if (open) {
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selected];
        if (item) { router.push(item.href); close(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, router, close]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-ink-2 hover:text-ink transition-colors p-1 rounded-lg"
        aria-label="Search (⌘K)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <kbd className="hidden sm:inline text-xs font-mono border border-line rounded px-1.5 py-0.5 text-ink-3 leading-none">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in oklab, var(--ink) 15%, transparent)" }}
            onClick={close}
          />
          <div className="relative w-full max-w-lg bg-paper border border-line rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <svg className="w-4 h-4 text-ink-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages and games…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="text-xs text-ink-3 font-mono border border-line rounded px-1.5 py-0.5 leading-none">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-3">No results</p>
              ) : filtered.map((item, i) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => { router.push(item.href); close(); }}
                  onMouseMove={() => setSelected(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-4 transition-colors ${
                    i === selected ? "bg-paper-2 text-ink" : "text-ink-2"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 text-xs font-mono text-ink-3">{item.group}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4 px-4 py-2 border-t border-line text-xs text-ink-3 font-mono">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
