import type { Metadata } from "next";
import Link from "next/link";
import { CrossPromoCard } from "./components/CrossPromo";
import DailyBanner from "./components/DailyBanner";
import { GAME_ICONS } from "./components/GameIcons";

export const metadata: Metadata = {
  title: "DoodleLab - Free Drawing Challenges & Creative Games",
  description:
    "Free online drawing games: robot draw, speed sketch, pixel art, mirror draw, kaleidoscope, spirograph, gradient paint, and more. 17 creative games. No sign-up required.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DoodleLab - Free Drawing Challenges",
    description:
      "17 creative drawing games. Sketch, pixel art, symmetry draw, kaleidoscope, spirograph, gradient paint, and more. Free, no sign-up.",
    type: "website",
  },
};

const gameCategories = [
  {
    category: "Most Popular",
    games: [
      {
        href: "/robot-draw",
        label: "Robot Draw",
        description: "Draw anything and a robot guesses it, stroke by stroke.",
        color: "from-cyan-400 to-indigo-600",
      },
      {
        href: "/kaleidoscope",
        label: "Kaleidoscope",
        description: "Every stroke is rotated and mirrored into 4-12 wedges at once.",
        color: "from-fuchsia-500 to-violet-600",
      },
      {
        href: "/symmetry",
        label: "Symmetry Draw",
        description: "Your stroke repeats around the centre in 4, 6, 8 or 12-way symmetry.",
        color: "from-sky-500 to-blue-600",
      },
      {
        href: "/mirror-draw",
        label: "Mirror Draw",
        description: "Reflect your strokes across a vertical, horizontal or four-way axis.",
        color: "from-teal-500 to-cyan-600",
      },
      {
        href: "/color-fill",
        label: "Color Fill",
        description: "Tap or drag to colour in twelve generated line-art patterns.",
        color: "from-rose-500 to-orange-500",
      },
      {
        href: "/pixel-art",
        label: "Pixel Art",
        description: "Create pixel art on a grid with a full color palette.",
        color: "from-amber-500 to-orange-600",
      },
      {
        href: "/gradient-paint",
        label: "Gradient Paint",
        description: "Paint with soft gradient brushes. Create colorful art!",
        color: "from-pink-500 to-purple-600",
      },
      {
        href: "/spirograph",
        label: "Spirograph",
        description: "Roll a toothed wheel around a ring and watch it draw.",
        color: "from-indigo-500 to-violet-600",
      },
    ],
  },
  {
    category: "Challenge Games",
    games: [
      {
        href: "/speed-sketch",
        label: "Speed Sketch",
        description: "Draw the prompt as fast as you can in 30 seconds!",
        color: "from-orange-500 to-red-600",
      },
      {
        href: "/memory-draw",
        label: "Memory Draw",
        description: "Study a shape, then draw it from memory.",
        color: "from-emerald-500 to-green-700",
      },
      {
        href: "/blind-draw",
        label: "Blind Draw",
        description: "The canvas is hidden while you draw. Reveal at the end!",
        color: "from-slate-600 to-slate-900",
      },
      {
        href: "/dot-connect",
        label: "Dot Connect",
        description: "Connect numbered dots in order as fast as you can!",
        color: "from-cyan-500 to-blue-600",
      },
      {
        href: "/trace-master",
        label: "Trace Master",
        description: "Trace over ghost shapes as accurately as possible.",
        color: "from-lime-500 to-emerald-600",
      },
      {
        href: "/one-line",
        label: "One Line",
        description: "Draw without lifting your pen. One continuous stroke.",
        color: "from-yellow-500 to-amber-600",
      },
      {
        href: "/spiral-draw",
        label: "Spiral Draw",
        description: "Draw a smooth spiral from center outward. How perfect can you get?",
        color: "from-violet-500 to-indigo-700",
      },
      {
        href: "/sketch-copy",
        label: "Sketch Copy",
        description: "Copy the reference shape as accurately as you can. 5 levels!",
        color: "from-teal-600 to-sky-700",
      },
      {
        href: "/shape-builder",
        label: "Shape Builder",
        description: "Combine circles, squares, triangles to build images. 10 levels!",
        color: "from-rose-500 to-pink-700",
      },
    ],
  },
];

export default function Home() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DoodleLab Drawing Games",
    description: "17 free online drawing games — no sign-up required.",
    numberOfItems: gameCategories.reduce((sum, c) => sum + c.games.length, 0),
    itemListElement: gameCategories
      .flatMap((c) => c.games)
      .map((game, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://doodlelab.fun${game.href}`,
        name: game.label,
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <section className="text-center mb-6 sm:mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-3">
          Today&apos;s Prompt
        </p>
        <h1
          className="font-display text-5xl sm:text-7xl mb-3 text-ink"
          style={{ fontWeight: 700, lineHeight: 0.95 }}
        >
          Draw, create, challenge.
        </h1>
        <p className="text-ink-2 text-sm sm:text-base max-w-xl mx-auto">
          17 free drawing games to test your creativity and skill. No sign-up, no
          downloads. Just pick a game and start drawing.
        </p>
      </section>

      <DailyBanner />

      {gameCategories.map((category) => (
        <section key={category.category} className="mb-6 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-ink">
            {category.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {category.games.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="group relative overflow-hidden rounded-xl border border-line bg-paper-2 p-3 hover:border-ink-3 transition-colors"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${game.color} text-white mb-2`}
                  >
                    {GAME_ICONS[game.href]}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold mb-1 text-ink">{game.label}</h3>
                  <p className="text-ink-2 text-xs hidden sm:block">{game.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10 sm:mt-14 max-w-xl mx-auto">
        <CrossPromoCard utmContent="homepage" />
      </section>

      <section className="mt-8 sm:mt-12 text-center text-ink-2 text-sm max-w-xl mx-auto">
        <h2 className="text-base sm:text-lg font-bold text-ink mb-2 sm:mb-3">
          Free Drawing Games for Everyone
        </h2>
        <p>
          DoodleLab is a collection of creative drawing challenges that run
          entirely in your browser. Test your speed with timed sketching, explore
          pixel art, try mirror drawing, or challenge your visual memory. All
          games are free, require no account, and your art stays on your device.
        </p>
      </section>
      </main>
    </>
  );
}
