"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteDrawing,
  getDrawing,
  listDrawings,
  migrateLegacyGallery,
  putDrawing,
  type DrawingRecord,
} from "../lib/gallery-store";
import {
  completeDaily as completeDailyPure,
  createEmptyArtboxState,
  type ArtboxState,
  type UnlockDef,
} from "../lib/artbox";

export type ProgressMode = "higher" | "lower";

export type ProgressEntry = {
  best: number;
  plays: number;
  lastScore: number;
  mode: ProgressMode;
};

export type GalleryItem = {
  id: string;
  gameId: string;
  dataUrl: string;
  createdAt: string;
};

// v1 (legacy): gallery images lived inline in this object as data-URLs,
// which is the bug this file exists to fix (see gallery-store.ts header).
export type ProgressV1 = {
  v: 1;
  lastPlayed: string | null;
  streak: { count: number; lastDate: string | null };
  history: Record<string, ProgressEntry>;
  gallery: GalleryItem[];
};

// v2: gallery images live in IndexedDB (app/lib/gallery-store.ts); only the
// small counters/unlocks stay in localStorage. `artbox` is the new reward
// system (app/lib/artbox.ts) — total-days-completed, no streak.
export type ProgressV2 = {
  v: 2;
  lastPlayed: string | null;
  streak: { count: number; lastDate: string | null };
  history: Record<string, ProgressEntry>;
  artbox: ArtboxState;
};

// Shape returned to components: ProgressV2 plus the gallery, which is kept
// as separate React state (populated async from IndexedDB) but merged back
// onto `state` so existing call sites reading `state.gallery` don't change.
export type PublicProgressState = ProgressV2 & { gallery: GalleryItem[] };

const SITE_ID = "doodlelab";
const STORAGE_KEY = `${SITE_ID}_progress`;

const EMPTY: ProgressV2 = {
  v: 2,
  lastPlayed: null,
  streak: { count: 0, lastDate: null },
  history: {},
  artbox: createEmptyArtboxState(),
};

type LoadResult = {
  progress: ProgressV2;
  /**
   * null = the stored record was already v2 (nothing to migrate).
   * An array (possibly empty) = the record was v1; migrate its images
   * (if any) into IndexedDB, then write back the clean v2 shape.
   */
  legacyGallery: GalleryItem[] | null;
};

function load(): LoadResult {
  if (typeof window === "undefined") return { progress: EMPTY, legacyGallery: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: EMPTY, legacyGallery: null };
    const parsed = JSON.parse(raw);

    if (parsed?.v === 2) {
      return {
        progress: {
          v: 2,
          lastPlayed: parsed.lastPlayed ?? null,
          streak: parsed.streak ?? EMPTY.streak,
          history: parsed.history ?? {},
          artbox: parsed.artbox ?? createEmptyArtboxState(),
        },
        legacyGallery: null,
      };
    }

    if (parsed?.v === 1) {
      const progress: ProgressV2 = {
        v: 2,
        lastPlayed: parsed.lastPlayed ?? null,
        streak: parsed.streak ?? EMPTY.streak,
        history: parsed.history ?? {},
        artbox: createEmptyArtboxState(),
      };
      const legacyGallery: GalleryItem[] = Array.isArray(parsed.gallery) ? parsed.gallery : [];
      return { progress, legacyGallery };
    }
  } catch {}
  return { progress: EMPTY, legacyGallery: null };
}

/**
 * `legacyGallerySafetyNet`: while a v1 -> v2 migration is in flight (or has
 * failed), any unrelated save (e.g. a game calling recordPlay) must not wipe
 * out the not-yet-migrated gallery images. Passing the pending legacy list
 * here keeps it embedded in the persisted JSON until migration is confirmed
 * done, at which point callers pass null and the field disappears.
 */
