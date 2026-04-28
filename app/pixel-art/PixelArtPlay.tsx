"use client";

import CanvasShell from "../components/CanvasShell";
import PixelArt from "../components/PixelArt";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Pixel Art Studio — full guide in the section below.
    </p>
  </div>
);

export default function PixelArtPlay() {
  return (
    <CanvasShell id="pixel-art" title="Pixel Art Studio" howTo={HOW_TO} status="idle">
      <PixelArt />
    </CanvasShell>
  );
}
