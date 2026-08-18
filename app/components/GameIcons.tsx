import type { ReactNode } from "react";

/*
 * Hand-drawn icon per game, keyed by route.
 *
 * Each one depicts what that game actually produces rather than reaching for a
 * generic tool glyph — which is how the old set ended up with Symmetry and
 * Mirror sharing a path, and Color Fill and Gradient Paint both using the same
 * paintbrush. The three symmetry games really are different (Kaleidoscope
 * rotates AND mirrors, Symmetry Draw only rotates, Mirror Draw reflects across
 * axes), so their icons say so.
 *
 * Drawn white on a coloured tile: strokes carry the shape, opacity carries
 * depth, and nothing relies on hue.
 */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="w-8 h-8 sm:w-10 sm:h-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// A symmetric petal from the centre to the rim — the unit a kaleidoscope
// repeats. Mirrored down its own axis, which is what separates it from the
// rotation-only pinwheel below.
const PETAL = "M12 12 Q9.2 7.4 12 2.9 Q14.8 7.4 12 12 Z";

// One asymmetric curved blade. Rotating it — never mirroring it — is exactly
// what Symmetry Draw does to your stroke, and a blade reads as rotation where
// a thin arm just read as a spindly asterisk.
const ARM = "M12 12 C14 9.5 16 7 17.5 5 C18.6 9.2 16.4 12.2 12 12 Z";

