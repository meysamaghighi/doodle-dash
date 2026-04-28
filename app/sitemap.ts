import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://doodlelab.fun";
  const routes = [
    "/",
    "/daily",
    "/gallery",
    "/speed-sketch",
    "/pixel-art",
    "/mirror-draw",
    "/memory-draw",
    "/one-line",
    "/blind-draw",
    "/dot-connect",
    "/trace-master",
    "/symmetry",
    "/color-fill",
    "/spiral-draw",
    "/sketch-copy",
    "/kaleidoscope",
    "/shape-builder",
    "/gradient-paint",
    "/about",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "/daily" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === "/" ? 1 :
      route === "/daily" ? 0.95 :
      route === "/about" ? 0.3 :
      0.8,
  }));
}
