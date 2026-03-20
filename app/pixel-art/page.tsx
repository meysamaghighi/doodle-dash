import type { Metadata } from "next";
import PixelArt from "../components/PixelArt";

export const metadata: Metadata = {
  title: "Pixel Art Studio - Free Online Pixel Art Creator | DoodleLab",
  description:
    "Create pixel art with a free online editor. Choose grid size, colors, and tools. Draw, fill, erase, and export your pixel art as PNG.",
  keywords: ["pixel art", "pixel art maker", "pixel editor", "online pixel art", "8-bit art"],
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
    </main>
  );
}
