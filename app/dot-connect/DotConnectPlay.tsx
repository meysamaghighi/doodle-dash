"use client";

import CanvasShell from "../components/CanvasShell";
import DotConnect from "../components/DotConnect";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Dot Connect — full guide in the section below.
    </p>
  </div>
);

export default function DotConnectPlay() {
  return (
    <CanvasShell id="dot-connect" title="Dot Connect" howTo={HOW_TO} status="idle">
      <DotConnect />
    </CanvasShell>
  );
}
