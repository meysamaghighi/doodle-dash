import type { Metadata } from "next";
import MirrorDrawPlay from "./MirrorDrawPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Mirror Draw - Symmetrical Drawing Tool | DoodleLab",
  description:
    "Draw with real-time symmetry. Vertical, horizontal, or quad mirror modes create beautiful symmetrical patterns automatically.",
  keywords: ["mirror draw", "symmetry drawing", "kaleidoscope", "symmetrical art", "mandala maker"],
  alternates: {
    canonical: "/mirror-draw",
  },
  openGraph: {
    title: "Mirror Draw - Symmetrical Drawing Challenge | DoodleLab",
    description:
      "Draw with real-time symmetry. Vertical, horizontal, or quad mirror modes create beautiful symmetrical patterns automatically.",
    type: "website",
  },
};

export default function MirrorDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <MirrorDrawPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How Mirror Draw Works</h2>
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
      <RelatedGames current="/mirror-draw" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Mirror Draw",
            url: "https://doodlelab.fun/mirror-draw",
            applicationCategory: "GameApplication",
            description:
              "Draw with real-time symmetry. Vertical, horizontal, or quad mirror modes create beautiful symmetrical patterns automatically.",
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
                name: "What is mirror drawing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Mirror drawing creates a symmetrical image — everything you draw on one side is automatically mirrored on the other. It's perfect for creating mandalas, butterflies, faces, and geometric patterns.",
                },
              },
              {
                "@type": "Question",
                name: "Why is symmetry satisfying to look at?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Humans are naturally drawn to symmetry because it signals health and order in nature. Symmetrical art feels balanced and aesthetically pleasing to most people.",
                },
              },
              {
                "@type": "Question",
                name: "Is mirror draw good for beginners?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely! The automatic mirroring makes even simple strokes look impressive. It's a great way to build confidence and experiment with patterns.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
