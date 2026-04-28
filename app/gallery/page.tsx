import type { Metadata } from "next";
import GalleryView from "./GalleryView";

export const metadata: Metadata = {
  title: "Your Gallery · DoodleLab",
  description:
    "Your saved doodles. Stored locally in your browser, never on our servers. Download or delete any drawing.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Your Gallery · DoodleLab",
    description: "Your saved doodles, stored locally in your browser.",
    type: "website",
    siteName: "DoodleLab",
  },
};

export default function GalleryPage() {
  return <GalleryView />;
}
