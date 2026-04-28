import type { Metadata } from "next";
import SpeedSketch from "../components/SpeedSketch";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Speed Sketch - 30 Second Drawing Challenge | DoodleLab",
  description:
    "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
  keywords: ["speed sketch", "timed drawing", "drawing challenge", "quick draw", "30 second draw"],
  alternates: {
    canonical: "/speed-sketch",
  },
  openGraph: {
    title: "Speed Sketch - 30 Second Drawing Challenge | DoodleLab",
    description:
      "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
    type: "website",
  },
};

export default function SpeedSketchPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Speed Sketch</h1>
      <p className="text-ink-2 text-center mb-8">
        Draw the prompt in 30 seconds. How good can you get under pressure?
      </p>
      <SpeedSketch />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
        <p className="mb-2">
          Hit Start and you'll get a random word to draw. You have 30 seconds to
          sketch it using the color palette and brush tools. When time's up, save
          your masterpiece or try again with a new prompt.
        </p>
        <p>
          Speed Sketch is perfect for warming up your drawing skills, playing
          with friends, or just having a creative minute of fun.
        </p>
      </section>
      <RelatedGames current="/speed-sketch" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Speed Sketch",
            url: "https://doodlelab.fun/speed-sketch",
            applicationCategory: "GameApplication",
            description:
              "Draw the prompt as fast as you can in 30 seconds. Free timed drawing game with random prompts. No sign-up required.",
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
                name: "How does Speed Sketch work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You get a random word prompt and 30 seconds to draw it. Use the color palette and brush tools to create your sketch before time runs out. Save your drawing or try again with a new prompt.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Speed Sketch on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Speed Sketch works on phones and tablets with touch drawing support. The canvas adapts to your screen size for the best experience.",
                },
              },
              {
                "@type": "Question",
                name: "Is Speed Sketch good for improving drawing skills?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Timed drawing forces you to focus on essential shapes and details, which is great practice for quick sketching and visual thinking.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
