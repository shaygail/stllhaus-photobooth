import { createHmac, timingSafeEqual } from "node:crypto";

export const BOOTH_SESSION_COOKIE = "booth_session";

const SESSION_VERSION = 1;
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Signing key: prefer BOOTH_SESSION_SECRET; else derive from BOOTH_PASSWORD so one env var works.
 */
function sessionSecret(): string {
  const explicit = process.env.BOOTH_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const pw = process.env.BOOTH_PASSWORD?.trim();
  if (!pw) {
    throw new Error("Set BOOTH_PASSWORD (or BOOTH_SESSION_SECRET for cookie signing only)");
  }
  return createHmac("sha256", pw)
    .update("stllhaus-booth-session-v1")
    .digest("hex");
}

/** Login requires BOOTH_PASSWORD; optional BOOTH_SESSION_SECRET overrides how cookies are signed */
export function isBoothPasswordConfigured(): boolean {
  return Boolean(process.env.BOOTH_PASSWORD?.trim());
}

export function verifyBoothPassword(plain: string): boolean {
  const expected = process.env.BOOTH_PASSWORD?.trim();
  if (!expected || plain === undefined || plain === null) return false;
  try {
    const a = Buffer.from(plain, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createBoothSessionToken(maxAgeMs = DEFAULT_MAX_AGE_MS): string {
  const exp = Date.now() + maxAgeMs;
  const payload = JSON.stringify({ exp, v: SESSION_VERSION });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", sessionSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyBoothSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, sig] = parts;
    const expectedSig = createHmac("sha256", sessionSecret())
      .update(payloadB64)
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return false;
    }
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { exp: number; v: number };
    if (payload.v !== SESSION_VERSION) return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
