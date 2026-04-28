"use client";

import CanvasShell from "../components/CanvasShell";
import ShapeBuilder from "../components/ShapeBuilder";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Shape Builder — full guide in the section below.
    </p>
  </div>
);

export default function ShapeBuilderPlay() {
  return (
    <CanvasShell id="shape-builder" title="Shape Builder" howTo={HOW_TO} status="idle">
      <ShapeBuilder />
    </CanvasShell>
  );
}
