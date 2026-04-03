import type { Metadata } from "next";
import GradientPaint from "../components/GradientPaint";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Gradient Paint - Create Gradient Brush Art | DoodleLab",
  description:
    "Paint with beautiful gradient brushes. Pick start and end colors, adjust brush size, and create stunning gradient art. Export as PNG.",
  keywords: ["gradient paint", "gradient art", "creative drawing", "digital painting"],
  alternates: {
    canonical: "/gradient-paint",
  },
  openGraph: {
    title: "Gradient Paint - Create Gradient Brush Art | DoodleLab",
    description:
      "Paint with beautiful gradient brushes. Pick start and end colors, adjust brush size, and create stunning gradient art.",
    type: "website",
    url: "https://doodlelab.fun/gradient-paint",
  },
};

export default function GradientPaintPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-center mb-2">Gradient Paint</h1>
      <p className="text-gray-400 text-center mb-8">
        Paint with beautiful gradient brushes. Create colorful, flowing artwork!
      </p>
      <GradientPaint />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">How to Use</h2>
        <p className="mb-2">
          Select your start and end colors using the color pickers, or choose from preset
          gradients like Sunset, Ocean, or Cyber. Adjust the brush size with the slider,
          then paint on the canvas to create beautiful gradient art.
        </p>
        <p>
          Each brush stroke blends smoothly from your start color to your end color.
          Experiment with different color combinations and brush sizes to create unique effects.
          Save your artwork as a PNG when you're done!
        </p>
      </section>
      <RelatedGames current="/gradient-paint" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Gradient Paint",
            url: "https://doodlelab.fun/gradient-paint",
            applicationCategory: "GameApplication",
            description:
              "Paint with beautiful gradient brushes. Pick start and end colors, adjust brush size, and create stunning gradient art.",
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
                name: "What is gradient painting?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Gradient painting uses brushes that blend smoothly between two colors, creating beautiful color transitions in your artwork. Each stroke fades from your start color to your end color.",
                },
              },
              {
                "@type": "Question",
                name: "Can I save my gradient art?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Click the Save PNG button to download your artwork. On mobile, you can share it directly to your photo gallery.",
                },
              },
              {
                "@type": "Question",
                name: "Can I create custom gradient colors?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Use the color pickers to choose any start and end colors. You can also use the preset gradients as a starting point and customize from there.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
