"use client";

import CanvasShell from "../components/CanvasShell";
import SpeedSketch from "../components/SpeedSketch";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Speed Sketch — full guide in the section below.
    </p>
  </div>
);

export default function SpeedSketchPlay() {
  return (
    <CanvasShell id="speed-sketch" title="Speed Sketch" howTo={HOW_TO} status="idle">
      <SpeedSketch />
    </CanvasShell>
  );
}
