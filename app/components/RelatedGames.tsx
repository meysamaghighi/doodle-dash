import Link from "next/link";

const allGames = [
  { href: "/speed-sketch", label: "Speed Sketch", color: "from-red-500 to-orange-500" },
  { href: "/pixel-art", label: "Pixel Art", color: "from-blue-500 to-indigo-500" },
  { href: "/mirror-draw", label: "Mirror Draw", color: "from-purple-500 to-pink-500" },
  { href: "/memory-draw", label: "Memory Draw", color: "from-emerald-500 to-teal-500" },
  { href: "/one-line", label: "One Line Art", color: "from-amber-500 to-yellow-500" },
  { href: "/blind-draw", label: "Blind Draw", color: "from-cyan-500 to-blue-500" },
];

const relatedMap: Record<string, string[]> = {
  "/speed-sketch": ["/blind-draw", "/memory-draw", "/one-line"],
  "/pixel-art": ["/mirror-draw", "/one-line", "/speed-sketch"],
  "/mirror-draw": ["/pixel-art", "/one-line", "/speed-sketch"],
  "/memory-draw": ["/speed-sketch", "/blind-draw", "/mirror-draw"],
  "/one-line": ["/pixel-art", "/mirror-draw", "/blind-draw"],
  "/blind-draw": ["/speed-sketch", "/memory-draw", "/one-line"],
};

export default function RelatedGames({ current }: { current: string }) {
  const related = relatedMap[current] ?? [];
  const items = related
    .map((href) => allGames.find((g) => g.href === href))
    .filter(Boolean) as typeof allGames;

  if (items.length === 0) return null;

  return (
    <section className="mt-12 max-w-xl mx-auto">
      <h2 className="text-lg font-bold text-white mb-4">Try These Too</h2>
      <div className="flex flex-wrap gap-3">
        {items.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`px-4 py-2 bg-gradient-to-r ${game.color} text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90`}
          >
            {game.label}
          </Link>
        ))}
        <Link
          href="/"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          All Games
        </Link>
      </div>
    </section>
  );
}
