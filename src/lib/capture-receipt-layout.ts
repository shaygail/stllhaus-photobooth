import { toJpeg } from "html-to-image";

/**
 * Draw `img` into a canvas using the same "cover" crop as CSS object-cover for the given box.
 */
function canvasLooksUniformlyBlank(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  if (w < 2 || h < 2) return true;
  const pts: [number, number][] = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), Math.floor(h / 2)],
  ];
  for (const [x, y] of pts) {
    const d = ctx.getImageData(x, y, 1, 1).data;
    const b = (d[0]! + d[1]! + d[2]!) / 3;
    if (b < 248) return false;
  }
  return true;
}

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
 * Reliable display box for baking. Off-screen / transformed nodes often report 0 from
 * getBoundingClientRect; offset* and ancestors fix that.
 */
function getImgBakeSize(img: HTMLImageElement): { cw: number; ch: number } {
  let cw = Math.round(img.offsetWidth);
  let ch = Math.round(img.offsetHeight);
  if (cw >= 2 && ch >= 2) {
    return { cw, ch };
  }
  const rect = img.getBoundingClientRect();
  cw = Math.round(rect.width);
  ch = Math.round(rect.height);
  if (cw >= 2 && ch >= 2) {
    return { cw, ch };
  }

  const aspectHost =
    (img.parentElement as HTMLElement | null) ??
    (img.closest("figure") as HTMLElement | null);
  if (aspectHost) {
    cw = Math.round(aspectHost.clientWidth);
    ch = Math.round(aspectHost.clientHeight);
  }
  if (cw >= 2 && ch >= 2) {
    return { cw, ch };
  }

  const article = img.closest("article");
  if (article) {
    const ar = article.getBoundingClientRect();
    const aw = Math.round(ar.width);
    if (aw >= 2 && img.naturalWidth && img.naturalHeight) {
      const ir = img.naturalWidth / img.naturalHeight;
      cw = aw;
      ch = Math.max(1, Math.round(aw / ir));
      return { cw, ch };
    }
  }

  if (img.naturalWidth && img.naturalHeight) {
    cw = Math.min(img.naturalWidth, 1200);
    ch = Math.round((cw * img.naturalHeight) / img.naturalWidth);
    return { cw: Math.max(1, cw), ch: Math.max(1, ch) };
  }

  return { cw: 320, ch: 400 };
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
    const { cw, ch } = getImgBakeSize(img);
    const cwPx = Math.max(1, Math.round(cw * pixelRatio));
    const chPx = Math.max(1, Math.round(ch * pixelRatio));
    const canvas = document.createElement("canvas");
    canvas.width = cwPx;
    canvas.height = chPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const style = window.getComputedStyle(img);
    const filter = style.filter && style.filter !== "none" ? style.filter : "none";

    const drawWithFilter = (f: string) => {
      ctx.clearRect(0, 0, cwPx, chPx);
      try {
        ctx.filter = f;
      } catch {
        ctx.filter = "none";
      }
      drawImageObjectCover(ctx, img, cwPx, chPx);
    };

    drawWithFilter(filter);
    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    } catch {
      continue;
    }

    /** Some Safari builds paint nothing when ctx.filter mirrors CSS filter; fall back. */
    if (filter !== "none" && canvasLooksUniformlyBlank(ctx, cwPx, chPx)) {
      drawWithFilter("none");
      try {
        dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      } catch {
        continue;
      }
    }

    try {
      img.src = dataUrl;
      img.style.filter = "none";
      img.style.transform = "none";
      if (typeof img.decode === "function") {
        await img.decode();
      } else {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      }
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

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

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
