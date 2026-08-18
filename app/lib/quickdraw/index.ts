export { loadModel, classify, forward } from "./model";
export type { CompiledModel } from "./model";
export { strokesToBitmap } from "./rasterize";
export type { Point, Strokes, Prediction, Manifest } from "./types";

import { loadModel, classify as classifyModel } from "./model";
import { strokesToBitmap } from "./rasterize";
import type { Prediction, Strokes } from "./types";

/** Convenience one-shot: rasterise strokes and classify, loading the model on
 * first call and reusing it afterwards. Callers on a hot path (e.g. live-guess
 * while drawing) should call loadModel() once up front and use classify()
 * directly from ./model to skip the rasteriser cost analysis each call. */
export async function classifyStrokes(strokes: Strokes, k = 5): Promise<Prediction[]> {
  const model = await loadModel();
  const bitmap = strokesToBitmap(strokes);
  return classifyModel(model, bitmap, k);
}
