import html2canvas from "html2canvas";

/**
 * Rasterises the live DOM receipt (same tree as print / booth preview) so
 * digital downloads match the composed thermal layout pixel-for-pixel at
 * this viewport, scaled uniformly by `pixelRatio` for sharper saves.
 */
export async function captureReceiptPrintRoot(
  node: HTMLElement,
  options?: { pixelRatio?: number; quality?: number },
): Promise<string | null> {
  const pixelRatio = options?.pixelRatio ?? 2;
  const quality = options?.quality ?? 0.92;

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: pixelRatio,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      foreignObjectRendering: false,
      onclone: (doc) => {
        const root = doc.getElementById(node.id);
        if (!root) return;
        const imgs = [...root.querySelectorAll("img")] as HTMLImageElement[];
        for (const img of imgs) {
          // Keep source pixels only; style filters/transforms can make iOS raster blank.
          img.style.filter = "none";
          img.style.transform = "none";
          img.style.mixBlendMode = "normal";
        }
        const grain = root.querySelectorAll("[data-receipt-grain]");
        grain.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      },
    });
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}
