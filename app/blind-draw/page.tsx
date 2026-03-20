import type { Metadata } from "next";
import BlindDraw from "../components/BlindDraw";

export const metadata: Metadata = {
  title: "Blind Draw - Hidden Canvas Drawing Game | DoodleDash",
  description:
    "Draw a prompt without seeing the canvas. Your strokes are hidden until you reveal the result. A hilarious drawing challenge!",
  keywords: ["blind draw", "blind drawing", "hidden canvas", "drawing game", "funny drawing"],
};

export default function BlindDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Blind Draw</h1>
      <p className="text-gray-400 text-center mb-8">
        The canvas is hidden while you draw. Reveal your masterpiece when you're done!
      </p>
      <BlindDraw />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How Blind Draw Works</h2>
        <p className="mb-2">
          You get a word to draw, but the canvas is completely hidden. Draw
          using your spatial memory and intuition. When you're ready, hit
          Reveal to see the result.
        </p>
        <p>
          Blind Draw is hilarious to play with friends. Take turns drawing the
          same prompt blindly and compare results. The funnier the better!
        </p>
      </section>
    </main>
  );
}
