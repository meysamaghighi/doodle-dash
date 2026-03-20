import type { Metadata } from "next";
import MirrorDraw from "../components/MirrorDraw";

export const metadata: Metadata = {
  title: "Mirror Draw - Symmetrical Drawing Tool | DoodleLab",
  description:
    "Draw with real-time symmetry. Vertical, horizontal, or quad mirror modes create beautiful symmetrical patterns automatically.",
  keywords: ["mirror draw", "symmetry drawing", "kaleidoscope", "symmetrical art", "mandala maker"],
};

export default function MirrorDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Mirror Draw</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw on one side and watch it mirror in real time. Try quad mode for kaleidoscope effects.
      </p>
      <MirrorDraw />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How Mirror Draw Works</h2>
        <p className="mb-2">
          Choose a mirror mode: vertical mirrors left-right, horizontal mirrors
          top-bottom, and quad mode mirrors in all four quadrants for stunning
          mandala-like patterns.
        </p>
        <p>
          Every stroke you make is instantly reflected. Experiment with colors
          and brush sizes to create intricate symmetrical artwork.
        </p>
      </section>
    </main>
  );
}
