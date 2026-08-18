"use client";

import CanvasShell from "../components/CanvasShell";
import ColorFill from "../components/ColorFill";

const HOW_TO = (
  <div className="space-y-2">
    <p>
      Pick a colour, then tap any piece to fill it. Drag across the pattern to
      colour several pieces in one sweep.
    </p>
    <p>⌫ is the eraser, and Undo takes back your whole last stroke.</p>
    <p>
      Stuck for ideas? <strong>Surprise colours</strong> fills the whole pattern
      with one sweep of the colour wheel.
    </p>
  </div>
);

export default function ColorFillPlay() {
  return (
    <CanvasShell id="color-fill" title="Color Fill" howTo={HOW_TO} status="idle">
      <ColorFill />
    </CanvasShell>
  );
}
