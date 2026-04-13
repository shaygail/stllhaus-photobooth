import type { PaperWidth } from "./types";

/** Approximate preview width at 96 CSS px per inch */
export const RECEIPT_PREVIEW_PX: Record<PaperWidth, number> = {
  "80mm": Math.round((80 / 25.4) * 96),
  "58mm": Math.round((58 / 25.4) * 96),
};

export const RECEIPT_PRINT_MM: Record<PaperWidth, string> = {
  "80mm": "80mm",
  "58mm": "58mm",
};
