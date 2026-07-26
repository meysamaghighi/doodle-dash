"use client";

import CanvasShell from "../components/CanvasShell";
import Spirograph from "../components/Spirograph";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Spirograph — full guide in the section below.
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
