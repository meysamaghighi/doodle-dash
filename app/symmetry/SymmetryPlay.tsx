"use client";

import CanvasShell from "../components/CanvasShell";
import SymmetryDraw from "../components/SymmetryDraw";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Symmetry Draw — full guide in the section below.
    </p>
  </div>
);

export default function SymmetryPlay() {
  return (
    <CanvasShell id="symmetry" title="Symmetry Draw" howTo={HOW_TO} status="idle">
      <SymmetryDraw />
    </CanvasShell>
  );
}
