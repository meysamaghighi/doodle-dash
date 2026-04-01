import type { Metadata } from "next";
import Link from "next/link";
import MobileNav from "./components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://doodlelab.fun"),
  title: "DoodleLab - Free Drawing Challenges & Creative Games",
  description:
    "Free online drawing games: speed sketch, pixel art, mirror draw, memory draw, spiral draw, kaleidoscope, gradient paint, and more. 15 creative games. No sign-up required.",
  openGraph: {
    title: "DoodleLab - Free Drawing Challenges",
    description: "15 creative drawing games. Sketch, pixel art, mirror draw, kaleidoscope, and more. Free, no sign-up.",
    type: "website",
    siteName: "DoodleLab",
  },
};

const navLinks = [
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-2621005924235240"
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-37XZTPKVB8"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-37XZTPKVB8');` }} />
      </head>
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-950/90 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-white">
              DoodleLab
            </Link>
            <MobileNav links={navLinks} />
          </div>
        </nav>

        {children}

        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-xs text-gray-500">Free drawing challenges. No account required. Your art stays in your browser.</p>
            <div className="mt-3">
              <Link href="/about" className="text-sm text-gray-400 hover:text-gray-300 underline">About & Privacy</Link>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Check out our other sites:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="https://benchmybrain.com" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">BenchMyBrain</Link>
                <Link href="https://cashcalcs.com" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">CashCalcs</Link>
                <Link href="/" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">DoodleLab</Link>
                <Link href="https://playmini.fun" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-200 transition-colors">PlayMini</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
