import type { Metadata } from "next";
import OneLinePlay from "./OneLinePlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "One Line Art - Continuous Line Drawing | DoodleLab",
  description:
    "Draw without lifting your pen. Create art with one continuous stroke. A creative challenge for artists of all levels.",
  keywords: ["one line art", "continuous line", "single stroke drawing", "line art", "one line drawing"],
  alternates: {
    canonical: "/one-line",
  },
  openGraph: {
    title: "One Line Art - Single Stroke Drawing Challenge | DoodleLab",
    description:
      "Draw without lifting your pen. Create art with one continuous stroke. A creative challenge for artists of all levels.",
    type: "website",
  },
};

export default function OneLinePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <OneLinePlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">The One Line Challenge</h2>
        <p className="mb-2">
          One Line Art forces you to plan ahead. Once you start drawing, you
          can't lift your pen. If you do, the canvas locks and you can save or
          start over.
        </p>
        <p>
          This constraint sparks creativity. Try drawing faces, animals, or
          abstract patterns with a single continuous stroke. The line length
          counter tracks how long your line gets.
        </p>
      </section>
      <RelatedGames current="/one-line" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "One Line Art",
            url: "https://doodlelab.fun/one-line",
            applicationCategory: "GameApplication",
            description:
              "Draw without lifting your pen. Create art with one continuous stroke. A creative challenge for artists of all levels.",
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
