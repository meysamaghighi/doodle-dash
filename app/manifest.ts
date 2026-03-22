import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DoodleLab - Drawing Games",
    short_name: "DoodleLab",
    description: "Free creative drawing games. Speed Sketch, Pixel Art, Memory Draw, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#f97316",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
