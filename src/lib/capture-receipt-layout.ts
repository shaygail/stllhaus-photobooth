import { toJpeg } from "html-to-image";

/**
 * Draw `img` into a canvas using the same "cover" crop as CSS object-cover for the given box.
 */
function drawImageObjectCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih || !cw || !ch) return;
  const ratio = cw / ch;
  const imageRatio = iw / ih;
  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;
  if (imageRatio > ratio) {
    sw = ih * ratio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / ratio;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

/**
 * Replaces each receipt photo with a flat JPEG data URL so html-to-image does not rely on
 * SVG foreignObject to paint &lt;img&gt; (often blank with filters/transforms/overlays).
 */
async function bakeReceiptImagesForLayoutCapture(
  imgs: HTMLImageElement[],
  pixelRatio: number,
): Promise<void> {
  for (const img of imgs) {
    if (!img.naturalWidth || !img.naturalHeight) {
      continue;
    }
    const rect = img.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width));
    const ch = Math.max(1, Math.round(rect.height));
    const cwPx = Math.max(1, Math.round(cw * pixelRatio));
    const chPx = Math.max(1, Math.round(ch * pixelRatio));
    const canvas = document.createElement("canvas");
    canvas.width = cwPx;
    canvas.height = chPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const style = window.getComputedStyle(img);
    const filter = style.filter && style.filter !== "none" ? style.filter : "none";
    try {
      ctx.filter = filter;
    } catch {
      ctx.filter = "none";
    }
    drawImageObjectCover(ctx, img, cwPx, chPx);

    try {
      img.src = canvas.toDataURL("image/jpeg", 0.92);
      img.style.filter = "none";
      img.style.transform = "none";
    } catch {
      /* keep original src */
    }
  }
}

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
  const imgs = [...node.querySelectorAll("img")] as HTMLImageElement[];
  const srcBackups = imgs.map((img) => img.src);
  const styleBackups = imgs.map((img) => img.getAttribute("style"));

  const grainEls = [
    ...node.querySelectorAll("[data-receipt-grain]"),
  ] as HTMLElement[];
  const grainVis = grainEls.map((g) => g.style.visibility);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

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

    grainEls.forEach((g) => {
      g.style.visibility = "hidden";
    });

    await bakeReceiptImagesForLayoutCapture(imgs, pixelRatio);

    return await toJpeg(node, {
      quality,
      pixelRatio,
      backgroundColor: "#ffffff",
      cacheBust: false,
    });
  } catch {
    return null;
  } finally {
    imgs.forEach((img, i) => {
      const s = srcBackups[i];
      if (s) img.src = s;
      const st = styleBackups[i];
      if (st === null) img.removeAttribute("style");
      else img.setAttribute("style", st);
    });
    grainEls.forEach((g, i) => {
      g.style.visibility = grainVis[i] ?? "";
    });
  }
}
