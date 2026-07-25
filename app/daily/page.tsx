import type { Metadata } from "next";
import DailyPrompt from "./DailyPrompt";

export const metadata: Metadata = {
  title: "Today's Prompt · DoodleLab",
  description:
    "A new drawing prompt every day. 60 seconds, no eraser. Build your streak by drawing every day at DoodleLab.",
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Today's Prompt · DoodleLab",
    description: "A new drawing prompt every day. Build your streak.",
    type: "website",
    siteName: "DoodleLab",
  },
};

export default function DailyPage() {
  return (
    <>
      <DailyPrompt />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DoodleLab Daily Prompt",
            url: "https://doodlelab.fun/daily",
            applicationCategory: "GameApplication",
            description:
              "A new drawing prompt every day. 60 seconds, no eraser. Build your streak by drawing every day at DoodleLab.",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </>
  );
}
