import type { Metadata } from "next";
import ColorFillPlay from "./ColorFillPlay";
export const metadata: Metadata = {
  title: "Color Fill - Coloring Game with Line Art Patterns | DoodleLab",
  description:
    "Fill line-art patterns with colors by tapping regions. Choose from mandalas, animals, flowers, and more. Free online coloring game.",
  keywords: [
    "coloring game",
    "flood fill",
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
      "Fill beautiful line-art patterns with colors. Mandalas, flowers, animals, and more. Free online coloring game.",
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
            <li>• Select a pattern from the dropdown menu</li>
            <li>• Choose a color from the palette</li>
            <li>• Tap or click any white region to fill it with your color</li>
            <li>• Switch colors and fill different regions</li>
            <li>• Click Save when you're happy with your artwork</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            Available Patterns
          </h2>
          <p className="text-ink-2 leading-relaxed mb-3">
            Color Fill includes six unique line-art patterns:
          </p>
          <ul className="space-y-2 text-ink-2">
            <li>• <strong className="text-ink">Mandala</strong> - Intricate circular patterns with radial symmetry</li>
            <li>• <strong className="text-ink">House</strong> - Simple architectural scene with geometric shapes</li>
            <li>• <strong className="text-ink">Flower</strong> - Delicate floral design with petals and stem</li>
            <li>• <strong className="text-ink">Butterfly</strong> - Elegant winged insect with symmetrical wings</li>
            <li>• <strong className="text-ink">Star</strong> - Multi-pointed celestial shape</li>
            <li>• <strong className="text-ink">Fish</strong> - Underwater creature with scales and fins</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            Coloring Tips
          </h2>
          <ul className="space-y-2 text-ink-2">
            <li>• Try complementary colors for vibrant contrast</li>
            <li>• Use analogous colors for harmonious designs</li>
            <li>• Leave some areas white for a clean look</li>
            <li>• Experiment with different color schemes on the same pattern</li>
            <li>• If you make a mistake, click Reset to start over</li>
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
              "Free online coloring game with multiple line-art patterns. Fill regions with colors by tapping.",
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
