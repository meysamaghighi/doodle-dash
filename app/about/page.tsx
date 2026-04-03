import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About DoodleLab - Free Drawing Games & Creative Tools",
  description:
    "Learn about DoodleLab, a free creative drawing games site with 15 interactive tools. No accounts, no downloads, just pure creative fun.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About DoodleLab",
    description: "Free drawing games site with 15 interactive tools. Built for creativity, privacy-focused.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">
        About DoodleLab
      </h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">What is DoodleLab?</h2>
          <p>
            DoodleLab is a free creative drawing games site featuring 15 interactive
            drawing tools and games. From pixel art and kaleidoscopes to speed
            sketching and mirror drawing, each game is designed to spark creativity
            and challenge your artistic skills.
          </p>
          <p className="mt-3">
            All games are original, custom-built using HTML5 Canvas technology. No
            downloads, no accounts, no barriers between you and your creativity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">Games & Tools</h2>
          <p>
            Our collection includes creative tools like Pixel Art Studio,
            Kaleidoscope, and Gradient Paint, alongside skill-based challenges like
            Speed Sketch, Memory Draw, and One Line Art. Whether you want to relax
            with freeform drawing or test your artistic memory, there's something for
            everyone.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">Privacy & Data</h2>
          <p>
            We respect your privacy. DoodleLab does not require accounts, does not
            collect personal data, and does not use tracking cookies beyond basic
            analytics.
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>
              <strong>No accounts:</strong> Use all games instantly, no sign-up
              required.
            </li>
            <li>
              <strong>Local storage only:</strong> Your personal best scores are
              saved locally in your browser. We never see them.
            </li>
            <li>
              <strong>Google Analytics:</strong> We use GA4 to track anonymous usage
              statistics (page views, session duration) to improve the site. No
              personally identifiable information is collected.
            </li>
            <li>
              <strong>Ads:</strong> We may display non-intrusive ads via Google
              AdSense to support the site. No popups, no interstitials.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">Who Built This?</h2>
          <p>
            DoodleLab is built and maintained by MeyDev, an independent developer
            creating free creative tools and games. The goal is simple: make fun,
            accessible creative experiences that anyone can enjoy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
          <p>
            Questions, feedback, or suggestions? Reach out at{" "}
            <a
              href="mailto:meydev.studio@gmail.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              meydev.studio@gmail.com
            </a>
          </p>
        </section>

        <section className="pt-6">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
          >
            Back to Games
          </Link>
        </section>
      </div>
    </main>
  );
}
