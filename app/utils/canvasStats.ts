/** Compare two images and return a similarity percentage (0-100).
 *  Scores how well the drawing covers the reference shapes,
 *  with a penalty for drawing in wrong areas. */
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

        const BG_R = 0x11, BG_G = 0x18, BG_B = 0x27;
        const isBg = (r: number, g: number, b: number) =>
          Math.abs(r - BG_R) < 30 && Math.abs(g - BG_G) < 30 && Math.abs(b - BG_B) < 30;

        let refShapePixels = 0;   // pixels that have content in reference
        let covered = 0;          // ref shape pixels where drawing also has content nearby in color
        let wrongPixels = 0;      // pixels where drawing has content but reference doesn't
        let refBgPixels = 0;

        for (let i = 0; i < refData.length; i += 4) {
          const rRef = refData[i], gRef = refData[i + 1], bRef = refData[i + 2];
          const rDraw = drawData[i], gDraw = drawData[i + 1], bDraw = drawData[i + 2];

          const refIsBg = isBg(rRef, gRef, bRef);
          const drawIsBg = isBg(rDraw, gDraw, bDraw);

          if (refIsBg) {
            refBgPixels++;
            if (!drawIsBg) wrongPixels++;
          } else {
            refShapePixels++;
            if (!drawIsBg) {
              // Both have content -- check color similarity
              const dr = rRef - rDraw, dg = gRef - gDraw, db = bRef - bDraw;
              const dist = Math.sqrt(dr * dr + dg * dg + db * db);
              if (dist < 120) covered++;
            }
          }
        }

        if (refShapePixels === 0) {
          resolve(0);
          return;
        }

        // Coverage: what % of reference shapes did you draw?
        const coverageScore = covered / refShapePixels;

        // Penalty: what % of background did you accidentally draw on?
        const wrongRatio = refBgPixels > 0 ? wrongPixels / refBgPixels : 0;
        const penalty = Math.min(wrongRatio * 3, 0.5); // max 50% penalty

        const finalScore = Math.max(0, Math.round((coverageScore - penalty) * 100));
        resolve(finalScore);
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
