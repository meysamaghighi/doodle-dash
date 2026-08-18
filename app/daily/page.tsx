import type { Metadata } from "next";
import DailyPrompt from "./DailyPrompt";

export const metadata: Metadata = {
  title: "Today's Prompt · DoodleLab",
  description:
    "A new drawing challenge every day, judged by a robot that guesses your drawing. Collect stickers and unlock new art supplies. Free, no sign-up.",
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Today's Prompt · DoodleLab",
    description: "A new drawing challenge every day. Make the robot see it, collect stickers, unlock new art supplies.",
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
              "A new drawing challenge every day, judged by a robot that guesses your drawing. Collect stickers and unlock new art supplies. Free, no sign-up.",
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
