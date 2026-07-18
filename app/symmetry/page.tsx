import type { Metadata } from "next";
import SymmetryPlay from "./SymmetryPlay";
export const metadata: Metadata = {
  title: "Symmetry Draw - Mirror Drawing Game | DoodleLab",
  description:
    "Draw on the left half and watch it mirror in real-time on the right. Create beautiful symmetrical art with this free online drawing tool.",
  keywords: [
    "symmetry drawing",
    "mirror art",
    "symmetrical drawing",
    "online drawing game",
    "free art tool",
    "creative drawing",
  ],
  alternates: {
    canonical: "/symmetry",
  },
  openGraph: {
    title: "Symmetry Draw - Mirror Drawing Game",
    description:
      "Draw on one half and watch it mirror in real-time. Create symmetrical art online for free.",
    type: "website",
    siteName: "DoodleLab",
  },
};

export default function SymmetryPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
      </div>
      <SymmetryPlay />

      <section className="mt-12 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            How to Use Symmetry Draw
          </h2>
          <ul className="space-y-2 text-ink-2">
            <li>• Choose your brush color from the palette</li>
            <li>• Adjust brush size with the slider</li>
            <li>• Draw on the canvas - every stroke mirrors automatically</li>
            <li>• Click Clear to start over</li>
            <li>• Click Save to download your symmetrical artwork</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            Why Symmetry Drawing?
          </h2>
          <p className="text-ink-2 leading-relaxed">
            Symmetrical drawing helps create balanced, harmonious art without the
            difficulty of manual mirroring. It's perfect for creating mandalas,
            butterfly designs, decorative patterns, and abstract art. The real-time
            mirroring lets you focus on creativity while the tool handles precision.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            Tips for Better Symmetrical Art
          </h2>
          <ul className="space-y-2 text-ink-2">
            <li>• Start with light strokes to plan your design</li>
            <li>• Use smaller brushes for detailed work</li>
            <li>• Try drawing from the center outward for radial patterns</li>
            <li>• Experiment with different colors for layered effects</li>
            <li>• Save your favorites and build a collection</li>
          </ul>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Symmetry Draw",
            description:
              "Free online symmetrical drawing tool. Draw on one half and watch it mirror in real-time.",
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
