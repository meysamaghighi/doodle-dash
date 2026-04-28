"use client";

import CanvasShell from "../components/CanvasShell";
import OneLineDraw from "../components/OneLineDraw";

const HOW_TO = (
  <div>
    <p className="mb-3">
      One Line Art — full guide in the section below.
    </p>
  </div>
);

export default function OneLinePlay() {
  return (
    <CanvasShell id="one-line" title="One Line Art" howTo={HOW_TO} status="idle">
      <OneLineDraw />
    </CanvasShell>
  );
}
