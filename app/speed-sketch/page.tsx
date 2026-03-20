import type { Metadata } from "next";
import SpeedSketch from "../components/SpeedSketch";

export const metadata: Metadata = {
  title: "Speed Sketch - 30 Second Drawing Challenge | DoodleDash",
  description:
    "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
  keywords: ["speed sketch", "timed drawing", "drawing challenge", "quick draw", "30 second draw"],
};

export default function SpeedSketchPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Speed Sketch</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw the prompt in 30 seconds. How good can you get under pressure?
      </p>
      <SpeedSketch />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <p className="mb-2">
          Hit Start and you'll get a random word to draw. You have 30 seconds to
          sketch it using the color palette and brush tools. When time's up, save
          your masterpiece or try again with a new prompt.
        </p>
        <p>
          Speed Sketch is perfect for warming up your drawing skills, playing
          with friends, or just having a creative minute of fun.
        </p>
      </section>
    </main>
  );
}
