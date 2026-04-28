"use client";

import CanvasShell from "../components/CanvasShell";
import MemoryDraw from "../components/MemoryDraw";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Memory Draw — full guide in the section below.
    </p>
  </div>
);

export default function MemoryDrawPlay() {
  return (
    <CanvasShell id="memory-draw" title="Memory Draw" howTo={HOW_TO} status="idle">
      <MemoryDraw />
    </CanvasShell>
  );
}
