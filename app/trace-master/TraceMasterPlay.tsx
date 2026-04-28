"use client";

import CanvasShell from "../components/CanvasShell";
import TraceMaster from "../components/TraceMaster";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Trace Master — full guide in the section below.
    </p>
  </div>
);

export default function TraceMasterPlay() {
  return (
    <CanvasShell id="trace-master" title="Trace Master" howTo={HOW_TO} status="idle">
      <TraceMaster />
    </CanvasShell>
  );
}
