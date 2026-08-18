/**
 * Hand-written forward-pass primitives for the Quick Draw CNN. No ML library --
 * plain typed-array loops, chosen to be a direct, checkable translation of the
 * PyTorch layers in scripts/quickdraw/model.py.
 *
 * All 2D feature maps use (channel, row, col) layout, i.e. index =
 * (c * height + row) * width + col -- matching PyTorch's default NCHW row-major
 * layout (batch dim dropped since we run one image at a time).
 */

export interface FeatureMap {
  data: Float32Array;
  channels: number;
  height: number;
  width: number;
}

/** Same-shape-preserving conv2d (stride 1, symmetric zero padding) or any
 * stride/padding combination the manifest specifies. Weight layout matches
 * PyTorch: [outChannels, inChannels, kernelSize, kernelSize]. */
export function conv2d(
  input: FeatureMap,
  weight: Float32Array,
  bias: Float32Array,
  outChannels: number,
  kernelSize: number,
  padding: number,
  stride: number
): FeatureMap {
  const { data, channels: inChannels, height: inH, width: inW } = input;
  const outH = Math.floor((inH + 2 * padding - kernelSize) / stride) + 1;
  const outW = Math.floor((inW + 2 * padding - kernelSize) / stride) + 1;
  const out = new Float32Array(outChannels * outH * outW);

  const inChStride = inH * inW;
  const kArea = kernelSize * kernelSize;
  const wChStride = kArea; // per (outC, inC) block
  const wOutStride = inChannels * kArea;

  for (let oc = 0; oc < outChannels; oc++) {
    const wOcBase = oc * wOutStride;
    const outChBase = oc * outH * outW;
    const b = bias[oc];
    for (let oh = 0; oh < outH; oh++) {
      const ihBase = oh * stride - padding;
      for (let ow = 0; ow < outW; ow++) {
        const iwBase = ow * stride - padding;
        let sum = b;
        for (let ic = 0; ic < inChannels; ic++) {
          const inChBase = ic * inChStride;
          const wIcBase = wOcBase + ic * wChStride;
          for (let kh = 0; kh < kernelSize; kh++) {
            const ih = ihBase + kh;
            if (ih < 0 || ih >= inH) continue;
            const inRowBase = inChBase + ih * inW;
            const wRowBase = wIcBase + kh * kernelSize;
            for (let kw = 0; kw < kernelSize; kw++) {
              const iw = iwBase + kw;
              if (iw < 0 || iw >= inW) continue;
              sum += data[inRowBase + iw] * weight[wRowBase + kw];
            }
          }
        }
        out[outChBase + oh * outW + ow] = sum;
      }
    }
  }

  return { data: out, channels: outChannels, height: outH, width: outW };
}

export function reluInPlace(fm: FeatureMap | Float32Array): void {
  const data = fm instanceof Float32Array ? fm : fm.data;
  for (let i = 0; i < data.length; i++) {
    if (data[i] < 0) data[i] = 0;
  }
}

export function maxPool2d(input: FeatureMap, kernelSize: number, stride: number): FeatureMap {
  const { data, channels, height: inH, width: inW } = input;
  const outH = Math.floor((inH - kernelSize) / stride) + 1;
  const outW = Math.floor((inW - kernelSize) / stride) + 1;
  const out = new Float32Array(channels * outH * outW);
  const inChStride = inH * inW;

  for (let c = 0; c < channels; c++) {
    const inChBase = c * inChStride;
    const outChBase = c * outH * outW;
    for (let oh = 0; oh < outH; oh++) {
      const ihBase = oh * stride;
      for (let ow = 0; ow < outW; ow++) {
        const iwBase = ow * stride;
        let m = -Infinity;
        for (let kh = 0; kh < kernelSize; kh++) {
          const rowBase = inChBase + (ihBase + kh) * inW;
          for (let kw = 0; kw < kernelSize; kw++) {
            const v = data[rowBase + iwBase + kw];
            if (v > m) m = v;
          }
        }
        out[outChBase + oh * outW + ow] = m;
      }
    }
  }

  return { data: out, channels, height: outH, width: outW };
}

/** y = W x + b, W layout [outFeatures, inFeatures] (PyTorch nn.Linear default). */
export function dense(
  input: Float32Array,
  weight: Float32Array,
  bias: Float32Array,
  inFeatures: number,
  outFeatures: number
): Float32Array {
  const out = new Float32Array(outFeatures);
  for (let o = 0; o < outFeatures; o++) {
    const wBase = o * inFeatures;
    let sum = bias[o];
    for (let i = 0; i < inFeatures; i++) {
      sum += weight[wBase + i] * input[i];
    }
    out[o] = sum;
  }
  return out;
}

export function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) if (logits[i] > max) max = logits[i];
  const out = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const e = Math.exp(logits[i] - max);
    out[i] = e;
    sum += e;
  }
  for (let i = 0; i < out.length; i++) out[i] /= sum;
  return out;
}

export function topK(probs: Float32Array, labels: string[], k: number): { label: string; prob: number }[] {
  const indices = Array.from(probs.keys());
  indices.sort((a, b) => probs[b] - probs[a]);
  return indices.slice(0, k).map((i) => ({ label: labels[i], prob: probs[i] }));
}
