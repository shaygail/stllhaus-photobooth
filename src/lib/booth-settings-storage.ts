import {
  BOOTH_SETTINGS_STORAGE_KEY,
  DEFAULT_BOOTH_SETTINGS,
  type BoothSettings,
} from "@/types/booth";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function sanitizeMessageText(v: string): string {
  return v.replace(/\s*☁️/g, "").trim();
}

export function loadBoothSettings(): BoothSettings {
  if (typeof window === "undefined") return DEFAULT_BOOTH_SETTINGS;
  try {
    const raw = window.localStorage.getItem(BOOTH_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_BOOTH_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return DEFAULT_BOOTH_SETTINGS;
    const merged = { ...DEFAULT_BOOTH_SETTINGS, ...parsed } as BoothSettings;
    return {
      ...merged,
      messageText: sanitizeMessageText(merged.messageText),
    };
  } catch {
    return DEFAULT_BOOTH_SETTINGS;
  }
}

export function saveBoothSettings(settings: BoothSettings) {
  if (typeof window === "undefined") return;
  const safe: BoothSettings = {
    ...settings,
    messageText: sanitizeMessageText(settings.messageText),
    thermalBrightness: clamp(settings.thermalBrightness, 0.85, 1.18),
    thermalContrast: clamp(settings.thermalContrast, 1.02, 1.48),
  };
  window.localStorage.setItem(
    BOOTH_SETTINGS_STORAGE_KEY,
    JSON.stringify(safe),
  );
}
