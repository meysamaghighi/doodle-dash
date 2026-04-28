"use client";

import CanvasShell from "../components/CanvasShell";
import Kaleidoscope from "../components/Kaleidoscope";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Kaleidoscope — full guide in the section below.
    </p>
  </div>
);

export default function KaleidoscopePlay() {
  return (
    <CanvasShell id="kaleidoscope" title="Kaleidoscope" howTo={HOW_TO} status="idle">
      <Kaleidoscope />
    </CanvasShell>
  );
}
