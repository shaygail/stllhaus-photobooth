import type { PaperWidth } from "@/components/receipt";

export type BoothStep =
  | "welcome"
  | "camera"
  | "preview"
  | "layout"
  | "receipt"
  | "print"
  | "done";

export type CountdownChoice = 3 | 5 | 10;
export type ReceiptPhotoCount = 1 | 2 | 3 | 4;

export type PrinterProfile = "bluetooth_portable" | "xprinter_80";

export type PrinterConnectionUi = "checking" | "ready" | "sleep" | "error";

export interface BoothGalleryItem {
  id: string;
  dataUrl: string;
  createdAt: string;
}

export interface BoothSettings {
  printerProfile: PrinterProfile;
  paperWidth: PaperWidth;
  showTagline: boolean;
  showMetaBlock: boolean;
  showMessageBlock: boolean;
  showConnectBlock: boolean;
  showEndOrnament: boolean;
  showQr: boolean;
  /** Brightness multiplier for thermal preview & strip */
  thermalBrightness: number;
  /** Contrast multiplier for thermal preview & strip */
  thermalContrast: number;
  brandName: string;
  tagline: string;
  locationText: string;
  messageText: string;
  eventLabel: string;
  websiteText: string;
  instagramText: string;
  qrCodeUrl: string;
  /**
   * Base URL for digital keepsake QR (no trailing slash), e.g. https://192.168.1.10:3000
   * When the booth runs on localhost, set this so phones scan your Mac’s LAN URL.
   */
  publicSiteUrl: string;
}

export const BOOTH_SETTINGS_STORAGE_KEY = "stllhaus-booth-settings-v1";

export const DEFAULT_BOOTH_SETTINGS: BoothSettings = {
  printerProfile: "xprinter_80",
  paperWidth: "80mm",
  showTagline: true,
  showMetaBlock: true,
  showMessageBlock: true,
  showConnectBlock: true,
  showEndOrnament: true,
  showQr: true,
  thermalBrightness: 1.03,
  thermalContrast: 1.22,
  brandName: "STLL HAUS",
  tagline: "a quiet place, made for slowing down",
  locationText: "New Plymouth, NZ",
  messageText: "quiet sips, slow moments ☁️",
  eventLabel: "STLL HAUS Market Moment",
  websiteText: "stllhaus.co",
  instagramText: "@stllhausco",
  qrCodeUrl: "https://stllhaus.co",
  publicSiteUrl: "",
};
