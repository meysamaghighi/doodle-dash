import type { Metadata } from "next";
import OneLineDraw from "../components/OneLineDraw";

export const metadata: Metadata = {
  title: "One Line Art - Continuous Line Drawing | DoodleLab",
  description:
    "Draw without lifting your pen. Create art with one continuous stroke. A creative challenge for artists of all levels.",
  keywords: ["one line art", "continuous line", "single stroke drawing", "line art", "one line drawing"],
};

export default function OneLinePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">One Line Art</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw without lifting your pen. One continuous stroke -- that's the only rule.
      </p>
      <OneLineDraw />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">The One Line Challenge</h2>
        <p className="mb-2">
          One Line Art forces you to plan ahead. Once you start drawing, you
          can't lift your pen. If you do, the canvas locks and you can save or
          start over.
        </p>
        <p>
          This constraint sparks creativity. Try drawing faces, animals, or
          abstract patterns with a single continuous stroke. The line length
          counter tracks how long your line gets.
        </p>
      </section>
    </main>
  );
}
