/**
 * In-memory store for short-lived digital slips.
 * Works for a single long-running Node process (e.g. `next start` on one device at a stall).
 * For serverless / multi-instance production, replace with KV + object storage.
 */

export type DigitalSlipRecord = {
  imageDataUrl: string;
  layoutDataUrl?: string;
  email?: string;
  createdAt: number;
};

const slips = new Map<string, DigitalSlipRecord>();

const MAX_SLIPS = 120;
const TTL_MS = 24 * 60 * 60 * 1000;
/** Rough cap on base64 payload length (~1.9MB binary JPEG upper bound). */
const MAX_DATA_URL_CHARS = 3_200_000;

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

export function createDigitalSlip(
  imageDataUrl: string,
  layoutDataUrl?: string,
): string {
  prune();
  if (
    typeof imageDataUrl !== "string" ||
    !imageDataUrl.startsWith("data:image/")
  ) {
    throw new Error("Invalid image payload");
  }
  if (imageDataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("Image too large");
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
  slips.set(token, { imageDataUrl, layoutDataUrl, createdAt: Date.now() });
  prune();
  return token;
}

export function attachEmailToSlip(token: string, email: string): boolean {
  const row = slips.get(token);
  if (!row) return false;
  if (Date.now() - row.createdAt > TTL_MS) {
    slips.delete(token);
    return false;
  }
  row.email = email;
  slips.set(token, row);
  return true;
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
