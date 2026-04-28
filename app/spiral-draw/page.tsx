import type { Metadata } from "next";
import SpiralDraw from "../components/SpiralDraw";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Spiral Draw - Free Spiral Drawing Challenge | DoodleLab",
  description:
    "Draw a smooth spiral from the center outward. Free drawing game with scoring based on smoothness and roundness. No sign-up required.",
  keywords: ["spiral draw", "drawing challenge", "spiral art", "drawing game"],
  alternates: {
    canonical: "/spiral-draw",
  },
  openGraph: {
    title: "Spiral Draw - Free Spiral Drawing Challenge | DoodleLab",
    description:
      "Draw a smooth spiral from the center outward. Free drawing game with scoring based on smoothness and roundness.",
    type: "website",
    url: "https://doodlelab.fun/spiral-draw",
  },
};

export default function SpiralDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Spiral Draw</h1>
      <p className="text-ink-2 text-center mb-8">
        Draw a smooth spiral from the center outward. Can you make a perfect spiral?
      </p>
      <SpiralDraw />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
        <p className="mb-2">
          Start from the center dot and draw a spiral that gradually moves outward.
          The game scores your spiral based on three factors: smoothness (consistent outward growth),
          roundness (circular shape), and how many full rotations you complete.
        </p>
        <p>
          Try to keep your hand steady and maintain a consistent distance from the center as you spiral outward!
        </p>
      </section>
      <RelatedGames current="/spiral-draw" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Spiral Draw",
            url: "https://doodlelab.fun/spiral-draw",
            applicationCategory: "GameApplication",
            description:
              "Draw a smooth spiral from the center outward. Free drawing game with scoring based on smoothness and roundness.",
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
                name: "How is my spiral scored?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Your spiral is scored on smoothness (consistent outward growth), roundness (maintaining circular shape), and total rotations. The maximum score is 100%.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Spiral Draw on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Spiral Draw works on phones and tablets with full touch support. Draw with your finger to create spirals.",
                },
              },
              {
                "@type": "Question",
                name: "What makes a good spiral?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A good spiral grows outward smoothly without sudden jumps, maintains a circular shape, and completes multiple full rotations around the center.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
