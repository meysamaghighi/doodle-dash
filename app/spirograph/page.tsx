import type { Metadata } from "next";
import SpirographPlay from "./SpirographPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Spirograph — Free Online Drawing Toy | DoodleLab",
  description:
    "Draw hypotrochoid gear-in-gear curves with an interactive spirograph. Adjust ring size, gear size, and pen offset. Free, no sign-up required.",
  keywords: ["spirograph", "hypotrochoid", "gear drawing toy", "spiral art", "geometric drawing"],
  alternates: {
    canonical: "/spirograph",
  },
  openGraph: {
    title: "Spirograph — Free Online Drawing Toy | DoodleLab",
    description:
      "Draw hypotrochoid gear-in-gear curves with an interactive spirograph. Adjust ring size, gear size, and pen offset.",
    type: "website",
    url: "https://doodlelab.fun/spirograph",
  },
};

export default function SpirographPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <SpirographPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Use</h2>
        <p className="mb-2">
          Set the ring radius, gear radius, and pen offset, then hit Draw to
          watch the gear trace a hypotrochoid curve as it rolls inside the ring.
          Pick a color and line width before or during the draw.
        </p>
        <p>
          Each combination of ring, gear, and offset produces a different
          flower-like pattern. Save your favorite as a PNG when you&apos;re done.
        </p>
      </section>
      <RelatedGames current="/spirograph" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Spirograph",
            url: "https://doodlelab.fun/spirograph",
            applicationCategory: "GameApplication",
            description:
              "Draw hypotrochoid gear-in-gear curves with an interactive spirograph. Adjust ring size, gear size, and pen offset.",
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
