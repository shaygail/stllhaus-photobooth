import { toJpeg } from "html-to-image";

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

    const imgs = [...node.querySelectorAll("img")];
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              }),
      ),
    );

    for (const img of imgs) {
      if (typeof img.decode === "function") {
        try {
          await img.decode();
        } catch {
          /* still attempt capture */
        }
      }
    }

    return await toJpeg(node, {
      quality,
      pixelRatio,
      backgroundColor: "#ffffff",
      // `true` appends ?t=… to every URL; that breaks valid data:/blob: URLs when re-fetched.
      cacheBust: false,
    });
  } catch {
    return null;
  }
}
