import type { Metadata } from "next";
import MemoryDraw from "../components/MemoryDraw";

export const metadata: Metadata = {
  title: "Memory Draw - Visual Memory Drawing Game | DoodleDash",
  description:
    "Study shapes briefly, then draw them from memory. A visual memory challenge that gets harder with each level.",
  keywords: ["memory draw", "visual memory", "drawing game", "memory challenge", "shape memory"],
};

export default function MemoryDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Memory Draw</h1>
      <p className="text-gray-400 text-center mb-8">
        Study the shapes, then draw them from memory. More shapes appear as you level up.
      </p>
      <MemoryDraw />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <p className="mb-2">
          Each round shows you colored shapes for a few seconds. Memorize their
          positions, colors, and types. Then draw what you remember on a blank
          canvas.
        </p>
        <p>
          When you're done, compare your drawing side-by-side with the original.
          Each level adds more shapes and gives you less time to memorize.
        </p>
      </section>
    </main>
  );
}
