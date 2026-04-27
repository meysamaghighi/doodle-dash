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
  return <DailyPrompt />;
}
