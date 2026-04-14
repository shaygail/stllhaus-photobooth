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
  layoutVariant = "default",
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
        className={`flex flex-col items-stretch ${paperWidth === "58mm" ? "gap-2.5 px-3 pb-10 pt-5" : "gap-3 px-4 pb-12 pt-6"}`}
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

        {d.showMetaBlock &&
        d.showConnectBlock &&
        qrCodeUrl &&
        layoutVariant === "default" ? (
          <section className="flex w-full items-end justify-between gap-3 border-y border-black py-3">
            <div className="flex justify-start">
              <ReceiptQRCodeBlock
                qrCodeUrl={qrCodeUrl}
                paperWidth={paperWidth}
                sizeOverride={34}
                hideCaption
              />
            </div>
            <div className="text-right">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black">
                {dateText}
              </p>
              <p className="text-[8px] tracking-[0.08em] text-black">{timeText}</p>
              <p className="text-[8px] tracking-[0.08em] text-black">{locationText}</p>
              {eventText ? (
                <p className="pt-1 text-[7px] font-medium uppercase tracking-[0.12em] text-black/85">
                  {eventText}
                </p>
              ) : null}
            </div>
          </section>
        ) : d.showMetaBlock && layoutVariant === "default" ? (
          <ReceiptMetaBlock
            dateText={dateText}
            timeText={timeText}
            locationText={locationText}
            eventText={eventText}
            paperWidth={paperWidth}
          />
        ) : null}

        {d.showMessageBlock && layoutVariant === "default" ? (
          <ReceiptFooterBlock
            messageText={messageText}
            paperWidth={paperWidth}
          />
        ) : null}

        {d.showConnectBlock &&
        layoutVariant === "default" &&
        instagramText ? (
          <section className="flex w-full flex-col items-center gap-0.5 text-center">
            <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-black">
              {instagramText}
            </p>
          </section>
        ) : null}

        {d.showConnectBlock &&
        layoutVariant === "default" &&
        !(d.showMetaBlock && qrCodeUrl) ? (
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

        {layoutVariant === "bottom-brand" ? (
          <section className="flex w-full flex-col gap-2 border-t border-black pt-3">
            <div className="flex w-full items-end gap-2">
              <div className="flex flex-1 justify-start">
                {qrCodeUrl ? (
                  <ReceiptQRCodeBlock
                    qrCodeUrl={qrCodeUrl}
                    paperWidth={paperWidth}
                    sizeOverride={34}
                    hideCaption
                  />
                ) : (
                  <div className="h-[42px] w-[42px]" aria-hidden />
                )}
              </div>

              <div className="flex flex-1 justify-center pb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-black.png"
                  alt={brandName}
                  className="h-auto w-[52px] object-contain"
                  draggable={false}
                />
              </div>

              <div className="min-w-0 flex-1 text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black">
                  {dateText}
                </p>
                <p className="text-[7px] tracking-[0.08em] text-black/80">{timeText}</p>
                <p className="text-[7px] tracking-[0.08em] text-black/80">{locationText}</p>
              </div>
            </div>
          </section>
        ) : null}

        {d.showEndOrnament && layoutVariant === "default" ? (
          <footer className="flex flex-col items-center gap-3 pt-1">
            <div
              className="h-px w-12 bg-black"
              aria-hidden
              role="presentation"
            />
          </footer>
        ) : null}
      </div>
    </article>
  );
}
