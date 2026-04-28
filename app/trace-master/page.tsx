import type { Metadata } from "next";
import TraceMasterPlay from "./TraceMasterPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Trace Master - Shape Tracing Drawing Game | DoodleLab",
  description:
    "Trace over faded shapes as accurately as you can. Free tracing game with 8 shapes from easy circles to complex spirals. No sign-up required.",
  keywords: ["trace shapes", "tracing game", "drawing accuracy", "shape tracing", "hand eye coordination"],
  alternates: {
    canonical: "/trace-master",
  },
  openGraph: {
    title: "Trace Master - Shape Tracing Drawing Game | DoodleLab",
    description:
      "Trace over faded shapes as accurately as you can. Free tracing game with 8 shapes from easy circles to complex spirals. No sign-up required.",
    type: "website",
  },
};

export default function TraceMasterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <TraceMasterPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
        <p className="mb-2">
          When you start, you'll see a faded ghost shape on the canvas. Your goal is
          to trace over it as accurately as you can. Draw lines that follow the shape's
          outline. When you're done, click "Done" to see your accuracy score.
        </p>
        <p className="mb-4">
          The game scores you based on how closely your lines match the original shape,
          with penalties for drawing outside the shape. There are 8 shapes ranging from
          simple (circle, square) to complex (spiral, infinity symbol).
        </p>

        <h2 className="text-lg font-bold text-ink mb-3 mt-6">About Trace Master</h2>
        <p>
          Shape tracing is an excellent exercise for improving hand-eye coordination,
          fine motor control, and attention to detail. This game adds a scoring system
          to make it more engaging and help you track your improvement over time.
          Perfect for all ages!
        </p>
      </section>
      <RelatedGames current="/trace-master" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Trace Master",
            url: "https://doodlelab.fun/trace-master",
            applicationCategory: "GameApplication",
            description:
              "Trace over faded shapes as accurately as you can. Free tracing game with 8 shapes from easy circles to complex spirals. No sign-up required.",
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
                name: "How does Trace Master work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A faded ghost shape appears on the canvas. Draw over it to trace the shape as accurately as possible. When you're done, click 'Done' and the game calculates your accuracy score based on how well your lines match the original shape.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Trace Master on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Trace Master works great on phones and tablets with touch support. Use your finger to trace the shapes on the screen.",
                },
              },
              {
                "@type": "Question",
                name: "What shapes are in Trace Master?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are 8 shapes: Circle, Star, Heart, Spiral, Wave, Square, Triangle, and Infinity symbol. They range from simple geometric shapes to more complex curves.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
