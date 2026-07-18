import type { Metadata } from "next";
import PixelArtPlay from "./PixelArtPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Pixel Art Studio - Free Online Pixel Art Creator | DoodleLab",
  description:
    "Create pixel art with a free online editor. Choose grid size, colors, and tools. Draw, fill, erase, and export your pixel art as PNG.",
  keywords: ["pixel art", "pixel art maker", "pixel editor", "online pixel art", "8-bit art"],
  alternates: {
    canonical: "/pixel-art",
  },
  openGraph: {
    title: "Pixel Art Studio - Free Online Pixel Art Maker | DoodleLab",
    description:
      "Create pixel art with a free online editor. Choose grid size, colors, and tools. Draw, fill, erase, and export your pixel art as PNG.",
    type: "website",
  },
};

export default function PixelArtPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <PixelArtPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">About Pixel Art Studio</h2>
        <p className="mb-2">
          Use the draw tool to paint pixels, the fill tool for large areas, and
          the erase tool to clear mistakes. Choose from 8x8, 16x16, or 32x32
          grids depending on how detailed you want to get.
        </p>
        <p>
          When you're done, export your creation as a high-resolution PNG image.
          Perfect for game sprites, avatars, or retro art projects.
        </p>
      </section>
      <RelatedGames current="/pixel-art" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Pixel Art Studio",
            url: "https://doodlelab.fun/pixel-art",
            applicationCategory: "GameApplication",
            description:
              "Create pixel art with a free online editor. Choose grid size, colors, and tools. Draw, fill, erase, and export your pixel art as PNG.",
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
