import type { Metadata } from "next";
import Link from "next/link";
import MobileNav from "./components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://doodlelab.fun"),
  title: "DoodleLab - Free Drawing Challenges & Creative Games",
  description:
    "Free online drawing games: speed sketch, pixel art, mirror draw, memory draw, one-line art, and blind drawing challenges. No sign-up required.",
  openGraph: {
    title: "DoodleLab - Free Drawing Challenges",
    description: "6 creative drawing games. Sketch, pixel art, mirror draw, and more. Free, no sign-up.",
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
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
            <p>Free drawing challenges. No account required. Your art stays in your browser.</p>
            <p className="mt-2">
              <Link href="https://benchmybrain.com" className="hover:text-gray-300">BenchMyBrain</Link>
              {" | "}
              <Link href="https://cashcalcs.com" className="hover:text-gray-300">CashCalcs</Link>
              {" | "}
              <Link href="/" className="hover:text-gray-300">DoodleLab</Link>
              {" | "}
              <Link href="https://playmini.fun" className="hover:text-gray-300">PlayMini</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
