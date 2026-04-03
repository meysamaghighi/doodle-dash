import type { Metadata } from "next";
import DotConnect from "../components/DotConnect";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Dot Connect - Connect the Dots Drawing Game | DoodleLab",
  description:
    "Connect numbered dots in order as fast as you can. Free dot-to-dot drawing game with 5 difficulty levels. No sign-up required.",
  keywords: ["dot connect", "connect the dots", "dot to dot", "drawing game", "timed challenge"],
  alternates: {
    canonical: "/dot-connect",
  },
  openGraph: {
    title: "Dot Connect - Connect the Dots Drawing Game | DoodleLab",
    description:
      "Connect numbered dots in order as fast as you can. Free dot-to-dot drawing game with 5 difficulty levels. No sign-up required.",
    type: "website",
  },
};

export default function DotConnectPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Dot Connect</h1>
      <p className="text-gray-400 text-center mb-8">
        Draw lines connecting the dots in numerical order. How fast can you complete each level?
      </p>
      <DotConnect />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <p className="mb-2">
          Hit Start and dots with numbers will appear on the canvas. Draw lines to
          connect the dots in order: 1 to 2 to 3, and so on. The timer starts when
          you begin and stops when you reach the last dot.
        </p>
        <p className="mb-4">
          There are 5 difficulty levels with more dots and more complex patterns.
          Try to beat your personal best time on each level!
        </p>

        <h2 className="text-lg font-bold text-white mb-3 mt-6">About Dot Connect</h2>
        <p>
          Dot Connect (also known as connect-the-dots or dot-to-dot) is a classic
          drawing exercise that helps with hand-eye coordination, number sequencing,
          and fine motor skills. This digital version adds a speed challenge to make
          it more engaging for all ages.
        </p>
      </section>
      <RelatedGames current="/dot-connect" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Dot Connect",
            url: "https://doodlelab.fun/dot-connect",
            applicationCategory: "GameApplication",
            description:
              "Connect numbered dots in order as fast as you can. Free dot-to-dot drawing game with 5 difficulty levels. No sign-up required.",
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
                name: "How does Dot Connect work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Numbered dots appear on the canvas. Draw lines to connect them in numerical order (1→2→3→...). The game tracks how fast you complete each level. There are 5 difficulty levels with increasing numbers of dots.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Dot Connect on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Dot Connect works perfectly on phones and tablets with touch support. Draw the connecting lines with your finger.",
                },
              },
              {
                "@type": "Question",
                name: "Is Dot Connect good for kids?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely. Connect-the-dots games help children with number recognition, sequencing, hand-eye coordination, and fine motor skills. The beginner level has just 5 dots, perfect for young learners.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
