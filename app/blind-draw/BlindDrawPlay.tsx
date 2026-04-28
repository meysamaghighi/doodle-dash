"use client";

import CanvasShell from "../components/CanvasShell";
import BlindDraw from "../components/BlindDraw";
import { useProgress } from "../hooks/useProgress";

const HOW_TO = (
  <div>
    <p className="mb-3">
      You get a word to draw, but the canvas is hidden while you draw.
      Reveal at the end and laugh at the result.
    </p>
    <p className="mb-1 font-semibold text-ink">Tips</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Pick a color and brush size before starting</li>
      <li>Draw with confidence — you won&apos;t see the strokes</li>
      <li>Coverage % is how much of the canvas you used</li>
    </ul>
  </div>
);

export default function BlindDrawPlay() {
  const { recordPlay, saveDrawing } = useProgress();

  const handleReveal = (
    stats: { coverage: number; colorsUsed: number },
    prompt: string,
    dataUrl: string
  ) => {
    // Coverage % is the headline score (higher is better — more of the canvas used).
    recordPlay("blind-draw", stats.coverage, "higher");
    // Save the reveal into the local gallery for Phase 3 gallery page.
    saveDrawing(`blind-draw-${prompt}`, dataUrl);
  };

  return (
    <CanvasShell
      id="blind-draw"
      title="Blind Draw"
      howTo={HOW_TO}
      // BlindDraw owns its own ready / drawing / revealed flow and end-state UI,
      // so we keep the shell status at "idle" — it provides header chrome
      // (back link, how-to, fullscreen) without duplicating the reveal card.
      status="idle"
    >
      <div className="flex-1 min-h-[520px] bg-gray-950 text-white px-4 py-6">
        <BlindDraw onReveal={handleReveal} />
      </div>
    </CanvasShell>
  );
}
