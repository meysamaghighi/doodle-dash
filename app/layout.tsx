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
      </head>
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-950/90 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
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
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
