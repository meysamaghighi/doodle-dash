import { conv2d, dense, maxPool2d, reluInPlace, softmax, topK, type FeatureMap } from "./ops";
import type { Layer, Manifest, Prediction, TensorRef } from "./types";

const MANIFEST_URL = "/models/quickdraw/manifest.json";

export interface CompiledModel {
  manifest: Manifest;
  weights: Float32Array;
}

let cached: CompiledModel | null = null;
let loading: Promise<CompiledModel> | null = null;

function view(weights: Float32Array, ref: TensorRef): Float32Array {
  // byteOffset in the manifest is measured from the start of the weights.bin file,
  // which is exactly what weights.buffer holds -- so it lines up with the
  // underlying ArrayBuffer's byte offsets directly.
  return new Float32Array(weights.buffer, weights.byteOffset + ref.byteOffset, ref.count);
}

/** Fetches the manifest + weight blob once and caches the parsed result. Safe to
 * call from multiple call sites -- concurrent callers share the same in-flight
 * fetch. Intended to be lazy-loaded only on the routes that need it. */
export async function loadModel(): Promise<CompiledModel> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    const manifestRes = await fetch(MANIFEST_URL);
    if (!manifestRes.ok) throw new Error(`quickdraw: failed to fetch manifest (${manifestRes.status})`);
    const manifest: Manifest = await manifestRes.json();

    const weightsUrl = `/models/quickdraw/${manifest.weightsFile}`;
    const weightsRes = await fetch(weightsUrl);
    if (!weightsRes.ok) throw new Error(`quickdraw: failed to fetch weights (${weightsRes.status})`);
    const buf = await weightsRes.arrayBuffer();
    const weights = new Float32Array(buf);

    const model = { manifest, weights };
    cached = model;
    return model;
  })();

  try {
    return await loading;
  } finally {
    loading = null;
  }
}

/** Runs the network forward on a preprocessed 28x28 [0,1] grayscale input
 * (row-major, length height*width) and returns raw logits. Exported separately
 * from classify() so the parity test can call it directly on fixture bitmaps
 * without going through the rasteriser. */
export function forward(model: CompiledModel, input: Float32Array): Float32Array {
  const { manifest, weights } = model;
  const { height, width, channels } = manifest.input;

  let fm: FeatureMap = { data: input, channels, height, width };
  let flat: Float32Array | null = null;

  for (const layer of manifest.layers) {
    switch (layer.type) {
      case "conv2d": {
        fm = conv2d(
          fm,
          view(weights, layer.weight),
          view(weights, layer.bias),
          layer.outChannels,
          layer.kernelSize,
          layer.padding,
          layer.stride
        );
        break;
      }
      case "relu": {
        reluInPlace(flat ?? fm);
        break;
      }
      case "maxpool2d": {
        fm = maxPool2d(fm, layer.kernelSize, layer.stride);
        break;
      }
      case "flatten": {
        flat = fm.data;
        break;
      }
      case "dense": {
        if (!flat) throw new Error("quickdraw: dense layer before flatten");
        flat = dense(flat, view(weights, layer.weight), view(weights, layer.bias), layer.inFeatures, layer.outFeatures);
        break;
      }
      default: {
        const exhaustive: never = layer;
        throw new Error(`quickdraw: unknown layer ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  if (!flat) throw new Error("quickdraw: model produced no flat output");
  return flat;
}

export function classify(model: CompiledModel, input: Float32Array, k = 5): Prediction[] {
  const logits = forward(model, input);
  const probs = softmax(logits);
  return topK(probs, model.manifest.categories, k);
}
