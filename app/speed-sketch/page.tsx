import type { Metadata } from "next";
import SpeedSketchPlay from "./SpeedSketchPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Speed Sketch - 30 Second Drawing Challenge | DoodleLab",
  description:
    "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
  keywords: ["speed sketch", "timed drawing", "drawing challenge", "quick draw", "30 second draw"],
  alternates: {
    canonical: "/speed-sketch",
  },
  openGraph: {
    title: "Speed Sketch - 30 Second Drawing Challenge | DoodleLab",
    description:
      "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
    type: "website",
  },
};

export default function SpeedSketchPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <SpeedSketchPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
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
      <RelatedGames current="/speed-sketch" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Speed Sketch",
            url: "https://doodlelab.fun/speed-sketch",
            applicationCategory: "GameApplication",
            description:
              "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </main>
  );
}
