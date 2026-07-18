import type { Metadata } from "next";
import MemoryDrawPlay from "./MemoryDrawPlay";
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
      <MemoryDrawPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
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
    </main>
  );
}
