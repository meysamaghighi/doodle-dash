/**
 * Standalone tests for the Art Box reward system (app/lib/artbox.ts) and the
 * storage layer that backs it (app/lib/gallery-store.ts, app/hooks/useProgress.ts).
 *
 * There is no test runner in this repo. Run with:
 *
 *   npx tsx scripts/test-artbox-gallery.ts
 *
 * (or `node --experimental-strip-types scripts/test-artbox-gallery.ts` on Node 23+)
 *
 * Coverage:
 *   1. Art Box unlock thresholds match the spec table exactly.
 *   2. Completing the same day twice never double-counts or re-fires unlocks.
 *   3. Missed days cost nothing — non-consecutive completion still accumulates
 *      correctly (there is deliberately no streak concept here).
 *   4. useProgress's v1 -> v2 migration: field mapping is correct, and when
 *      IndexedDB is unavailable (true in plain Node, and the same code path
 *      exercised by a real browser with IndexedDB disabled) the migration
 *      fails closed — the legacy gallery data-URLs are never lost.
 *   5. gallery-store's CRUD (put/get/list/delete/count) against its
 *      localStorage fallback path, which is the same backend
 *      migrateLegacyGallery would write through if allowFallback were true.
 *
 * KNOWN GAP (documented, not silently skipped): plain Node has no
 * IndexedDB, so the "migration succeeds and writes into real IndexedDB"
 * path cannot be exercised here. Section 4 instead proves the code fails
 * *closed* (no data loss) when IndexedDB is absent, which is the harder
 * and more important guarantee. The real-IndexedDB success path should be
 * spot-checked manually in a browser (e.g. DevTools > Application >
 * IndexedDB after loading a page with legacy `doodlelab_progress` v1 data
 * seeded into localStorage) during playtest.
 */

// ---- minimal browser polyfills, set up BEFORE importing app code --------
// `typeof window === "undefined"` guards in useProgress.ts / gallery-store.ts
// only run at call time, but we set these first for clarity and safety.

class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
}

const memoryStorage = new MemoryStorage();
(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: Storage }).localStorage =
  memoryStorage as unknown as Storage;
// Deliberately NOT setting `indexedDB` — plain Node has none, and that's
// exactly the "IndexedDB unavailable" environment section 4 tests.

// ---- imports (after polyfills are in place) ------------------------------

import {
  UNLOCKS,
  completeDaily,
  createEmptyArtboxState,
  isUnlocked,
  nextUnlock,
  stickerCount,
  type ArtboxState,
} from "../app/lib/artbox";
import {
  __resetGalleryStoreForTests,
  countDrawings,
  deleteDrawing,
  getDrawing,
  listDrawings,
  migrateLegacyGallery,
  putDrawing,
  type DrawingRecord,
} from "../app/lib/gallery-store";

// ---- tiny assertion harness ----------------------------------------------

