import type { Metadata } from "next";
import MemoryDraw from "../components/MemoryDraw";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Memory Draw - Visual Memory Drawing Game | DoodleLab",
  description:
    "Study shapes briefly, then draw them from memory. A visual memory challenge that gets harder with each level.",
  keywords: ["memory draw", "visual memory", "drawing game", "memory challenge", "shape memory"],
  alternates: {
    canonical: "/memory-draw",
  },
  openGraph: {
    title: "Memory Draw - Visual Memory Drawing Game | DoodleLab",
    description:
      "Study shapes briefly, then draw them from memory. A visual memory challenge that gets harder with each level.",
    type: "website",
  },
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
      <RelatedGames current="/memory-draw" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Memory Draw",
            url: "https://doodlelab.fun/memory-draw",
            applicationCategory: "GameApplication",
            description:
              "Study shapes briefly, then draw them from memory. A visual memory challenge that gets harder with each level.",
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
                name: "How does Memory Draw work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You see an image briefly, then it disappears. Draw it from memory as accurately as you can. Your drawing is compared to the original with a pixel-similarity score showing your match percentage.",
                },
              },
              {
                "@type": "Question",
                name: "What is a good Memory Draw score?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A similarity score above 60% is good. Above 75% is excellent. The challenge is remembering both the shapes and their positions on the canvas.",
                },
              },
              {
                "@type": "Question",
                name: "Does Memory Draw improve visual memory?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Regularly practicing visual recall through drawing strengthens your spatial memory and attention to detail — skills useful in art, design, and everyday life.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
