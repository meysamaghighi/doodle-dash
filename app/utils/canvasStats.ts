/** Compare two images pixel-by-pixel and return a similarity percentage (0-100). */
export function compareImages(refDataUrl: string, drawDataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    const refImg = new Image();
    refImg.onload = () => {
      ctx.drawImage(refImg, 0, 0);
      const refData = ctx.getImageData(0, 0, 512, 512).data;

      const drawImg = new Image();
      drawImg.onload = () => {
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(drawImg, 0, 0);
        const drawData = ctx.getImageData(0, 0, 512, 512).data;

        let matching = 0;
        let total = 0;
        const BG_R = 0x11, BG_G = 0x18, BG_B = 0x27;

        for (let i = 0; i < refData.length; i += 4) {
          const rRef = refData[i], gRef = refData[i + 1], bRef = refData[i + 2];
          const rDraw = drawData[i], gDraw = drawData[i + 1], bDraw = drawData[i + 2];

          const refIsBg = Math.abs(rRef - BG_R) < 10 && Math.abs(gRef - BG_G) < 10 && Math.abs(bRef - BG_B) < 10;
          const drawIsBg = Math.abs(rDraw - BG_R) < 10 && Math.abs(gDraw - BG_G) < 10 && Math.abs(bDraw - BG_B) < 10;

          // Only compare pixels where at least one image has content
          if (refIsBg && drawIsBg) continue;

          total++;
          const dr = rRef - rDraw;
          const dg = gRef - gDraw;
          const db = bRef - bDraw;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          // Max distance is ~441 (black vs white), count as match if close
          if (dist < 80) matching++;
        }

        if (total === 0) {
          resolve(0);
          return;
        }
        resolve(Math.round((matching / total) * 100));
      };
      drawImg.src = drawDataUrl;
    };
    refImg.src = refDataUrl;
  });
}

/** Analyze a canvas and return drawing stats. */
export function getDrawingStats(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const BG_R = 0x11, BG_G = 0x18, BG_B = 0x27;
  let drawnPixels = 0;
  const totalPixels = canvas.width * canvas.height;
  const colors = new Set<string>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const isBg = Math.abs(r - BG_R) < 10 && Math.abs(g - BG_G) < 10 && Math.abs(b - BG_B) < 10;
    if (!isBg) {
      drawnPixels++;
      // Quantize to reduce noise
      colors.add(`${Math.round(r / 32)},${Math.round(g / 32)},${Math.round(b / 32)}`);
    }
  }

  const coverage = Math.round((drawnPixels / totalPixels) * 100);
  return { coverage, colorsUsed: colors.size };
}