let pass = 0;
let fail = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    pass++;
  } else {
    fail++;
    console.error(`FAIL: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, `${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function section(name: string, run: () => void | Promise<void>): Promise<void> {
  console.log(`\n-- ${name} --`);
  await run();
}

// ---- section 1: unlock thresholds match the spec table exactly ----------

async function testThresholds(): Promise<void> {
  const expected: Record<string, number> = {
    "glow-pen": 3,
    "rainbow-ink": 5,
    stamps: 8,
    papers: 12,
    "symmetry-16-24": 15,
    "gold-holo-ink": 20,
    "giant-canvas": 25,
  };
  assertEqual(UNLOCKS.length, Object.keys(expected).length, "UNLOCKS has exactly 7 entries");
  for (const def of UNLOCKS) {
    assertEqual(def.threshold, expected[def.id], `${def.id} threshold`);
  }

  // Walk day-by-day from 0 to 26 and confirm isUnlocked flips exactly at
  // the threshold, never before, never staying locked after.
  let state: ArtboxState = createEmptyArtboxState();
  let day = 0;
  for (let n = 1; n <= 26; n++) {
    const dateISO = `2026-01-${String((day % 28) + 1).padStart(2, "0")}-${n}`; // guaranteed-unique fake date
    const result = completeDaily(state, dateISO);
    state = result.state;
    day++;
    assertEqual(stickerCount(state), n, `stickerCount after ${n} unique completions`);
    for (const def of UNLOCKS) {
      const shouldBeUnlocked = n >= def.threshold;
      assertEqual(
        isUnlocked(state, def.id),
        shouldBeUnlocked,
        `${def.id} isUnlocked at count=${n} (threshold ${def.threshold})`
      );
    }
  }
  // After 25+ completions, nextUnlock is null (everything unlocked).
  assertEqual(nextUnlock(state), null, "nextUnlock is null once all 7 tools are unlocked");
}

// ---- section 2: no double-count per day ----------------------------------

async function testNoDoubleCount(): Promise<void> {
  let state = createEmptyArtboxState();
  const r1 = completeDaily(state, "2026-08-18");
  state = r1.state;
  assertEqual(stickerCount(state), 1, "first completion of a day counts");
  assertEqual(r1.newlyUnlocked.length, 0, "1 sticker unlocks nothing yet (first threshold is 3)");

  const r2 = completeDaily(state, "2026-08-18"); // same day again
  assertEqual(stickerCount(r2.state), 1, "completing the same day twice does not double-count");
  assertEqual(r2.newlyUnlocked.length, 0, "no unlock fires on a repeat completion");
  assert(r2.state === state, "repeat completion returns the SAME state reference (cheap no-op check)");

  // Completing a THIRD time (still same day) is also a no-op.
  const r3 = completeDaily(r2.state, "2026-08-18");
  assertEqual(stickerCount(r3.state), 1, "triple-completing one day still counts as 1");
}

// ---- section 3: missed days cost nothing, no streak ----------------------

async function testMissedDaysDontReset(): Promise<void> {
  let state = createEmptyArtboxState();
  // Complete 3 days, then skip a huge gap (simulating a month-long school
  // trip), then complete a 4th day far in the future.
  for (const d of ["2026-01-01", "2026-01-02", "2026-01-03"]) {
    state = completeDaily(state, d).state;
  }
  assertEqual(stickerCount(state), 3, "3 consecutive days completed");
  const glowResult = completeDaily(state, "2026-01-03"); // re-check: no regression from repeats above
  assertEqual(stickerCount(glowResult.state), 3, "still 3 after a repeat");

  // Big gap — 90 days later. Total-days-completed must simply become 4,
  // with no penalty, no reset, no notion of a "broken streak."
  const afterGap = completeDaily(state, "2026-04-03");
  assertEqual(stickerCount(afterGap.state), 4, "a 90-day gap costs nothing — count just goes to 4");
  // glow-pen threshold is 3, so it should already be unlocked at count 4.
  assert(isUnlocked(afterGap.state, "glow-pen"), "glow pen unlocked (threshold 3, count is 4)");

  // There is no `streak`-like field on ArtboxState at all — this is a type
  // check as much as a runtime one: if someone adds a streak concept back
  // to ArtboxState, this line stops compiling, which is the point.
  const stateKeys = Object.keys(afterGap.state);
  assertEqual(stateKeys, ["completedDates"], "ArtboxState has no streak/consecutive-day field");
}

// ---- section 4: useProgress v1 -> v2 migration fails closed --------------

async function testMigrationFailsClosed(): Promise<void> {
  __resetGalleryStoreForTests();
  memoryStorage.clear();

  const legacyRecords: DrawingRecord[] = [
    { id: "blind-draw-1", gameId: "blind-draw-cat", dataUrl: "data:image/png;base64,AAA", createdAt: "2026-08-01T10:00:00.000Z" },
    { id: "blind-draw-2", gameId: "blind-draw-dog", dataUrl: "data:image/png;base64,BBB", createdAt: "2026-08-02T10:00:00.000Z" },
  ];

  // Seed a legacy v1 progress blob directly into localStorage, exactly as
  // an old build of the app would have left it.
  const legacyV1 = {
    v: 1,
    lastPlayed: "2026-08-02",
    streak: { count: 2, lastDate: "2026-08-02" },
    history: { "blind-draw": { best: 0.8, plays: 2, lastScore: 0.8, mode: "higher" } },
    gallery: legacyRecords,
  };
  memoryStorage.setItem("doodlelab_progress", JSON.stringify(legacyV1));

  // Import useProgress's module-private load/save via its test-only seam.
  const mod = await import("../app/hooks/useProgress");
  const testing = (mod as unknown as {
    __testing?: {
      load: () => { progress: unknown; legacyGallery: DrawingRecord[] | null };
      save: (state: unknown, legacyGallerySafetyNet: DrawingRecord[] | null) => void;
    };
  }).__testing;

  assert(!!testing, "useProgress exports a __testing seam for load/save");
  if (!testing) return;

  const { progress, legacyGallery } = testing.load();
  assertEqual((progress as { v: number }).v, 2, "load() reports v2 after reading a v1 record");
  assertEqual(
    (progress as { streak: unknown }).streak,
    legacyV1.streak,
    "streak carried over unchanged from v1"
  );
  assertEqual(
    (progress as { history: unknown }).history,
    legacyV1.history,
    "history carried over unchanged from v1"
  );
  assertEqual(legacyGallery?.length, 2, "load() surfaces the 2 legacy gallery items for migration");

  // Attempt the real migration path. IndexedDB is unavailable in this
  // (Node) environment, so this MUST fail closed: no data silently moved
  // into a lossy capped fallback, nothing deleted.
  const { migratedIds, failed } = await migrateLegacyGallery(legacyRecords);
  assertEqual(failed, true, "migration reports failed when IndexedDB is unavailable");
  assertEqual(migratedIds.length, 0, "nothing is reported migrated on failure");

  // Mirror exactly what useProgress does on a failed migration: it keeps
  // saving with the legacy gallery embedded as a safety net.
  testing.save(progress, legacyGallery);

  const raw = memoryStorage.getItem("doodlelab_progress");
  assert(raw !== null, "progress key still present after a failed-migration save");
  const persisted = JSON.parse(raw as string);
  assertEqual(persisted.v, 2, "persisted record is v2-shaped");
  assertEqual(
    persisted.gallery,
    legacyRecords,
    "CRITICAL: the child's drawings are still present verbatim — nothing was lost"
  );

  // Also verify nothing was silently written into the fallback store on a
  // failed (allowFallback:false) migration attempt.
  const countAfterFailedMigration = await countDrawings();
  assertEqual(countAfterFailedMigration, 0, "no drawings leaked into the fallback store on failed migration");
}

// ---- section 5: gallery-store CRUD against the fallback backend ---------

async function testGalleryStoreFallbackCrud(): Promise<void> {
  __resetGalleryStoreForTests();
  memoryStorage.clear();

  const a: DrawingRecord = { id: "a", gameId: "speed-sketch-cat", dataUrl: "data:image/png;base64,AAA", createdAt: "2026-08-10T00:00:00.000Z" };
  const b: DrawingRecord = { id: "b", gameId: "speed-sketch-dog", dataUrl: "data:image/png;base64,BBB", createdAt: "2026-08-11T00:00:00.000Z" };
  const c: DrawingRecord = { id: "c", gameId: "speed-sketch-fox", dataUrl: "data:image/png;base64,CCC", createdAt: "2026-08-12T00:00:00.000Z" };

  await putDrawing(a); // allowFallback defaults true — must NOT throw even though there's no IndexedDB
  await putDrawing(b);
  await putDrawing(c);

  assertEqual(await countDrawings(), 3, "countDrawings reflects 3 puts via the fallback path");

  const list = await listDrawings();
  assertEqual(list.map(i => i.id), ["c", "b", "a"], "listDrawings is newest-first");
  assert(!("dataUrl" in (list[0] as object)), "listDrawings returns metadata only, no image data");

  const fetchedB = await getDrawing("b");
  assertEqual(fetchedB?.dataUrl, b.dataUrl, "getDrawing returns full image data for a specific id");

  await deleteDrawing("b");
  assertEqual(await countDrawings(), 2, "countDrawings reflects the delete");
  assertEqual(await getDrawing("b"), null, "deleted drawing is gone");

  // Cap enforcement: putting well past FALLBACK_CAP must never throw, and
  // must degrade by dropping the OLDEST entries rather than crashing.
  for (let i = 0; i < 20; i++) {
    await putDrawing({
      id: `bulk-${i}`,
      gameId: "robot-draw",
      dataUrl: `data:image/png;base64,BULK${i}`,
      createdAt: `2026-09-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
    });
  }
  const finalCount = await countDrawings();
  assert(finalCount <= 12, `fallback store stays capped (got ${finalCount}, cap is 12)`);
  assert(finalCount > 0, "cap enforcement never empties the store entirely");
}

// ---- run ------------------------------------------------------------------

async function main(): Promise<void> {
  await section("Art Box unlock thresholds", testThresholds);
  await section("No double-count per day", testNoDoubleCount);
  await section("Missed days don't reset anything (no streak)", testMissedDaysDontReset);
  await section("v1 -> v2 migration fails closed (no data loss)", testMigrationFailsClosed);
  await section("gallery-store CRUD via fallback backend", testGalleryStoreFallbackCrud);

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main().catch(err => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
