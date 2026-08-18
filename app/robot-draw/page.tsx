import type { Metadata } from "next";
import RobotDrawPlay from "./RobotDrawPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Robot Draw — Can a Robot Guess Your Drawing? | DoodleLab",
  description:
    "Draw anything and watch a neural network guess it, stroke by stroke. It knows 100 things — animals, food, vehicles, weather. Free, no sign-up, runs entirely on your device.",
  keywords: ["robot drawing game", "ai guesses drawing", "quick draw game", "neural network drawing", "drawing recognition"],
  alternates: { canonical: "/robot-draw" },
  openGraph: {
    title: "Robot Draw — Can a Robot Guess Your Drawing?",
    description:
      "Draw anything and watch a neural network guess it, stroke by stroke. Free, no sign-up.",
    type: "website",
    url: "https://doodlelab.fun/robot-draw",
  },
};

export default function RobotDrawPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <RobotDrawPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Use</h2>
        <p className="mb-2">
          Draw anything on the pad. After every stroke the robot looks again and
          says what it thinks you&apos;re drawing, along with its runners-up.
        </p>
        <p>
          It recognises 100 different things and was trained on millions of
          doodles. Everything happens on your own device — your drawings are
          never uploaded anywhere.
        </p>
      </section>
      <RelatedGames current="/robot-draw" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Robot Draw",
            url: "https://doodlelab.fun/robot-draw",
            applicationCategory: "GameApplication",
            description:
              "Draw anything and watch a neural network guess it, stroke by stroke.",
            operatingSystem: "All",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </main>
  );
}
