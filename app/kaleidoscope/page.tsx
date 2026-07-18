import type { Metadata } from "next";
import KaleidoscopePlay from "./KaleidoscopePlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Kaleidoscope - Symmetrical Drawing Art | DoodleLab",
  description:
    "Draw on the canvas and see your strokes reflected in 4, 6, 8, or 12-way symmetry. Free creative drawing tool. No sign-up required.",
  keywords: ["kaleidoscope", "symmetry drawing", "mandala", "symmetrical art", "creative drawing"],
  alternates: {
    canonical: "/kaleidoscope",
  },
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
      <KaleidoscopePlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Use</h2>
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
    </main>
  );
}
