import type { Metadata } from "next";
import SketchCopy from "../components/SketchCopy";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Sketch Copy - Copy Drawing Challenge | DoodleLab",
  description:
    "Copy reference shapes as accurately as possible. 5 levels of increasing difficulty. Free drawing game with pixel-similarity scoring.",
  keywords: ["sketch copy", "drawing challenge", "copy drawing", "art practice"],
  openGraph: {
    title: "Sketch Copy - Copy Drawing Challenge | DoodleLab",
    description:
      "Copy reference shapes as accurately as possible. 5 levels of increasing difficulty. Free drawing game with pixel-similarity scoring.",
    type: "website",
    url: "https://doodlelab.fun/sketch-copy",
  },
};

export default function SketchCopyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Sketch Copy</h1>
      <p className="text-gray-400 text-center mb-8">
        Copy the reference shape as accurately as you can. 5 levels to master!
      </p>
      <SketchCopy />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <p className="mb-2">
          Look at the reference shape on the left and try to draw an exact copy on the right.
          Use the color palette and brush tools to match the shape as closely as possible.
          When you're done, hit Compare to see your accuracy percentage.
        </p>
        <p>
          Progress through 5 levels of increasing difficulty, from simple circles to complex houses.
          Can you get 100% on all levels?
        </p>
      </section>
      <RelatedGames current="/sketch-copy" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sketch Copy",
            url: "https://doodlelab.fun/sketch-copy",
            applicationCategory: "GameApplication",
            description:
              "Copy reference shapes as accurately as possible. 5 levels of increasing difficulty.",
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
                name: "How does Sketch Copy scoring work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Your drawing is compared pixel-by-pixel to the reference shape. The score reflects how closely your shape matches in position, size, and color.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Sketch Copy on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Sketch Copy has full touch support for phones and tablets. Draw with your finger to copy the shapes.",
                },
              },
              {
                "@type": "Question",
                name: "How many levels are there?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are 5 levels with increasing difficulty: circle, square, triangle, star, and house.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
