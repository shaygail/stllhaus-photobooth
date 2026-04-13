import { Buffer } from "node:buffer";

/**
 * Decode a base64 `data:image/...;base64,...` URL into bytes (Node).
 * Accepts optional parameters before `base64` (e.g. `charset=utf-8`) and strips
 * whitespace from the payload — strict `mime;base64`-only regex rejects common variants.
 */
export function bufferFromImageDataUrl(dataUrl: string): Buffer {
  const trimmed = dataUrl.trim();
  if (!trimmed.toLowerCase().startsWith("data:image/")) {
    throw new Error("Invalid or non-base64 image data URL");
  }
  const m = /;base64,/i.exec(trimmed);
  if (m) {
    const b64 = trimmed.slice(m.index + m[0].length).replace(/\s/g, "");
    if (!b64) {
      throw new Error("Invalid or non-base64 image data URL");
    }
    return Buffer.from(b64, "base64");
  }
  const comma = trimmed.indexOf(",");
  if (comma === -1) {
    throw new Error("Invalid or non-base64 image data URL");
  }
  const payload = trimmed.slice(comma + 1).replace(/\s/g, "");
  if (!payload) {
    throw new Error("Invalid or non-base64 image data URL");
  }
  const buf = Buffer.from(payload, "base64");
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return buf;
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return buf;
  }
  throw new Error("Invalid or non-base64 image data URL");
}
