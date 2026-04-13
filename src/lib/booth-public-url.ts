/**
 * Base URL used in QR codes / shared digital links.
 * Browsers resolve relative `/api/...` against the page host — if that host is
 * `localhost`, phones open *their* localhost, so downloads break on the iPad.
 */
export function resolveBoothPublicOrigin(
  settingsPublicSiteUrl: string | undefined,
  windowOrigin: string,
): string {
  const fromSettings = settingsPublicSiteUrl?.trim().replace(/\/$/, "") ?? "";
  if (fromSettings) return fromSettings;

  const fromEnv =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_BOOTH_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return windowOrigin.trim().replace(/\/$/, "");
}
