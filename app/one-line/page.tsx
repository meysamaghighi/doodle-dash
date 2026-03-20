import type { Metadata } from "next";
import OneLineDraw from "../components/OneLineDraw";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "One Line Art - Continuous Line Drawing | DoodleLab",
  description:
    "Draw without lifting your pen. Create art with one continuous stroke. A creative challenge for artists of all levels.",
  keywords: ["one line art", "continuous line", "single stroke drawing", "line art", "one line drawing"],
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
      <h1 className="text-3xl font-black text-center mb-2">One Line Art</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw without lifting your pen. One continuous stroke -- that's the only rule.
      </p>
      <OneLineDraw />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">The One Line Challenge</h2>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is one line art?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "One line art (also called single line drawing) is creating an image with one continuous stroke — you never lift your pen. Famous artists like Picasso used this technique.",
                },
              },
              {
                "@type": "Question",
                name: "Is one line drawing hard?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It requires planning your path carefully, but anyone can do it. Start with simple shapes and work up to more complex designs. The constraint actually makes it more creative.",
                },
              },
              {
                "@type": "Question",
                name: "Can I use one line art professionally?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! One line art is popular for logos, tattoos, T-shirt designs, and minimalist wall art. It's a recognized artistic style with commercial applications.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
