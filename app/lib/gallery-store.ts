"use client";

/**
 * IndexedDB-backed store for gallery drawing images.
 *
 * Why this exists: `useProgress` used to keep full PNG data-URLs (100-400KB
 * each) inside the `gallery` array of a single localStorage key. localStorage
 * caps out around 5MB, so after ~15-30 saved drawings `localStorage.setItem`
 * throws a quota error, and the old `save()` swallowed it in an empty
 * `catch {}` — a kid who draws a lot silently stopped persisting ANYTHING
 * (scores, unlocks, everything), not just the gallery. IndexedDB's quota is
 * hundreds of MB, so images belong there; localStorage keeps only the small
 * progress object.
 *
 * Degradation: some environments have no usable IndexedDB (private browsing
 * in some browsers, old Fire tablet webviews). Every function here falls
 * back to a small, capped localStorage-backed list (and finally an
 * in-memory-only list if even that throws) rather than crashing — so a save
 * always "succeeds" from the caller's point of view, it just may not survive
 * a full quota crunch on a truly hostile environment. See `saveFallback`.
 */

const SITE_ID = "doodlelab";
const DB_NAME = `${SITE_ID}-gallery`;
const DB_VERSION = 1;
const STORE = "drawings";

export type DrawingRecord = {
  id: string;
  gameId: string;
  /** Full PNG data-URL. Lives in IndexedDB (or the capped fallback), never localStorage's progress key. */
  dataUrl: string;
  createdAt: string;
};

export type DrawingMeta = Pick<DrawingRecord, "id" | "gameId" | "createdAt">;

// Fallback path: used only when IndexedDB is unavailable or a write to it
// fails. Capped hard so it can never reproduce the original quota bug.
const FALLBACK_CAP = 12;
const FALLBACK_KEY = `${SITE_ID}_gallery_fallback`;

// Doubles as an in-memory cache of the fallback list and as the absolute
// last resort store when even localStorage.setItem throws (some private
// modes disable it entirely) — keeps the current session usable without
// throwing, at the cost of not surviving a reload.
let memoryFallback: DrawingRecord[] | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function hasIndexedDB(): boolean {
  return isBrowser() && typeof indexedDB !== "undefined";
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

/** Opens (and memoises) the database. Resolves null — never rejects — if IndexedDB isn't usable here. */
function openDB(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(resolve => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      // Degrade instead of throwing — a broken/blocked IDB just means we
      // use the fallback path for the rest of the session.
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function loadFallback(): DrawingRecord[] {
  if (memoryFallback) return memoryFallback;
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    memoryFallback = raw ? (JSON.parse(raw) as DrawingRecord[]) : [];
  } catch {
    memoryFallback = [];
  }
  return memoryFallback;
}

function saveFallback(items: DrawingRecord[]): void {
  memoryFallback = items;
  if (!isBrowser()) return;
  let list = items;
  while (list.length > 0) {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
      memoryFallback = list;
      return;
    } catch {
      // Quota exceeded even for the capped fallback list — drop the oldest
      // entry and retry rather than throw. Bounded, so this loop always
      // terminates.
      list = list.slice(1);
    }
  }
  // Nothing fit in localStorage at all; keep the full list in memory only
  // so this save still "succeeds" for the current session.
  memoryFallback = items;
}

function pushToFallback(record: DrawingRecord): void {
  const items = loadFallback().filter(i => i.id !== record.id);
  items.push(record);
  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  while (items.length > FALLBACK_CAP) items.shift(); // drop oldest first
  saveFallback(items);
}

function idbTx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = run(tx.objectStore(STORE));
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.oncomplete = () => resolve(req.result);
  });
}

/**
 * Persist one drawing. Defaults to degrading to the capped fallback if
 * IndexedDB is unavailable/fails, so ordinary gameplay saves never throw.
 *
 * `allowFallback: false` is used only by `migrateLegacyGallery`, which needs
 * an honest failure signal (not a silent downgrade to a lossy capped list)
 * so it knows not to delete the legacy localStorage copy.
 */
export async function putDrawing(
  record: DrawingRecord,
  opts?: { allowFallback?: boolean }
): Promise<void> {
  const allowFallback = opts?.allowFallback ?? true;
  const db = await openDB();
  if (db) {
    try {
      await idbTx(db, "readwrite", store => store.put(record));
      return;
    } catch (err) {
      if (!allowFallback) throw err;
      // else fall through to the fallback path below
    }
  } else if (!allowFallback) {
    throw new Error("gallery-store: IndexedDB unavailable");
  }
  pushToFallback(record);
}

export async function getDrawing(id: string): Promise<DrawingRecord | null> {
  const db = await openDB();
  if (db) {
    try {
      const result = await idbTx(db, "readonly", store => store.get(id));
      if (result) return result as DrawingRecord;
    } catch {
      // fall through to fallback lookup
    }
  }
  return loadFallback().find(i => i.id === id) ?? null;
}

/** Metadata for every saved drawing, newest first. Does not include image data. */
export async function listDrawings(): Promise<DrawingMeta[]> {
  const seen = new Map<string, DrawingMeta>();
  const db = await openDB();
  if (db) {
    try {
      const all = await idbTx(db, "readonly", store => store.getAll());
      for (const r of all as DrawingRecord[]) {
        seen.set(r.id, { id: r.id, gameId: r.gameId, createdAt: r.createdAt });
      }
    } catch {
      // fall through — fallback entries (if any) are still merged in below
    }
  }
  // Merge in fallback entries too: a record can land in the fallback list if
  // it was written during a stretch where IndexedDB briefly failed, even on
  // a device that normally has it.
  for (const r of loadFallback()) {
    if (!seen.has(r.id)) {
      seen.set(r.id, { id: r.id, gameId: r.gameId, createdAt: r.createdAt });
    }
  }
  return [...seen.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDrawing(id: string): Promise<void> {
  const db = await openDB();
  if (db) {
    try {
      await idbTx(db, "readwrite", store => store.delete(id));
    } catch {
      // best effort — still try the fallback below in case it's there too
    }
  }
  const items = loadFallback();
  if (items.some(i => i.id === id)) {
    saveFallback(items.filter(i => i.id !== id));
  }
}

export async function countDrawings(): Promise<number> {
  const list = await listDrawings();
  return list.length;
}

/**
 * One-time migration: move legacy data-URLs (previously stored inline in
 * the progress blob's `gallery` array) into this store. All-or-nothing —
 * if IndexedDB is unavailable or any single write fails, the whole batch is
 * reported as failed and NOTHING is written, so the caller (useProgress)
 * knows to leave the original localStorage copy untouched rather than risk
 * losing drawings to the fallback list's cap.
 *
 * Idempotent: safe to call again on a later load if it failed before —
 * `putDrawing` is an upsert keyed by id, so a retry that gets further than
 * last time doesn't create duplicates.
 */
export async function migrateLegacyGallery(
  items: DrawingRecord[]
): Promise<{ migratedIds: string[]; failed: boolean }> {
  if (items.length === 0) return { migratedIds: [], failed: false };
  const migratedIds: string[] = [];
  try {
    for (const item of items) {
      await putDrawing(item, { allowFallback: false });
      migratedIds.push(item.id);
    }
    return { migratedIds, failed: false };
  } catch {
    return { migratedIds, failed: true };
  }
}

/** Test-only escape hatch: clears cached DB handle + in-memory fallback between test cases. Not for app code. */
export function __resetGalleryStoreForTests(): void {
  dbPromise = null;
  memoryFallback = null;
}
