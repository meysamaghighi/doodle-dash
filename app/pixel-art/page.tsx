import type { Metadata } from "next";
import PixelArt from "../components/PixelArt";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Pixel Art Studio - Free Online Pixel Art Creator | DoodleLab",
  description:
    "Create pixel art with a free online editor. Choose grid size, colors, and tools. Draw, fill, erase, and export your pixel art as PNG.",
  keywords: ["pixel art", "pixel art maker", "pixel editor", "online pixel art", "8-bit art"],
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
      <h1 className="text-3xl font-black text-center mb-2">Pixel Art Studio</h1>
      <p className="text-gray-400 text-center mb-8">
        Create pixel art on a grid. Pick colors, draw, fill, and export as PNG.
      </p>
      <PixelArt />
      <section className="mt-16 text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-3">About Pixel Art Studio</h2>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is pixel art?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Pixel art is a form of digital art where images are created at the pixel level on a grid. It's the art style used in classic video games like Mario and Zelda, and remains popular in indie games today.",
                },
              },
              {
                "@type": "Question",
                name: "What grid size should I use?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Start with a 16x16 grid for simple icons and characters. 32x32 is great for more detailed sprites. Larger grids (64x64+) allow for complex scenes but take longer.",
                },
              },
              {
                "@type": "Question",
                name: "Can I save my pixel art?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! You can save your creation as a PNG image directly to your device. Share it on social media or use it in your own projects.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
