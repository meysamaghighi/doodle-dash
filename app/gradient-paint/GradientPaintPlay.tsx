"use client";

import CanvasShell from "../components/CanvasShell";
import GradientPaint from "../components/GradientPaint";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Gradient Paint — full guide in the section below.
    </p>
  </div>
);

export default function GradientPaintPlay() {
  return (
    <CanvasShell id="gradient-paint" title="Gradient Paint" howTo={HOW_TO} status="idle">
      <GradientPaint />
    </CanvasShell>
  );
}
