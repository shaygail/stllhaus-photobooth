import type { ReceiptPrintLayoutProps } from "@/components/receipt";
import { formatBoothDate, formatBoothTime } from "@/lib/booth-datetime";
import {
  getCustomerLayoutPreset,
  type CustomerLayoutId,
} from "@/lib/customer-layout";
import type { BoothSettings } from "@/types/booth";

export function boothSettingsToReceiptProps(
  settings: BoothSettings,
  photoDataUrl: string,
  additionalPhotoUrls: readonly string[],
  when: Date,
  customerLayoutId?: CustomerLayoutId,
): ReceiptPrintLayoutProps {
  const preset = getCustomerLayoutPreset(customerLayoutId);
  const headerTitle = "STLL SNAPS";
  const headerTagline = "capture the moment, keep the memory.";
  const showConnect = settings.showConnectBlock;
  const qr =
    showConnect && settings.showQr && settings.qrCodeUrl.trim()
      ? settings.qrCodeUrl.trim()
      : undefined;

  const display = {
    showTagline: settings.showTagline,
    showMetaBlock: settings.showMetaBlock,
    showMessageBlock: settings.showMessageBlock,
    showConnectBlock: settings.showConnectBlock,
    showEndOrnament: settings.showEndOrnament,
    ...preset.displayPatch,
  };

  return {
    brandName: headerTitle,
    tagline: headerTagline,
    photoUrl: photoDataUrl,
    additionalPhotoUrls,
    dateText: formatBoothDate(when),
    timeText: formatBoothTime(when),
    locationText: settings.locationText,
    messageText: settings.messageText,
    eventText: settings.eventLabel.trim() || undefined,
    websiteText: showConnect ? settings.websiteText : undefined,
    instagramText: showConnect ? settings.instagramText : undefined,
    qrCodeUrl: qr,
    paperWidth: settings.paperWidth,
    photoAspect: preset.photoAspect,
    photoLayout: preset.photoLayout,
    layoutVariant: preset.layoutVariant ?? "default",
    display,
    thermal: {
      brightness: settings.thermalBrightness,
      contrast: settings.thermalContrast,
    },
  };
}

export function printerLabelFromSettings(s: BoothSettings) {
  if (s.printerProfile === "xprinter_80") {
    return "Xprinter · 80mm receipt";
  }
  return `Bluetooth portable · ${s.paperWidth}`;
}
