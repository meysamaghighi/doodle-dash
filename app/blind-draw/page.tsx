import type { Metadata } from "next";
import BlindDrawPlay from "./BlindDrawPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Blind Draw - Hidden Canvas Drawing Game | DoodleLab",
  description:
    "Draw a prompt without seeing the canvas. Your strokes are hidden until you reveal the result. A hilarious drawing challenge!",
  keywords: ["blind draw", "blind drawing", "hidden canvas", "drawing game", "funny drawing"],
  alternates: {
    canonical: "/blind-draw",
  },
  openGraph: {
    title: "Blind Draw - Hidden Canvas Drawing Game | DoodleLab",
    description:
      "Draw a prompt without seeing the canvas. Your strokes are hidden until you reveal the result. A hilarious drawing challenge!",
    type: "website",
  },
};

export default function BlindDrawPage() {
  return (
    <main className="bg-paper text-ink">
      <BlindDrawPlay />

      <section className="max-w-xl mx-auto px-4 mt-12 text-ink-2 text-sm">
        <h2 className="font-display text-xl text-ink mb-3" style={{ fontWeight: 700 }}>
          How Blind Draw Works
        </h2>
        <p className="mb-2">
          You get a word to draw, but the canvas is completely hidden. Draw
          using your spatial memory and intuition. When you&apos;re ready, hit
          Reveal to see the result.
        </p>
        <p>
          Blind Draw is hilarious to play with friends. Take turns drawing the
          same prompt blindly and compare results. The funnier the better!
        </p>
      </section>
      <div className="max-w-4xl mx-auto px-4">
        <RelatedGames current="/blind-draw" />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Blind Draw",
            url: "https://doodlelab.fun/blind-draw",
            applicationCategory: "GameApplication",
            description:
              "Draw a prompt without seeing the canvas. Your strokes are hidden until you reveal the result. A hilarious drawing challenge!",
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
                name: "How does Blind Draw work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You draw on a hidden canvas — you can't see your strokes as you draw. When you reveal the canvas, you see the hilarious (or surprisingly good) result. Great for parties and laughs.",
                },
              },
              {
                "@type": "Question",
                name: "What's the point of blind drawing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Blind drawing trains your hand-eye coordination and spatial awareness. It also removes the pressure of perfection, encouraging you to draw more freely and intuitively.",
                },
              },
              {
                "@type": "Question",
                name: "Is Blind Draw fun with friends?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely! Take turns drawing the same prompt blind, then reveal and compare. It's a hilarious party game that works great on phones and tablets.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