// A real hypotrochoid — the curve the toy actually produces. A ring with a
// gear and a hand inside it just reads as a clock face; the looping rosette
// reads as nothing but a spirograph.
const SPIRO = (() => {
  const ringTeeth = 10;
  const wheelTeeth = 4;
  const rr = wheelTeeth / ringTeeth;
  const d = 0.36;
  const armR = 1 - rr;
  const ratio = armR / rr;
  const scale = 9.3 / (armR + d);
  const steps = 132;
  const end = Math.PI * 2 * 2; // closes after two laps for 10/4
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * end;
    const x = 12 + scale * (armR * Math.cos(t) + d * Math.cos(ratio * t));
    const y = 12 + scale * (armR * Math.sin(t) - d * Math.sin(ratio * t));
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

// A true Archimedean spiral beats any hand-guessed arc chain.
const SPIRAL = (() => {
  const turns = 2.75;
  const steps = 52;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2 - Math.PI / 2;
    const r = 0.7 + 8.7 * (i / steps);
    pts.push(`${(12 + r * Math.cos(t)).toFixed(2)} ${(12 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join("L")}`;
})();

// Six pie wedges; filling every other one reads as "colour in the pieces".
const WEDGES = [0, 1, 2, 3, 4, 5].map(i => {
  const p = (k: number) => {
    const a = ((-90 + k * 60) * Math.PI) / 180;
    return `${(12 + 9 * Math.cos(a)).toFixed(2)} ${(12 + 9 * Math.sin(a)).toFixed(2)}`;
  };
  return `M12 12L${p(i)}A9 9 0 0 1 ${p(i + 1)}Z`;
});

// Five-pointed star, used solid for the shape you studied and ghosted for the
// one you have to pull back out of memory.
const STAR = (() => {
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`;
  };
  const parts: string[] = [];
  for (let i = 0; i < 5; i++) parts.push(pt(i * 72, 8), pt(i * 72 + 36, 3.4));
  return `M${parts.join("L")}Z`;
})();

const PIXELS: [number, number, boolean][] = [
  [0, 0, true], [1, 0, false], [2, 0, true],
  [0, 1, false], [1, 1, true], [2, 1, false],
  [0, 2, true], [1, 2, false], [2, 2, true],
];

export const GAME_ICONS: Record<string, ReactNode> = {
  // A robot that looks back at you. Nothing else in the grid is a character,
  // so it reads as the odd one out at a glance — which it is.
  "/robot-draw": (
    <Icon>
      <rect x="3.4" y="7.6" width="17.2" height="12.4" rx="3.4" strokeWidth={1.5} />
      <circle cx="9" cy="13.4" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.4" r="1.7" fill="currentColor" stroke="none" />
      <path d="M9.6 17.2h4.8" strokeWidth={1.4} opacity={0.75} />
      <path d="M12 7.6V4.6" strokeWidth={1.5} />
      <circle cx="12" cy="3.3" r="1.4" fill="currentColor" stroke="none" />
      <path d="M1.6 12.4v2.8M22.4 12.4v2.8" strokeWidth={1.4} opacity={0.7} />
    </Icon>
  ),

  // Rotated AND mirrored wedges, seen down the tube. The enclosing circle is
  // what keeps this from reading as the same radial mark as Symmetry Draw.
  "/kaleidoscope": (
    <Icon>
      <circle cx="12" cy="12" r="10" strokeWidth={1.3} />
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <path
          key={a}
          d={PETAL}
          transform={`rotate(${a} 12 12)`}
          fill={i % 2 === 0 ? "currentColor" : "none"}
          fillOpacity={0.3}
          strokeWidth={1.3}
        />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Icon>
  ),

  // Rotation only — five arms, so it can't read as a mirror.
  "/symmetry": (
    <Icon>
      {[0, 72, 144, 216, 288].map(a => (
        <path
          key={a}
          d={ARM}
          transform={`rotate(${a} 12 12)`}
          fill="currentColor"
          fillOpacity={0.3}
          strokeWidth={1.3}
        />
      ))}
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </Icon>
  ),

  // One stroke and its reflection across the axis. Four quadrant marks around
  // a dashed cross looked like a camera focus reticle, not a mirror.
  "/mirror-draw": (
    <Icon>
      <path d="M12 2.4v19.2" strokeWidth={1.1} strokeDasharray="2 2.4" opacity={0.55} />
      <path d="M9.8 4.6C6.2 6.2 4.8 9.6 6.4 12.4c1.2 2.2.6 4.8-1.6 6.2" />
      <path d="M14.2 4.6c3.6 1.6 5 5 3.4 7.8-1.2 2.2-.6 4.8 1.6 6.2" opacity={0.5} />
    </Icon>
  ),

  // Pieces of a pattern, half of them coloured in.
  "/color-fill": (
    <Icon>
      {WEDGES.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={i % 2 === 0 ? "currentColor" : "none"}
          fillOpacity={0.85}
          strokeWidth={1.3}
        />
      ))}
    </Icon>
  ),

  "/pixel-art": (
    <Icon>
      {PIXELS.map(([cx, cy, on]) => (
        <rect
          key={`${cx}-${cy}`}
          x={1.5 + cx * 7.5}
          y={1.5 + cy * 7.5}
          width={6}
          height={6}
          rx={1}
          fill={on ? "currentColor" : "none"}
          strokeWidth={1.3}
        />
      ))}
    </Icon>
  ),

  // One stroke drawn three times, thick and faint to thin and solid — a brush
  // with soft, graded edges.
  "/gradient-paint": (
    <Icon>
      <path d="M4 16.6C8 8.6 16 15.6 20 7.6" strokeWidth={6} opacity={0.22} />
      <path d="M4 16.6C8 8.6 16 15.6 20 7.6" strokeWidth={3.4} opacity={0.5} />
      <path d="M4 16.6C8 8.6 16 15.6 20 7.6" strokeWidth={1.6} />
    </Icon>
  ),

  // The curve the toy draws, inside a hint of the ring it rolls in.
  "/spirograph": (
    <Icon>
      <circle cx="12" cy="12" r="10" strokeWidth={1.1} opacity={0.35} />
      <path d={SPIRO} strokeWidth={1.4} />
    </Icon>
  ),

  // Pencil with speed lines behind it.
  "/speed-sketch": (
    <Icon>
      <path d="M2.6 6.6h4.6M1.9 10.2h3.3" strokeWidth={1.4} opacity={0.65} />
      <path d="M16.2 3.6 20.4 7.8 9.6 18.6 4.6 19.4 5.4 14.4Z" />
      <path d="M14.1 5.7 18.3 9.9" strokeWidth={1.3} opacity={0.75} />
    </Icon>
  ),

  // The shape you saw, and the afterimage you have to draw from.
  "/memory-draw": (
    <Icon>
      <path d={STAR} transform="translate(3.2 -1.8) scale(0.82) translate(2.6 2.6)" opacity={0.32} strokeWidth={1.4} />
      <path d={STAR} />
    </Icon>
  ),

  // Eye, struck out — the canvas is hidden while you draw.
  "/blind-draw": (
    <Icon>
      <path d="M2.6 12C5.2 7.4 8.6 5.2 12 5.2s6.8 2.2 9.4 6.8c-2.6 4.6-6 6.8-9.4 6.8S5.2 16.6 2.6 12Z" />
      <circle cx="12" cy="12" r="2.9" strokeWidth={1.4} />
      <path d="M3.6 3.6 20.4 20.4" strokeWidth={1.8} />
    </Icon>
  ),

  // Numbered dots, joined so far — the next hop still dashed.
  "/dot-connect": (
    <Icon>
      <path d="M4.5 6.5 10 3.5 16.5 6 20 12.5" strokeWidth={1.4} />
      <path d="M20 12.5 12 20.5" strokeWidth={1.4} strokeDasharray="2 2.2" opacity={0.6} />
      <circle cx="4.5" cy="6.5" r="2.1" fill="currentColor" stroke="none" />
      {[[10, 3.5], [16.5, 6], [20, 12.5]].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
      ))}
      <circle cx="12" cy="20.5" r="1.6" fill="none" strokeWidth={1.4} opacity={0.7} />
    </Icon>
  ),

  // A dashed guide with the pen partway along it.
  "/trace-master": (
    <Icon>
      <path d="M2.8 16.6C6.5 7.6 12 19 15.2 11.6" strokeWidth={1.4} strokeDasharray="2.4 2.4" opacity={0.7} />
      <path d="M15 11.6 18.2 8.9 19.6 10.3Z" fill="currentColor" strokeWidth={1.2} />
      <path d="M18.7 8.4 21.5 5.6" strokeWidth={2} />
    </Icon>
  ),

  // One unbroken stroke that loops back on itself, starting at the dot.
  "/one-line": (
    <Icon>
      <path d="M5 18C1.5 13 4.5 5.5 10 7c5 1.3 2.5 8.5 7 9.5 4 .9 5.5-6.5 2-10" />
      <circle cx="5" cy="18" r="1.7" fill="currentColor" stroke="none" />
    </Icon>
  ),

  "/spiral-draw": (
    <Icon>
      <path d={SPIRAL} strokeWidth={1.5} />
    </Icon>
  ),

  // Reference on the left, your copy on the right.
  "/sketch-copy": (
    <Icon>
      <rect x="2" y="5" width="9" height="14" rx="1.8" strokeWidth={1.4} />
      <rect x="13" y="5" width="9" height="14" rx="1.8" strokeWidth={1.4} />
      <path d="M6.5 9 9.3 14.6 3.7 14.6Z" strokeWidth={1.4} />
      <path d="M17.5 9 20.3 14.6 14.7 14.6Z" strokeWidth={1.4} strokeDasharray="2 2" opacity={0.55} />
    </Icon>
  ),

  // Primitives stacked into something bigger.
  "/shape-builder": (
    <Icon>
      <path d="M12 2.8 16.8 10.4 7.2 10.4Z" strokeWidth={1.4} />
      <rect x="4.2" y="12.4" width="7.6" height="7.6" rx="1.2" strokeWidth={1.4} />
      <circle cx="17.4" cy="16.2" r="3.8" strokeWidth={1.4} />
    </Icon>
  ),
};
