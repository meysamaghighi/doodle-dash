"use client";

import CanvasShell from "../components/CanvasShell";
import ColorFill from "../components/ColorFill";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Color Fill — full guide in the section below.
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
