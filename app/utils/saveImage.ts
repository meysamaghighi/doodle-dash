// Stamp a subtle "doodlelab.fun" watermark onto the bottom-right corner of an
// exported drawing. This only touches the exported copy — never the live
// drawing canvas. Defensive by design: any failure falls back to the
// original, unbranded dataUrl so exports never break.
async function brandDataUrl(dataUrl: string): Promise<string> {
  try {
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for watermark"));
    });
    img.src = dataUrl;
    await loaded;

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return dataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, width, height);

    const label = "doodlelab.fun";
    const size = Math.max(14, Math.round(width * 0.025));
    const padding = size * 0.8;

    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";

    // Dark stroke behind a near-white fill keeps the label legible on any
    // background color the drawing might have.
    ctx.lineWidth = size / 6;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.strokeText(label, width - padding, height - padding);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(label, width - padding, height - padding);

    return canvas.toDataURL("image/png");
  } catch {
    // Never let a watermarking failure break the export flow.
    return dataUrl;
  }
}

export async function saveImage(dataUrl: string, filename: string) {
  const brandedUrl = await brandDataUrl(dataUrl);

  // Convert data URL to blob
  const res = await fetch(brandedUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: "image/png" });

  // On mobile (iOS/Android), use Web Share API to save to gallery
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // User cancelled share — that's fine, fall through
      if ((e as Error).name === "AbortError") return;
    }
  }

  // Desktop fallback: trigger download
  const link = document.createElement("a");
  link.download = filename;
  link.href = brandedUrl;
  link.click();
}
