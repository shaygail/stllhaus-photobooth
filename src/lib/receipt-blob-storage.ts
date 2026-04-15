import { Buffer } from "node:buffer";
import { BlobNotFoundError, get, head, put } from "@vercel/blob";
import { bufferFromImageDataUrl } from "@/lib/data-url-to-buffer";

const SLIP_TOKEN_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isReceiptBlobPersistenceEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function normalizeSlipToken(raw: string): string | null {
  const t = raw.trim();
  return SLIP_TOKEN_RE.test(t) ? t : null;
}

export function layoutBlobPathname(token: string): string | null {
  const id = normalizeSlipToken(token);
  if (!id) return null;
  return `stllhaus-receipt-strips/${id}.jpg`;
}

export function momentBlobPathname(token: string): string | null {
  const id = normalizeSlipToken(token);
  if (!id) return null;
  return `stllhaus-receipt-moments/${id}.jpg`;
}

async function readBlobStream(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Upload final receipt strip JPEG; throws on failure (caller handles). */
export async function persistLayoutJpegFromDataUrl(
  token: string,
  layoutDataUrl: string,
): Promise<void> {
  const pathname = layoutBlobPathname(token);
  if (!pathname) {
    throw new Error("Invalid slip token");
  }
  const buffer = bufferFromImageDataUrl(layoutDataUrl);
  await put(pathname, buffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

export async function persistMomentJpegFromDataUrl(
  token: string,
  imageDataUrl: string,
): Promise<void> {
  const pathname = momentBlobPathname(token);
  if (!pathname) {
    throw new Error("Invalid slip token");
  }
  const buffer = bufferFromImageDataUrl(imageDataUrl);
  await put(pathname, buffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

export async function headLayoutBlobMeta(
  token: string,
): Promise<{ createdAt: number } | null> {
  if (!isReceiptBlobPersistenceEnabled()) return null;
  const pathname = layoutBlobPathname(token);
  if (!pathname) return null;
  try {
    const h = await head(pathname);
    return { createdAt: h.uploadedAt.getTime() };
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function fetchLayoutJpegFromBlob(
  token: string,
): Promise<{ bytes: Buffer; createdAt: number } | null> {
  if (!isReceiptBlobPersistenceEnabled()) return null;
  const pathname = layoutBlobPathname(token);
  if (!pathname) return null;
  try {
    const res = await get(pathname, { access: "public" });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    const raw = await readBlobStream(res.stream);
    return {
      bytes: Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength),
      createdAt: res.blob.uploadedAt.getTime(),
    };
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function fetchMomentJpegFromBlob(
  token: string,
): Promise<{ bytes: Buffer } | null> {
  if (!isReceiptBlobPersistenceEnabled()) return null;
  const pathname = momentBlobPathname(token);
  if (!pathname) return null;
  try {
    const res = await get(pathname, { access: "public" });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    const raw = await readBlobStream(res.stream);
    return {
      bytes: Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength),
    };
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function slipExistsInBlob(token: string): Promise<boolean> {
  const meta = await headLayoutBlobMeta(token);
  return meta !== null;
}
