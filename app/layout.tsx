import type { Metadata } from "next";
import { Inter, Caveat, JetBrains_Mono } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
    >
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
      <body className="bg-paper text-ink min-h-screen font-body antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
