"use client";

import CanvasShell from "../components/CanvasShell";
import SketchCopy from "../components/SketchCopy";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Sketch Copy — full guide in the section below.
    </p>
  </div>
);

export default function SketchCopyPlay() {
  return (
    <CanvasShell id="sketch-copy" title="Sketch Copy" howTo={HOW_TO} status="idle">
      <SketchCopy />
    </CanvasShell>
  );
}
