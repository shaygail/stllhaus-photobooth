import { getDigitalSlip } from "@/lib/digital-slip-store";
import { bufferFromImageDataUrl } from "@/lib/data-url-to-buffer";
import {
  fetchLayoutJpegFromBlob,
  fetchMomentJpegFromBlob,
  headLayoutBlobMeta,
  isReceiptBlobPersistenceEnabled,
} from "@/lib/receipt-blob-storage";

export type SlipJpegResult = { bytes: Buffer; createdAt: number };

/** Final composed strip — memory first, then Vercel Blob when configured. */
export async function resolveLayoutJpeg(
  token: string,
): Promise<SlipJpegResult | null> {
  const slip = getDigitalSlip(token);
  if (slip?.layoutDataUrl) {
    try {
      const body = bufferFromImageDataUrl(slip.layoutDataUrl);
      return { bytes: body, createdAt: slip.createdAt };
    } catch {
      return null;
    }
  }
  if (isReceiptBlobPersistenceEnabled()) {
    return fetchLayoutJpegFromBlob(token);
  }
  return null;
}

/** Single-photo “moment” JPEG — memory only unless uploaded to Blob. */
export async function resolveMomentJpeg(
  token: string,
): Promise<{ bytes: Buffer } | null> {
  const slip = getDigitalSlip(token);
  if (slip?.imageDataUrl) {
    try {
      const body = bufferFromImageDataUrl(slip.imageDataUrl);
      return { bytes: body };
    } catch {
      return null;
    }
  }
  if (isReceiptBlobPersistenceEnabled()) {
    return fetchMomentJpegFromBlob(token);
  }
  return null;
}

/** Metadata for `/api/digital-slip/:token` JSON. */
/** ISO timestamp for `/api/receipt/:token` JSON (strip exists in memory or Blob). */
export async function resolveReceiptKeepsakeMeta(
  token: string,
): Promise<{ createdAt: string } | null> {
  const slip = getDigitalSlip(token);
  if (slip?.layoutDataUrl) {
    return { createdAt: new Date(slip.createdAt).toISOString() };
  }
  const blob = await headLayoutBlobMeta(token);
  if (!blob) return null;
  return { createdAt: new Date(blob.createdAt).toISOString() };
}

export async function resolveSlipSummary(token: string): Promise<{
  createdAt: number;
  hasLayout: boolean;
} | null> {
  const slip = getDigitalSlip(token);
  if (slip) {
    return {
      createdAt: slip.createdAt,
      hasLayout: Boolean(slip.layoutDataUrl),
    };
  }
  if (isReceiptBlobPersistenceEnabled()) {
    const blobMeta = await headLayoutBlobMeta(token);
    if (blobMeta) {
      return { createdAt: blobMeta.createdAt, hasLayout: true };
    }
  }
  return null;
}
