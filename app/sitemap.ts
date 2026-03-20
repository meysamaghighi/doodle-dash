import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://doodlelab.fun";
  const routes = [
    "/",
    "/speed-sketch",
    "/pixel-art",
    "/mirror-draw",
    "/memory-draw",
    "/one-line",
    "/blind-draw",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
}
