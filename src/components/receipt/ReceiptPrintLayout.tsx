import { RECEIPT_PRINT_MM } from "./constants";
import { ReceiptBrandBlock } from "./ReceiptBrandBlock";
import { ReceiptFooterBlock } from "./ReceiptFooterBlock";
import { ReceiptMetaBlock } from "./ReceiptMetaBlock";
import { ReceiptPhotoBlock } from "./ReceiptPhotoBlock";
import { ReceiptLinksOnlyBlock } from "./ReceiptLinksOnlyBlock";
import { ReceiptQRCodeBlock } from "./ReceiptQRCodeBlock";
import type { ReceiptDisplayToggles, ReceiptPrintProps } from "./types";
import { DEFAULT_RECEIPT_PROPS } from "./types";

const DISPLAY_DEFAULT: Required<ReceiptDisplayToggles> = {
  showTagline: true,
  showMetaBlock: true,
  showMessageBlock: true,
  showConnectBlock: true,
  showEndOrnament: true,
};

function resolveDisplay(
  display?: ReceiptDisplayToggles,
): Required<ReceiptDisplayToggles> {
  return {
    showTagline: display?.showTagline ?? DISPLAY_DEFAULT.showTagline,
    showMetaBlock: display?.showMetaBlock ?? DISPLAY_DEFAULT.showMetaBlock,
    showMessageBlock:
      display?.showMessageBlock ?? DISPLAY_DEFAULT.showMessageBlock,
    showConnectBlock:
      display?.showConnectBlock ?? DISPLAY_DEFAULT.showConnectBlock,
    showEndOrnament:
      display?.showEndOrnament ?? DISPLAY_DEFAULT.showEndOrnament,
  };
}

export type ReceiptPrintLayoutProps = ReceiptPrintProps & {
  /** Root id for print CSS / window.print targeting */
  id?: string;
  className?: string;
};

export function ReceiptPrintLayout({
  id = "receipt-print-root",
  className = "",
  brandName = DEFAULT_RECEIPT_PROPS.brandName,
  tagline,
  photoUrl,
  additionalPhotoUrls,
  dateText,
  timeText,
  locationText,
  messageText,
  eventText,
  websiteText,
  instagramText,
  qrCodeUrl,
  paperWidth = "80mm",
  photoAspect,
  photoLayout,
  display,
  thermal,
}: ReceiptPrintLayoutProps) {
  const d = resolveDisplay(display);

  const widthMm = RECEIPT_PRINT_MM[paperWidth];

  return (
    <article
      id={id}
      data-paper={paperWidth}
      className={`receipt-thermal receipt-print-root box-border flex flex-col bg-white text-black print:break-inside-avoid ${className}`}
      style={{
        width: widthMm,
        maxWidth: widthMm,
        minWidth: widthMm,
      }}
    >
      <div
        className={`flex flex-col items-stretch ${paperWidth === "58mm" ? "gap-4 px-3 pb-10 pt-6" : "gap-5 px-4 pb-12 pt-7"}`}
      >
        <ReceiptBrandBlock
          brandName={brandName}
          tagline={d.showTagline ? tagline : undefined}
          paperWidth={paperWidth}
        />

        {photoUrl ? (
          <ReceiptPhotoBlock
            photoUrl={photoUrl}
            additionalPhotoUrls={additionalPhotoUrls}
            paperWidth={paperWidth}
            photoAspect={photoAspect}
            photoLayout={photoLayout}
            thermal={thermal}
          />
        ) : null}

        {d.showMetaBlock ? (
          <ReceiptMetaBlock
            dateText={dateText}
            timeText={timeText}
            locationText={locationText}
            eventText={eventText}
            paperWidth={paperWidth}
          />
        ) : null}

        {d.showMessageBlock ? (
          <ReceiptFooterBlock
            messageText={messageText}
            paperWidth={paperWidth}
          />
        ) : null}

        {d.showConnectBlock ? (
          qrCodeUrl ? (
            <ReceiptQRCodeBlock
              qrCodeUrl={qrCodeUrl}
              websiteText={websiteText}
              instagramText={instagramText}
              paperWidth={paperWidth}
            />
          ) : (
            <ReceiptLinksOnlyBlock
              websiteText={websiteText}
              instagramText={instagramText}
              paperWidth={paperWidth}
            />
          )
        ) : null}

        {d.showEndOrnament ? (
          <footer className="flex flex-col items-center gap-3 pt-1">
            <div
              className="h-px w-12 bg-black"
              aria-hidden
              role="presentation"
            />
            <div
              className="h-6 w-20 opacity-80"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #000000 1px, transparent 1px)",
                backgroundSize: "5px 5px",
              }}
              aria-hidden
            />
          </footer>
        ) : null}
      </div>
    </article>
  );
}
