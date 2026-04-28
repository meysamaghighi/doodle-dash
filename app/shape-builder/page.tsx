import type { Metadata } from "next";
import ShapeBuilderPlay from "./ShapeBuilderPlay";
import RelatedGames from "../components/RelatedGames";

export const metadata: Metadata = {
  title: "Shape Builder - Build with Shapes Puzzle Game | DoodleLab",
  description:
    "Drag and combine circles, squares, and triangles to build target images. 10 levels of increasing complexity. Free puzzle game.",
  keywords: ["shape builder", "puzzle game", "shape matching", "building game"],
  alternates: {
    canonical: "/shape-builder",
  },
  openGraph: {
    title: "Shape Builder - Build with Shapes Puzzle Game | DoodleLab",
    description:
      "Drag and combine circles, squares, and triangles to build target images. 10 levels of increasing complexity.",
    type: "website",
    url: "https://doodlelab.fun/shape-builder",
  },
};

export default function ShapeBuilderPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <ShapeBuilderPlay />
      <section className="mt-16 text-ink-3 text-sm max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-ink mb-3">How to Play</h2>
        <p className="mb-2">
          Look at the target image on the left. Select a shape (circle, square, or triangle)
          and click on the right canvas to place it. Try to match the positions, sizes, and
          arrangement of shapes as closely as possible.
        </p>
        <p>
          Use the Undo button to remove the last shape, or Clear to start over. When you're
          satisfied with your build, hit Check to see your accuracy score!
        </p>
      </section>
      <RelatedGames current="/shape-builder" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Shape Builder",
            url: "https://doodlelab.fun/shape-builder",
            applicationCategory: "GameApplication",
            description:
              "Drag and combine circles, squares, and triangles to build target images. 10 levels of increasing complexity.",
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
                name: "How does Shape Builder scoring work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Your score is based on how closely your placed shapes match the target positions, sizes, and types. Extra or missing shapes reduce your score.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Shape Builder on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Shape Builder works on phones and tablets. Tap to select shapes and tap the canvas to place them.",
                },
              },
              {
                "@type": "Question",
                name: "How many levels are there?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are 10 levels with increasing complexity, from a simple circle to intricate patterns like castles and robots.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
