# Robot Draw + the Art Box — design

**Date:** 2026-08-18
**Status:** approved, ready to implement

## Why

GA4 for the 30 days to 2026-08-18 (1,288 active users):

- Kids try **2.8 games** for **0.5–1.3 minutes each** and leave.
- **14% return.** 96% of users are new.
- The **homepage** gets more engagement (3.6 min/user, 4.3 visits/user) than any game — it is
  being used as a menu, not a destination.
- `/daily` already exists and gets **8 users/month**, because nothing links to it.
- **18% of users are on Amazon Fire tablets** (210 of 229 tablet users are Fire HD 8/10),
  and **70% of all traffic arrives via Bing** — Edge and Fire Silk both default to it.

DoodleLab is a menu of 30-second toys with no goal, no progression and no reason to return.
More games will not fix that. This spec adds one thing worth staying for and one thing worth
coming back for.

## What we are building

**One loop:** a daily drawing challenge that a neural network judges live, rewarding real art
supplies that work across all 17 existing games.

Homepage front door: *"TODAY: draw a DRAGON — can you make the robot see it?"*

Kid draws → the model calls guesses as strokes land → recognition fires → *"GOT IT in 6.2s"* →
sticker earned → drawing saved to their own gallery.

### Three surfaces, one model

1. **`/robot-draw`** — new free-play game. Draw anything, the robot guesses, endless.
2. **`/daily`** — rebuilt around the challenge. One shared word per day, promoted on the homepage.
3. **`/speed-sketch`** — retrofit. It currently gives a prompt and 30 seconds and then does not
   score you at all. The model fixes that for a game 280 people already play.

## Rewards: no streak

**There is deliberately no consecutive-day streak.** Streaks work on adults through loss
aversion. On a child a broken streak reads as "I failed, I'm out", and school trips, holidays
and shared tablets guarantee it breaks. Progress is measured in **total days completed**, never
consecutive. The collection only ever grows.

### The Art Box

One sticker per daily challenge completed. Stickers unlock tools that work in **every** game:

| Stickers | Unlocks |
|---|---|
| 3 | Neon glow pen |
| 5 | Rainbow ink |
| 8 | Stamps (star, heart, sparkle) |
| 12 | Papers (galaxy, graph, kraft, blackboard) |
| 15 | 16- and 24-fold symmetry |
| 20 | Gold and holographic ink |
| 25 | Giant canvas |

**Hard rule: everything currently in DoodleLab stays unlocked forever.** Unlocks are strictly
additive. 96% of users are first-timers; a newcomer must never meet a greyed-out tool.

### The poster

Every daily drawing is kept. At 7 completed days the kid can export a **week strip**; at 30, a
**month poster** — a grid of their own drawings as one PNG, saved or shared via the existing
client-side share path. An artifact that exists only because they came back, made entirely of
their own work.

## Architecture

### The model — hand-rolled, no ML runtime

Trained offline in PyTorch on Google's Quick Draw dataset (CC BY 4.0, attribution required),
then **inference is hand-written TypeScript**. No TensorFlow.js, no onnxruntime-web.

Rationale: the input is 28×28 and the network is ~8M multiply-adds — single-digit milliseconds
in plain JS. Shipping a 1–10MB ML runtime to reach that would be absurd, would risk flaky WebGL
on the Fire HD 8 tablets that are 18% of our users, and would weigh down a site whose other 16
games currently ship no dependencies at all.

- **Categories:** ~100 curated, kid-appropriate. The full 345 include "wine glass" and
  "cigarette". The training script MUST validate every curated name against the official
  category list and fail loudly on any name not present — do not assume a name exists.
- **Input:** 28×28 grayscale, matching the `numpy_bitmap` distribution (stroke rasterised,
  centred, aspect preserved). The browser preprocessor must reproduce this exactly or accuracy
  collapses; this is the highest-risk part of the build and needs a parity test.
- **Net:** small CNN, ~3 conv blocks + dense. Target <2MB float32 weights, ideally int8 ~400KB.
- **Export:** flat binary weight blob + JSON manifest (shape, order, quantisation scale,
  category list) into `public/models/quickdraw/`.
- **Inference:** `app/lib/quickdraw/` — conv2d, maxpool, dense, softmax, plus the rasteriser.
  Pure TS, unit tested against fixtures produced by the Python side.

### Storage — fix before building on it

`useProgress` stores full PNG data-URLs in the `gallery` array inside `localStorage`. Cap is
~5MB; a drawing is 100–400KB. After roughly 15–30 saved drawings the quota throws, and `save()`
swallows it in an empty `catch {}`. **Today a kid who draws a lot silently stops saving their
progress entirely.** Building a reward system on that would make the bug much worse.

- Move gallery images to **IndexedDB** (hundreds of MB quota).
- Keep the small progress object (counters, unlocks, completed days) in `localStorage`.
- Surface write failures instead of swallowing them.
- Migrate existing localStorage galleries on first load; never drop a child's drawings.

## Workstreams

Scoped to disjoint file sets so they can run in parallel.

- **A — Model.** `scripts/quickdraw/`, `public/models/quickdraw/`, `app/lib/quickdraw/`.
- **B — Storage + Art Box.** `app/hooks/useProgress.ts`, `app/lib/gallery-store.ts`,
  `app/lib/artbox.ts`.
- **C — Art supplies.** `app/lib/supplies/` — glow, rainbow, gold/holo, stamps, papers,
  extended symmetry, as a standalone library plus one reference integration.
- **D — Surfaces.** `app/robot-draw/`, `app/daily/`, `app/components/SpeedSketch.tsx`, and a
  single-line insertion into `app/page.tsx`. Depends on A and B.

`app/page.tsx` edits are kept to inserting one component, because PR #21 is open against it.

## Constraints

- No backend, no accounts, no network calls at play time. Nothing a child draws leaves the
  device — which is also what keeps COPPA and the UK Age Appropriate Design Code out of scope.
- Must work on a Fire HD 8 (slow, 1280×800) and on Windows/Edge desktop. Those are the users.
- Lazy-load the model only on the three routes that use it.
- Phones are 8% of users and the worst engaged; do not optimise for them at the expense of
  tablet and desktop.

## Out of scope

Sketch-RNN "AI finishes your drawing", AutoDraw-style cleanup, sound design, multiplayer rooms,
any public gallery. Each is a separate project. Sound is the likely next one.

## Done means

- `npx tsc --noEmit` and `npm run build` clean.
- Model parity test: Python and TypeScript agree on the same input.
- Playtested at desktop and 1280×800 tablet: robot guesses a real drawing, a daily completes, a
  sticker unlocks a tool that then works in another game, and a poster exports.
- No horizontal overflow at 390px.
