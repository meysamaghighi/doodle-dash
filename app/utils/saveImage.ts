export async function saveImage(dataUrl: string, filename: string) {
  // Convert data URL to blob
  const res = await fetch(dataUrl);
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
  link.href = dataUrl;
  link.click();
}
