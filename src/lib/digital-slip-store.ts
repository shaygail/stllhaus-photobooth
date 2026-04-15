/**
 * In-memory store for short-lived digital slips (local / single Node process).
 * When `BLOB_READ_WRITE_TOKEN` is set, final strips (and optional moment photos)
 * are also written to Vercel Blob so `/receipt/:token` works across serverless instances.
 */

import {
  persistLayoutJpegFromDataUrl,
  persistMomentJpegFromDataUrl,
  isReceiptBlobPersistenceEnabled,
  slipExistsInBlob,
} from "@/lib/receipt-blob-storage";

export type DigitalSlipRecord = {
  imageDataUrl?: string;
  layoutDataUrl?: string;
  email?: string;
  createdAt: number;
};

const slips = new Map<string, DigitalSlipRecord>();

const MAX_SLIPS = 120;
const TTL_MS = 24 * 60 * 60 * 1000;
/** Allow higher-resolution flattened strips from mobile capture/export pipelines. */
const MAX_DATA_URL_CHARS = 16_000_000;

function prune() {
  const now = Date.now();
  for (const [id, row] of slips) {
    if (now - row.createdAt > TTL_MS) slips.delete(id);
  }
  while (slips.size > MAX_SLIPS) {
    let oldest: { id: string; t: number } | null = null;
    for (const [id, row] of slips) {
      if (!oldest || row.createdAt < oldest.t) oldest = { id, t: row.createdAt };
    }
    if (oldest) slips.delete(oldest.id);
    else break;
  }
}

export async function createDigitalSlip(
  imageDataUrl?: string,
  layoutDataUrl?: string,
): Promise<string> {
  if (imageDataUrl) {
    if (
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.startsWith("data:image/")
    ) {
      throw new Error("Invalid image payload");
    }
    if (imageDataUrl.length > MAX_DATA_URL_CHARS) {
      throw new Error("Image too large");
    }
  }
  if (!layoutDataUrl) {
    throw new Error("Missing final receipt asset");
  }
  if (
    typeof layoutDataUrl !== "string" ||
    !layoutDataUrl.startsWith("data:image/")
  ) {
    throw new Error("Invalid layout payload");
  }
  if (layoutDataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("Layout image too large");
  }
  const token = crypto.randomUUID();

  if (isReceiptBlobPersistenceEnabled()) {
    await persistLayoutJpegFromDataUrl(token, layoutDataUrl);
    if (imageDataUrl) {
      await persistMomentJpegFromDataUrl(token, imageDataUrl);
    }
    return token;
  }

  prune();
  slips.set(token, {
    imageDataUrl,
    layoutDataUrl,
    createdAt: Date.now(),
  });
  prune();
  return token;
}

export async function attachEmailToSlip(
  token: string,
  email: string,
): Promise<boolean> {
  const row = slips.get(token);
  if (row) {
    if (Date.now() - row.createdAt > TTL_MS) {
      slips.delete(token);
      return false;
    }
    row.email = email;
    slips.set(token, row);
    return true;
  }
  if (await slipExistsInBlob(token)) {
    console.info("[digital-slip] email requested (persisted slip)", {
      token,
      email,
    });
    return true;
  }
  return false;
}

export function getDigitalSlip(token: string): DigitalSlipRecord | null {
  prune();
  const row = slips.get(token);
  if (!row) return null;
  if (Date.now() - row.createdAt > TTL_MS) {
    slips.delete(token);
    return null;
  }
  return row;
}
