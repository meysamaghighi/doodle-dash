import type { MetadataRoute } from "next";

// Stable lastmod — never use `new Date()` here. A per-request timestamp tells
// crawlers every page "just changed" on every fetch, which erodes the sitemap's
// lastmod signal and hurts indexing. Bump this when content materially changes.
// (Matches the proven playmini fix, 8faf3a0.)
const SITE_LAST_MODIFIED = "2026-07-16";

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
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency:
      route === "/daily" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === "/" ? 1 :
      route === "/daily" ? 0.95 :
      route === "/about" ? 0.3 :
      0.8,
  }));
}
