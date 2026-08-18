import type { Metadata } from "next";
import ColorFillPlay from "./ColorFillPlay";
export const metadata: Metadata = {
  title: "Color Fill - Coloring Game with Line Art Patterns | DoodleLab",
  description:
    "Tap to colour in twelve line-art patterns \u2014 mandalas, rose windows, spirals, honeycombs and more. Drag to fill several pieces at once. Free online coloring game.",
  keywords: [
    "coloring game",
    "line art coloring",
    "mandala coloring",
    "online coloring book",
    "free coloring app",
  ],
  alternates: {
    canonical: "/color-fill",
  },
  openGraph: {
    title: "Color Fill - Online Coloring Game",
    description:
      "Tap to colour in twelve line-art patterns \u2014 mandalas, rose windows, spirals, honeycombs and more. Free online coloring game.",
    type: "website",
    siteName: "DoodleLab",
  },
};

export default function ColorFillPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
      </div>
      <ColorFillPlay />

      <section className="mt-12 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            How to Play Color Fill
          </h2>
          <ul className="space-y-2 text-ink-2">
            <li>• Pick a pattern — there are twelve, from mandalas to honeycombs</li>
            <li>• Choose a colour, then tap any piece to fill it</li>
            <li>• Drag across the pattern to colour several pieces in one sweep</li>
            <li>• ⌫ erases, and Undo takes back your whole last stroke</li>
            <li>• Surprise colours fills everything with one sweep of the colour wheel</li>
            <li>• Save when you’re happy with it</li>
          </ul>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Color Fill",
            description:
              "Free online coloring game with twelve line-art patterns. Tap or drag to fill pieces with colour.",
            applicationCategory: "GameApplication",
            operatingSystem: "Any",
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
