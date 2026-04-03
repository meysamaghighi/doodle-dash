import type { Metadata } from "next";
import ColorFill from "../components/ColorFill";

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
        <h1 className="text-4xl font-black text-white mb-3">Color Fill</h1>
        <p className="text-gray-400">
          Choose a pattern and fill it with colors by tapping regions.
          Create colorful art from line drawings.
        </p>
      </div>

      <ColorFill />

      <section className="mt-12 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            How to Play Color Fill
          </h2>
          <ul className="space-y-2 text-gray-400">
            <li>• Select a pattern from the dropdown menu</li>
            <li>• Choose a color from the palette</li>
            <li>• Tap or click any white region to fill it with your color</li>
            <li>• Switch colors and fill different regions</li>
            <li>• Click Save when you're happy with your artwork</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Available Patterns
          </h2>
          <p className="text-gray-400 leading-relaxed mb-3">
            Color Fill includes six unique line-art patterns:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li>• <strong className="text-white">Mandala</strong> - Intricate circular patterns with radial symmetry</li>
            <li>• <strong className="text-white">House</strong> - Simple architectural scene with geometric shapes</li>
            <li>• <strong className="text-white">Flower</strong> - Delicate floral design with petals and stem</li>
            <li>• <strong className="text-white">Butterfly</strong> - Elegant winged insect with symmetrical wings</li>
            <li>• <strong className="text-white">Star</strong> - Multi-pointed celestial shape</li>
            <li>• <strong className="text-white">Fish</strong> - Underwater creature with scales and fins</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Coloring Tips
          </h2>
          <ul className="space-y-2 text-gray-400">
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I fill a region with color?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Select a color from the palette at the bottom, then tap or click on any white region in the pattern. The region will fill with your chosen color using flood-fill algorithm.",
                },
              },
              {
                "@type": "Question",
                name: "Can I change colors after filling a region?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Simply select a different color and click on a region you've already filled. It will change to the new color.",
                },
              },
              {
                "@type": "Question",
                name: "What happens if I click Reset?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Reset clears all colors and returns the pattern to its original black-and-white line art. Your pattern selection stays the same.",
                },
              },
              {
                "@type": "Question",
                name: "How many patterns are available?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Color Fill currently includes 6 patterns: Mandala, House, Flower, Butterfly, Star, and Fish. Each pattern has multiple regions to color.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
