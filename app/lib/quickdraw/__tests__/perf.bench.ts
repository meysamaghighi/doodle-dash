/**
 * Forward-pass performance measurement, per spec item 7 (target device: Amazon
 * Fire HD 8, which is slow -- keep the hot loop allocation-free and well under
 * ~30ms per classification).
 *
 * Run: npx tsx app/lib/quickdraw/__tests__/perf.bench.ts
 *
 * Node's V8 is not the Fire HD 8's browser JS engine, so this is a proxy, not a
 * device measurement -- but it catches the algorithmic cost (loop nesting, and
 * whether the hot path allocates) that dominates cross-device.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { forward } from "../model";
import { strokesToBitmap } from "../rasterize";
import type { Manifest, Strokes } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "public", "models", "quickdraw", "manifest.json");
const WEIGHTS_PATH = path.join(REPO_ROOT, "public", "models", "quickdraw", "weights.bin");

function fakeStrokes(): Strokes {
  // A rough scribble spanning most of a 300x300 canvas -- representative of a kid's
  // drawing input size on a tablet.
  const strokes: Strokes = [];
  for (let s = 0; s < 4; s++) {
    const stroke = [];
    for (let i = 0; i < 40; i++) {
      stroke.push({
        x: 20 + 260 * Math.abs(Math.sin(i * 0.3 + s)),
        y: 20 + 260 * Math.abs(Math.cos(i * 0.2 + s)),
      });
    }
    strokes.push(stroke);
  }
  return strokes;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx];
}

function main(): void {
  const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  const weightsBuf = readFileSync(WEIGHTS_PATH);
  const weightsAb = weightsBuf.buffer.slice(weightsBuf.byteOffset, weightsBuf.byteOffset + weightsBuf.byteLength);
  const weights = new Float32Array(weightsAb);
  const model = { manifest, weights };

  const strokes = fakeStrokes();

  const N = 500;
  const forwardTimes: number[] = [];
  const rasterTimes: number[] = [];
  const fullTimes: number[] = [];

  // Warm up JIT.
  for (let i = 0; i < 20; i++) {
    const bmp = strokesToBitmap(strokes);
    forward(model, bmp);
  }

  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    const bmp = strokesToBitmap(strokes);
    const t1 = performance.now();
    forward(model, bmp);
    const t2 = performance.now();

    rasterTimes.push(t1 - t0);
    forwardTimes.push(t2 - t1);
    fullTimes.push(t2 - t0);
  }

  forwardTimes.sort((a, b) => a - b);
  rasterTimes.sort((a, b) => a - b);
  fullTimes.sort((a, b) => a - b);

  const report = (label: string, arr: number[]) =>
    console.log(
      `${label.padEnd(22)} p50=${percentile(arr, 0.5).toFixed(3)}ms  p95=${percentile(arr, 0.95).toFixed(3)}ms  p99=${percentile(arr, 0.99).toFixed(3)}ms`
    );

  report("rasterize", rasterTimes);
  report("forward (conv/dense)", forwardTimes);
  report("total", fullTimes);
}

main();
