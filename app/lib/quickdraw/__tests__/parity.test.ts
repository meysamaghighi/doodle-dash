/**
 * Parity test (spec item 6): asserts the hand-written TS forward pass reproduces
 * the Python/PyTorch forward pass on the exported weights, within tolerance.
 *
 * There is no test runner wired into this repo. Run this file directly:
 *
 *   npx tsx app/lib/quickdraw/__tests__/parity.test.ts
 *
 * Fixtures are produced by scripts/quickdraw/export_fixtures.py, which loads the
 * SAME exported public/models/quickdraw/weights.bin (not the raw torch checkpoint)
 * and computes logits with an independent PyTorch functional forward pass -- so a
 * pass here means the TS conv2d/maxpool/dense implementation, the manifest layer
 * ordering, and the weight blob layout are all correct together.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { forward } from "../model";
import type { Manifest } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

const FIXTURES_PATH = path.join(__dirname, "..", "__fixtures__", "parity-fixtures.json");
const MANIFEST_PATH = path.join(REPO_ROOT, "public", "models", "quickdraw", "manifest.json");
const WEIGHTS_PATH = path.join(REPO_ROOT, "public", "models", "quickdraw", "weights.bin");

// Logit-space absolute tolerance. float32 accumulation order differs between
// PyTorch's BLAS/MPS kernels and our naive loops, so exact equality is not
// expected -- but drift should be tiny relative to typical logit magnitudes.
const ABS_TOL = 1e-2;

interface FixtureCase {
  category: string;
  label: number;
  input: number[];
  logits: number[];
}

interface Fixtures {
  categories: string[];
  cases: FixtureCase[];
}

function main(): void {
  const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  const weightsBuf = readFileSync(WEIGHTS_PATH);
  // .slice() (not .subarray()) copies into a fresh, zero-offset ArrayBuffer -- Node's
  // Buffer pool can otherwise hand back a byteOffset that isn't a multiple of 4,
  // which Float32Array's constructor rejects.
  const weightsAb = weightsBuf.buffer.slice(weightsBuf.byteOffset, weightsBuf.byteOffset + weightsBuf.byteLength);
  const weights = new Float32Array(weightsAb);
  const fixtures: Fixtures = JSON.parse(readFileSync(FIXTURES_PATH, "utf-8"));

  if (fixtures.categories.length !== manifest.categories.length) {
    throw new Error("fixture categories length mismatch vs manifest");
  }
  for (let i = 0; i < fixtures.categories.length; i++) {
    if (fixtures.categories[i] !== manifest.categories[i]) {
      throw new Error(`category order mismatch at index ${i}: fixture=${fixtures.categories[i]} manifest=${manifest.categories[i]}`);
    }
  }

  let maxAbsDiff = 0;
  let failures = 0;
  let argmaxMismatches = 0;

  for (const c of fixtures.cases) {
    const input = Float32Array.from(c.input);
    const tsLogits = forward({ manifest, weights }, input);
    const pyLogits = c.logits;

    if (tsLogits.length !== pyLogits.length) {
      throw new Error(`logits length mismatch for ${c.category}: ts=${tsLogits.length} py=${pyLogits.length}`);
    }

    let caseMaxDiff = 0;
    for (let i = 0; i < tsLogits.length; i++) {
      const diff = Math.abs(tsLogits[i] - pyLogits[i]);
      if (diff > caseMaxDiff) caseMaxDiff = diff;
    }
    maxAbsDiff = Math.max(maxAbsDiff, caseMaxDiff);

    let tsArgmax = 0;
    let pyArgmax = 0;
    for (let i = 1; i < tsLogits.length; i++) {
      if (tsLogits[i] > tsLogits[tsArgmax]) tsArgmax = i;
      if (pyLogits[i] > pyLogits[pyArgmax]) pyArgmax = i;
    }
    if (tsArgmax !== pyArgmax) argmaxMismatches++;

    const pass = caseMaxDiff <= ABS_TOL;
    if (!pass) failures++;
    console.log(
      `${pass ? "OK  " : "FAIL"} ${c.category.padEnd(16)} maxAbsDiff=${caseMaxDiff.toFixed(5)} ` +
        `tsArgmax=${manifest.categories[tsArgmax]} pyArgmax=${manifest.categories[pyArgmax]}`
    );
  }

  console.log(`\n${fixtures.cases.length} cases, maxAbsDiff overall=${maxAbsDiff.toFixed(5)}, argmax mismatches=${argmaxMismatches}`);

  if (failures > 0) {
    console.error(`\nPARITY TEST FAILED: ${failures}/${fixtures.cases.length} cases exceeded tolerance ${ABS_TOL}`);
    process.exit(1);
  }
  if (argmaxMismatches > 0) {
    console.error(`\nPARITY TEST FAILED: ${argmaxMismatches} case(s) disagree on the top prediction`);
    process.exit(1);
  }
  console.log("\nPARITY TEST PASSED");
}

main();
