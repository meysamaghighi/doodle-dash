import type { Metadata } from "next";
import Kaleidoscope from "../components/Kaleidoscope";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Kaleidoscope - Symmetrical Drawing Art | DoodleLab",
  description:
    "Draw on the canvas and see your strokes reflected in 4, 6, 8, or 12-way symmetry. Free creative drawing tool. No sign-up required.",
  keywords: ["kaleidoscope", "symmetry drawing", "mandala", "symmetrical art", "creative drawing"],
  openGraph: {
    title: "Kaleidoscope - Symmetrical Drawing Art | DoodleLab",
    description:
      "Draw on the canvas and see your strokes reflected in 4, 6, 8, or 12-way symmetry. Free creative drawing tool.",
    type: "website",
    url: "https://doodlelab.fun/kaleidoscope",
  },
};

export default function KaleidoscopePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Kaleidoscope</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw and watch your art reflect in beautiful symmetry. Create mesmerizing patterns!
      </p>
      <Kaleidoscope />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Use</h2>
        <p className="mb-2">
          Pick a color and brush size, then draw on the canvas. Your strokes are automatically
          mirrored in 4, 6, 8, or 12 directions to create beautiful kaleidoscope patterns.
          Change the symmetry mode to create different effects.
        </p>
        <p>
          This is a creative tool with no scoring - just experiment and make something beautiful!
          Save your creation as a PNG when you're done.
        </p>
      </section>
      <RelatedGames current="/kaleidoscope" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Kaleidoscope",
            url: "https://doodlelab.fun/kaleidoscope",
            applicationCategory: "GameApplication",
            description:
              "Draw on the canvas and see your strokes reflected in 4, 6, 8, or 12-way symmetry. Free creative drawing tool.",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is kaleidoscope drawing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Kaleidoscope drawing mirrors your brush strokes in multiple directions (4, 6, 8, or 12-way symmetry) to create beautiful, symmetrical patterns automatically as you draw.",
                },
              },
              {
                "@type": "Question",
                name: "Can I save my kaleidoscope art?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Click the Save button to download your creation as a PNG image. On mobile, you can share it directly to your photo gallery.",
                },
              },
              {
                "@type": "Question",
                name: "What's the difference between 4-way and 8-way symmetry?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "4-way symmetry reflects your drawing in 4 directions, while 8-way creates more complex patterns with 8 reflections. Higher numbers create denser, more intricate designs.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
