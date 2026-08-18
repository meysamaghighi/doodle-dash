import type { Point, Strokes } from "./types";

/**
 * Converts free-hand strokes into a 28x28 grayscale bitmap matching the Quick Draw
 * `numpy_bitmap` distribution the model was trained on: strokes are aspect-ratio-
 * preserving scaled to roughly fill the canvas, centred, with soft antialiased ink
 * (background 0, ink toward 1). This is the highest-risk part of the pipeline --
 * see the training script's ASCII-art study of real samples, which showed content
 * bounding boxes spanning ~21-26px of the 28px frame with a 1-3px margin, and
 * antialiased (not hard-edged) stroke pixels.
 *
 * Deliberately implemented without a <canvas> element: a hand-rolled supersample +
 * box-filter-downsample line renderer is deterministic and identical across every
 * browser/device (no dependence on a particular UA's image-smoothing algorithm),
 * and can be unit tested in plain Node.
 */

const OUTPUT_SIZE = 28;
const SUPERSAMPLE = 8; // render at 224x224, then box-average down to 28x28
const SUPER_SIZE = OUTPUT_SIZE * SUPERSAMPLE;
// Fraction of the supersampled canvas the longer content dimension should fill.
// Calibrated against real numpy_bitmap samples (bbox typically 21-26 / 28px).
const FILL_RATIO = 0.86;
// Ink stroke width, expressed in *output* (28px) pixels, then scaled up for the
// supersampled render. Matches the visually ~2px antialiased line width observed
// in real samples.
const STROKE_WIDTH_OUTPUT_PX = 2.2;

function pointToSegmentDistance(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ddx = px - x0;
    const ddy = py - y0;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }
  let t = ((px - x0) * dx + (py - y0) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x0 + t * dx;
  const cy = y0 + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

function drawSegment(
  canvas: Float32Array,
  size: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number
): void {
  const minX = Math.max(0, Math.floor(Math.min(x0, x1) - radius - 1));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(x0, x1) + radius + 1));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1) - radius - 1));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(y0, y1) + radius + 1));

  for (let y = minY; y <= maxY; y++) {
    const rowBase = y * size;
    for (let x = minX; x <= maxX; x++) {
      const dist = pointToSegmentDistance(x + 0.5, y + 0.5, x0, y0, x1, y1);
      // Soft edge over ~1px so the downsample step produces antialiasing similar
      // to the reference dataset, rather than hard binary pixels.
      const coverage = Math.max(0, Math.min(1, radius - dist + 0.5));
      if (coverage > 0) {
        const idx = rowBase + x;
        if (coverage > canvas[idx]) canvas[idx] = coverage;
      }
    }
  }
}

function boundingBox(strokes: Strokes): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/** strokes: arrays of points in the app's own canvas coordinate space (any scale).
 * Returns a length-784 Float32Array, row-major 28x28, values in [0,1]. */
export function strokesToBitmap(strokes: Strokes): Float32Array {
  const output = new Float32Array(OUTPUT_SIZE * OUTPUT_SIZE);
  const nonEmpty = strokes.filter((s) => s.length > 0);
  if (nonEmpty.length === 0) return output;

  const { minX, minY, maxX, maxY } = boundingBox(nonEmpty);
  const w = maxX - minX;
  const h = maxY - minY;
  const contentDim = Math.max(w, h, 1e-6);

  const scale = (SUPER_SIZE * FILL_RATIO) / contentDim;
  const scaledW = w * scale;
  const scaledH = h * scale;
  const offsetX = (SUPER_SIZE - scaledW) / 2 - minX * scale;
  const offsetY = (SUPER_SIZE - scaledH) / 2 - minY * scale;

  const supersampled = new Float32Array(SUPER_SIZE * SUPER_SIZE);
  const radius = (STROKE_WIDTH_OUTPUT_PX * SUPERSAMPLE) / 2;

  const transform = (p: Point): [number, number] => [p.x * scale + offsetX, p.y * scale + offsetY];

  for (const stroke of nonEmpty) {
    if (stroke.length === 1) {
      const [x, y] = transform(stroke[0]);
      drawSegment(supersampled, SUPER_SIZE, x, y, x, y, radius);
      continue;
    }
    for (let i = 0; i < stroke.length - 1; i++) {
      const [x0, y0] = transform(stroke[i]);
      const [x1, y1] = transform(stroke[i + 1]);
      drawSegment(supersampled, SUPER_SIZE, x0, y0, x1, y1, radius);
    }
  }

  const norm = 1 / (SUPERSAMPLE * SUPERSAMPLE);
  for (let oy = 0; oy < OUTPUT_SIZE; oy++) {
    for (let ox = 0; ox < OUTPUT_SIZE; ox++) {
      let sum = 0;
      const baseY = oy * SUPERSAMPLE;
      const baseX = ox * SUPERSAMPLE;
      for (let dy = 0; dy < SUPERSAMPLE; dy++) {
        const rowBase = (baseY + dy) * SUPER_SIZE + baseX;
        for (let dx = 0; dx < SUPERSAMPLE; dx++) {
          sum += supersampled[rowBase + dx];
        }
      }
      output[oy * OUTPUT_SIZE + ox] = sum * norm;
    }
  }

  return output;
}
