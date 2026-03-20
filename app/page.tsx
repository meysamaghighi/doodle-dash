import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DoodleLab - Free Drawing Challenges & Creative Games",
  description:
    "Free online drawing games: speed sketch, pixel art, mirror draw, memory draw, one-line art, and blind drawing challenges. No sign-up required.",
  openGraph: {
    title: "DoodleLab - Free Drawing Challenges",
    description:
      "6 creative drawing games. Sketch, pixel art, mirror draw, and more. Free, no sign-up.",
    type: "website",
  },
};

const games = [
  {
    href: "/speed-sketch",
    label: "Speed Sketch",
    description: "Draw the prompt as fast as you can in 30 seconds!",
    color: "from-orange-500 to-red-500",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    href: "/pixel-art",
    label: "Pixel Art",
    description: "Create pixel art on a grid with a full color palette.",
    color: "from-purple-500 to-pink-500",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="4" height="4" rx="0.5" />
        <rect x="10" y="3" width="4" height="4" rx="0.5" />
        <rect x="17" y="3" width="4" height="4" rx="0.5" />
        <rect x="3" y="10" width="4" height="4" rx="0.5" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" />
        <rect x="17" y="10" width="4" height="4" rx="0.5" />
        <rect x="3" y="17" width="4" height="4" rx="0.5" />
        <rect x="10" y="17" width="4" height="4" rx="0.5" />
        <rect x="17" y="17" width="4" height="4" rx="0.5" />
      </svg>
    ),
  },
  {
    href: "/mirror-draw",
    label: "Mirror Draw",
    description: "Draw on one side and watch it mirror in real time.",
    color: "from-cyan-500 to-blue-500",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7l-4 5 4 5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7l4 5-4 5" />
      </svg>
    ),
  },
  {
    href: "/memory-draw",
    label: "Memory Draw",
    description: "Study a shape, then draw it from memory.",
    color: "from-green-500 to-emerald-500",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    href: "/one-line",
    label: "One Line",
    description: "Draw without lifting your pen. One continuous stroke.",
    color: "from-yellow-500 to-orange-500",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17c3-6 6 2 9-4s6 2 9-4" />
      </svg>
    ),
  },
  {
    href: "/blind-draw",
    label: "Blind Draw",
    description: "The canvas is hidden while you draw. Reveal at the end!",
    color: "from-red-500 to-rose-500",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black mb-4">
          Draw, Create, Challenge
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          6 free drawing games to test your creativity and skill. No sign-up, no
          downloads. Just pick a game and start drawing.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-700 transition-all hover:scale-[1.02]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-10 transition-opacity`}
            />
            <div className="relative">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} bg-opacity-20 text-white mb-4`}
              >
                {game.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{game.label}</h2>
              <p className="text-gray-400 text-sm">{game.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 text-center text-gray-500 text-sm max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">
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
  );
}
