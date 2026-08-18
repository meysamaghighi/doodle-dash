/** Manifest shape produced by scripts/quickdraw/export_model.py. Keep in sync. */

export interface TensorRef {
  byteOffset: number;
  count: number;
  shape: number[];
}

export interface Conv2dLayer {
  type: "conv2d";
  name: string;
  inChannels: number;
  outChannels: number;
  kernelSize: number;
  padding: number;
  stride: number;
  weight: TensorRef;
  bias: TensorRef;
}

export interface ReluLayer {
  type: "relu";
}

export interface MaxPool2dLayer {
  type: "maxpool2d";
  kernelSize: number;
  stride: number;
}

export interface FlattenLayer {
  type: "flatten";
}

export interface DenseLayer {
  type: "dense";
  name: string;
  inFeatures: number;
  outFeatures: number;
  weight: TensorRef;
  bias: TensorRef;
}

export type Layer = Conv2dLayer | ReluLayer | MaxPool2dLayer | FlattenLayer | DenseLayer;

export interface Manifest {
  version: number;
  dtype: "float32";
  input: { height: number; width: number; channels: number; normalization: string };
  categories: string[];
  layers: Layer[];
  weightsFile: string;
  totalWeightBytes: number;
}

export interface Prediction {
  label: string;
  prob: number;
}

/** A single free-hand stroke as drawn: an ordered list of points in the app's own
 * canvas coordinate space (any scale -- the rasteriser normalises it). */
export interface Point {
  x: number;
  y: number;
}

export type Strokes = Point[][];