function save(state: ProgressV2, legacyGallerySafetyNet: GalleryItem[] | null): void {
  if (typeof window === "undefined") return;
  try {
    const payload: Record<string, unknown> = { ...state };
    if (legacyGallerySafetyNet && legacyGallerySafetyNet.length > 0) {
      payload.gallery = legacyGallerySafetyNet;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    // This is the exact bug this file exists to fix: the old code had an
    // empty `catch {}` here, so a full localStorage quota silently dropped
    // every future save (scores, streak, everything). We can't necessarily
    // recover the write, but we can stop hiding it.
    console.error("[doodlelab] failed to save progress", err);
  }
}

function readLegacyBest(gameId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const legacy = localStorage.getItem(`pb-${gameId}`);
    if (legacy === null) return null;
    const n = parseFloat(legacy);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysApart(a: string, b: string): number {
  return Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / 86_400_000
  );
}

export function useProgress() {
  const [state, setState] = useState<ProgressV2>(EMPTY);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryReady, setGalleryReady] = useState(false);
  // Non-null only between "we detected a v1 record with images" and
  // "migration to IndexedDB confirmed done". See `save()` above.
  const pendingLegacyGalleryRef = useRef<GalleryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { progress, legacyGallery } = load();
      const wasV1 = legacyGallery !== null;
      pendingLegacyGalleryRef.current =
        legacyGallery && legacyGallery.length > 0 ? legacyGallery : null;

      if (!cancelled) setState(progress);

      if (pendingLegacyGalleryRef.current) {
        const records: DrawingRecord[] = pendingLegacyGalleryRef.current.map(g => ({
          id: g.id,
          gameId: g.gameId,
          dataUrl: g.dataUrl,
          createdAt: g.createdAt,
        }));
        const { failed } = await migrateLegacyGallery(records);
        if (!failed) {
          pendingLegacyGalleryRef.current = null;
          // Use the functional form so this always persists the LATEST
          // state, not the `progress` captured above — a recordPlay/
          // bumpStreak call could have landed while migration was in
          // flight, and we must not clobber it.
          setState(prev => {
            save(prev, null);
            return prev;
          });
        } else {
          // Never drop the child's drawings: leave the v1 localStorage
          // record exactly as-is (save() above keeps embedding it via the
          // ref) and try again next load.
          console.warn(
            "[doodlelab] gallery migration to IndexedDB failed (unavailable or a write failed); " +
              "keeping the legacy copy in localStorage and will retry next load"
          );
        }
      } else if (wasV1) {
        // v1 record, but its gallery was already empty — nothing to
        // migrate, just normalise storage to the v2 shape once.
        setState(prev => {
          save(prev, null);
          return prev;
        });
      }

      // Hydrate the displayable gallery: legacy (not-yet-migrated) items
      // always win over anything with the same id already in IndexedDB,
      // since they're the untouched source of truth until migration is
      // confirmed complete.
      const legacyItems = pendingLegacyGalleryRef.current ?? [];
      const meta = await listDrawings();
      const migratedItems = (
        await Promise.all(
          meta.map(async m => {
            const rec = await getDrawing(m.id);
            return rec
              ? ({ id: rec.id, gameId: rec.gameId, dataUrl: rec.dataUrl, createdAt: rec.createdAt } as GalleryItem)
              : null;
          })
        )
      ).filter((item): item is GalleryItem => item !== null);

      const legacyIds = new Set(legacyItems.map(i => i.id));
      const merged = [...legacyItems, ...migratedItems.filter(i => !legacyIds.has(i.id))];

      if (!cancelled) {
        setGallery(merged);
        setGalleryReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const recordPlay = useCallback(
    (gameId: string, score: number, mode: ProgressMode) => {
      let isNewBest = false;
      setState(prev => {
        const existing = prev.history[gameId];
        const currentBest = existing ? existing.best : readLegacyBest(gameId);
        const isBetter =
          currentBest === null ||
          (mode === "higher" ? score > currentBest : score < currentBest);
        isNewBest = isBetter;
        const next: ProgressV2 = {
          ...prev,
          lastPlayed: todayISO(),
          history: {
            ...prev.history,
            [gameId]: {
              best: isBetter ? score : (currentBest as number),
              plays: (existing?.plays ?? 0) + 1,
              lastScore: score,
              mode,
            },
          },
        };
        save(next, pendingLegacyGalleryRef.current);
        return next;
      });
      return { isNewBest };
    },
    []
  );

  const bumpStreak = useCallback(() => {
    setState(prev => {
      const today = todayISO();
      const last = prev.streak.lastDate;
      let count = prev.streak.count;
      if (last === today) {
        return prev;
      }
      if (last && daysApart(today, last) === 1) {
        count += 1;
      } else {
        count = 1;
      }
      const next: ProgressV2 = {
        ...prev,
        streak: { count, lastDate: today },
      };
      save(next, pendingLegacyGalleryRef.current);
      return next;
    });
  }, []);

  /**
   * Record a completed daily challenge (Art Box). Deliberately separate
   * from `bumpStreak`, which is the older, unrelated /daily "N-day streak"
   * feature this hook already exposed — the Art Box explicitly tracks
   * total days completed, never consecutive. Returns which unlocks (if
   * any) just fired so the caller can celebrate; empty if `dateISO` was
   * already recorded (no double-counting a day).
   */
  const completeDaily = useCallback((dateISO?: string) => {
    const date = dateISO ?? todayISO();
    let newlyUnlocked: UnlockDef[] = [];
    setState(prev => {
      const result = completeDailyPure(prev.artbox, date);
      newlyUnlocked = result.newlyUnlocked;
      if (result.state === prev.artbox) {
        return prev; // already completed today — no-op, don't touch storage
      }
      const next: ProgressV2 = { ...prev, artbox: result.state };
      save(next, pendingLegacyGalleryRef.current);
      return next;
    });
    return { newlyUnlocked };
  }, []);

  const saveDrawing = useCallback((gameId: string, dataUrl: string) => {
    const id = `${gameId}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    // Optimistic UI: show it immediately, newest first, before the
    // IndexedDB write resolves.
    setGallery(prev => [{ id, gameId, dataUrl, createdAt }, ...prev]);
    putDrawing({ id, gameId, dataUrl, createdAt }).catch(err => {
      console.error("[doodlelab] failed to save drawing", err);
    });
    return id;
  }, []);

  const removeDrawing = useCallback((id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
    deleteDrawing(id).catch(err => {
      console.error("[doodlelab] failed to delete drawing", err);
    });
    if (pendingLegacyGalleryRef.current) {
      // Purge from the not-yet-migrated safety-net list too, so a deleted
      // drawing doesn't reappear on the next load before migration lands.
      pendingLegacyGalleryRef.current = pendingLegacyGalleryRef.current.filter(
        item => item.id !== id
      );
      setState(prev => {
        save(prev, pendingLegacyGalleryRef.current);
        return prev;
      });
    }
  }, []);

  const reset = useCallback(() => {
    pendingLegacyGalleryRef.current = null;
    setState(EMPTY);
    save(EMPTY, null);
    setGallery(currentGallery => {
      // Best-effort wipe of persisted images too; fire-and-forget since
      // this callback must stay synchronous.
      Promise.all(currentGallery.map(item => deleteDrawing(item.id))).catch(err => {
        console.error("[doodlelab] failed to clear gallery during reset", err);
      });
      return [];
    });
  }, []);

  const publicState: PublicProgressState = { ...state, gallery };

  return {
    state: publicState,
    recordPlay,
    bumpStreak,
    completeDaily,
    saveDrawing,
    removeDrawing,
    reset,
    galleryReady,
  };
}

// Test-only seam (see scripts/test-artbox-gallery.ts). `load`/`save` hold
// the actual v1 -> v2 migration + "never drop the legacy gallery" logic;
// exporting them narrowly like this lets a plain node/tsx script exercise
// that logic directly without spinning up a React renderer. Not part of the
// public hook API — nothing in app/ should import this.
export const __testing = { load, save, STORAGE_KEY };
