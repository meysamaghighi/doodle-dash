import Link from "next/link";
import MobileNav from "./MobileNav";
import CommandPalette from "./CommandPalette";

const navLinks = [
  { href: "/daily", label: "🔥 Daily" },
  { href: "/gallery", label: "Gallery" },
  { href: "/speed-sketch", label: "Speed Sketch" },
  { href: "/pixel-art", label: "Pixel Art" },
  { href: "/mirror-draw", label: "Mirror Draw" },
  { href: "/memory-draw", label: "Memory Draw" },
  { href: "/one-line", label: "One Line" },
  { href: "/blind-draw", label: "Blind Draw" },
  { href: "/dot-connect", label: "Dot Connect" },
  { href: "/trace-master", label: "Trace Master" },
  { href: "/symmetry", label: "Symmetry Draw" },
  { href: "/color-fill", label: "Color Fill" },
  { href: "/spiral-draw", label: "Spiral Draw" },
  { href: "/sketch-copy", label: "Sketch Copy" },
  { href: "/kaleidoscope", label: "Kaleidoscope" },
  { href: "/shape-builder", label: "Shape Builder" },
  { href: "/gradient-paint", label: "Gradient Paint" },
];

export default function SiteHeader() {
  return (
    <nav
      className="border-b border-line sticky top-0 z-50 backdrop-blur"
      style={{ background: "color-mix(in oklab, var(--paper) 88%, transparent)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl text-ink"
          style={{ fontWeight: 700 }}
        >
          DoodleLab
        </Link>
        <div className="flex items-center gap-2">
          <CommandPalette />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </nav>
  );
}
