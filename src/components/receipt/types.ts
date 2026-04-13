export type PaperWidth = "58mm" | "80mm";

/** Photo window on the thermal strip */
export type ReceiptPhotoAspect = "3/4" | "1/1" | "4/5";

/** Optional visibility for kiosk / staff tuning (defaults: all on). */
export type ReceiptDisplayToggles = {
  showTagline?: boolean;
  showMetaBlock?: boolean;
  showMessageBlock?: boolean;
  showConnectBlock?: boolean;
  showEndOrnament?: boolean;
};

export type ReceiptThermalAdjust = {
  brightness: number;
  contrast: number;
};

export interface ReceiptPrintProps {
  brandName: string;
  /** Small line under the wordmark */
  tagline?: string;
  photoUrl: string;
  /** Future strip layouts: extra frames after the main photo */
  additionalPhotoUrls?: readonly string[];
  dateText: string;
  timeText: string;
  locationText: string;
  /** Short poetic line(s) for the keepsake */
  messageText: string;
  eventText?: string;
  websiteText?: string;
  instagramText?: string;
  /** URL encoded in the QR (e.g. https://instagram.com/stllhausco) */
  qrCodeUrl?: string;
  paperWidth?: PaperWidth;
  /** Defaults to a tall portrait frame */
  photoAspect?: ReceiptPhotoAspect;
  display?: ReceiptDisplayToggles;
  thermal?: ReceiptThermalAdjust;
}

export const DEFAULT_RECEIPT_PROPS: ReceiptPrintProps = {
  brandName: "STLL HAUS",
  photoUrl: "",
  dateText: "",
  timeText: "",
  locationText: "New Plymouth, NZ",
  messageText: "your moment to slow down",
  eventText: "STLL HAUS Market Moment",
  websiteText: "stllhaus.co",
  instagramText: "@stllhausco",
  qrCodeUrl: "https://stllhaus.co",
  paperWidth: "80mm",
};
