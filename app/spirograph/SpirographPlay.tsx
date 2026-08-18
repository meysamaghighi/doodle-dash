"use client";

import CanvasShell from "../components/CanvasShell";
import Spirograph from "../components/Spirograph";

const HOW_TO = (
  <div className="space-y-2">
    <p>Pick a toothed wheel. Pick a hole to drop the pen into. Hit Draw.</p>
    <p>
      The wheel rolls around the ring and the pen traces the pattern. The dotted
      preview shows what you&apos;ll get before you draw.
    </p>
    <p>
      Draw again to stack another pattern on top — that&apos;s how the good ones
      are made. 🎲 picks a random setup for you.
    </p>
  </div>
);

export default function SpirographPlay() {
  return (
    <CanvasShell id="spirograph" title="Spirograph" howTo={HOW_TO} status="idle">
      <Spirograph />
    </CanvasShell>
  );
}
