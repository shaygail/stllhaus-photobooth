import type { ReceiptPrintProps } from "@/components/receipt";

/** Calm editorial sample image (still life) */
export const MOCK_PHOTO_URL =
  "https://images.unsplash.com/photo-1514222134-b867cbbd6048?auto=format&fit=crop&w=640&q=80";

export const receiptPreviewBase: ReceiptPrintProps = {
  brandName: "STLL HAUS",
  tagline: "a quiet place, made for slowing down",
  photoUrl: MOCK_PHOTO_URL,
  dateText: "Sunday 12 April 2026",
  timeText: "4:18 in the afternoon",
  locationText: "New Plymouth, NZ",
  messageText: "quiet sips, slow moments",
  eventText: "STLL HAUS Market Moment",
  websiteText: "stllhaus.co",
  instagramText: "@stllhausco",
  qrCodeUrl: "https://stllhaus.co",
  paperWidth: "80mm",
};

export const brandMessageOptions: readonly string[] = [
  "quiet sips, slow moments",
  "your moment to slow down",
  "crafted for the still moment",
  "made for slow moments",
];
