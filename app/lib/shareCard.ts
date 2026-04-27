"use client";

/**
 * Generate a 1200x630 PNG share card themed to DoodleLab tokens.
 * Returns a data URL. The card carries the site wordmark, a headline
 * (prompt / streak / activity), and the date.
 *
 * Per design spec (Cross-Site System.html, concern 04): one OG-card
 * generator built once per site, themed by tokens. This is DoodleLab's.
 */

export type ShareCardInput = {
  /** Top-line text, e.g. "14-day streak", "Drew a cat in a hat". */
  headline: string;
  /** Optional secondary line, e.g. "Today's prompt", "Speed sketch". */
  subline?: string;
};

const W = 1200;
const H = 630;

const PAPER = "#FBF6EB";
const PAPER_2 = "#F4ECDA";
const INK = "#131A2A";
const INK_2 = "#495168";
const INK_3 = "#8B92A6";
const ACCENT = "oklch(0.74 0.16 25)";

function todayLabel(): string {
  const d = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function generateShareCard({ headline, subline }: ShareCardInput): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return "";

  g.fillStyle = PAPER;
  g.fillRect(0, 0, W, H);

  g.fillStyle = ACCENT;
  g.fillRect(0, 0, 12, H);

  g.fillStyle = INK;
  g.font = "700 64px 'Caveat', cursive";
  g.textBaseline = "alphabetic";
  g.fillText("DoodleLab", 80, 130);

  g.fillStyle = INK_3;
  g.font = "500 22px 'JetBrains Mono', ui-monospace, monospace";
  g.fillText(todayLabel(), 80, 175);

  g.fillStyle = INK;
  g.font = "700 96px 'Caveat', cursive";
  const maxWidth = W - 160;
  const words = headline.split(" ");
  let line = "";
  let y = 320;
  const lineHeight = 100;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) {
      g.fillText(line, 80, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) g.fillText(line, 80, y);

  if (subline) {
    g.fillStyle = INK_2;
    g.font = "500 28px 'Inter', system-ui, sans-serif";
    g.fillText(subline, 80, y + 60);
  }

  const pillX = 80;
  const pillY = H - 80;
  const pillW = 220;
  const pillH = 44;
  g.fillStyle = PAPER_2;
  roundRect(g, pillX, pillY - 32, pillW, pillH, 22);
  g.fill();
  g.fillStyle = INK_2;
  g.font = "600 18px 'Inter', system-ui, sans-serif";
  g.fillText("doodlelab.fun", pillX + 24, pillY - 4);

  return c.toDataURL("image/png");
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export async function shareCard(
  dataUrl: string,
  filename = "doodlelab-share.png"
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: { files?: File[] }) => boolean;
    };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file] });
      return;
    }
  } catch {
    // fall through to download
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
