import type { Buffer } from "node:buffer";

/** Satisfies `BodyInit` for `NextResponse` where `Buffer` is not accepted by types. */
export function bufferAsResponseBody(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
