"use client";

import CanvasShell from "../components/CanvasShell";
import MirrorDraw from "../components/MirrorDraw";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Mirror Draw — full guide in the section below.
    </p>
  </div>
);

export default function MirrorDrawPlay() {
  return (
    <CanvasShell id="mirror-draw" title="Mirror Draw" howTo={HOW_TO} status="idle">
      <MirrorDraw />
    </CanvasShell>
  );
}
