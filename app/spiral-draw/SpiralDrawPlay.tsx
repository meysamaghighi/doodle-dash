"use client";

import CanvasShell from "../components/CanvasShell";
import SpiralDraw from "../components/SpiralDraw";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Spiral Draw — full guide in the section below.
    </p>
  </div>
);

export default function SpiralDrawPlay() {
  return (
    <CanvasShell id="spiral-draw" title="Spiral Draw" howTo={HOW_TO} status="idle">
      <SpiralDraw />
    </CanvasShell>
  );
}
