import type { Metadata } from "next";
import SpirographPlay from "./SpirographPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Spirograph — Free Online Drawing Toy | DoodleLab",
  description:
    "Roll a toothed wheel around a ring and watch it draw. Pick a wheel, pick a pen hole, stack layers of spiral art. Free, no sign-up required.",
  keywords: ["spirograph", "hypotrochoid", "gear drawing toy", "spiral art", "geometric drawing"],
  alternates: {
    canonical: "/spirograph",
  },
  openGraph: {
    title: "Spirograph — Free Online Drawing Toy | DoodleLab",
    description:
      "Roll a toothed wheel around a ring and watch it draw. Pick a wheel, pick a pen hole, stack layers of spiral art.",
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
          Pick a toothed wheel from the tray and drop the pen into one of its
          holes, then hit Draw to watch the wheel roll around the ring and trace
          the curve. A dotted preview shows the pattern before you draw it.
        </p>
        <p>
          Every wheel and hole gives a different flower or star, and each new
          draw stacks on top of the last. Save the finished picture as a PNG.
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
              "Roll a toothed wheel around a ring and watch it draw. Pick a wheel, pick a pen hole, stack layers of spiral art.",
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
