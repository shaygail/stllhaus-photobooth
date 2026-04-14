"use client";

import QRCode from "react-qr-code";
import type { PaperWidth } from "./types";

type ReceiptQRCodeBlockProps = {
  qrCodeUrl: string;
  websiteText?: string;
  instagramText?: string;
  paperWidth: PaperWidth;
  sizeOverride?: number;
  hideCaption?: boolean;
};

export function ReceiptQRCodeBlock({
  qrCodeUrl,
  websiteText,
  instagramText,
  paperWidth,
  sizeOverride,
  hideCaption = false,
}: ReceiptQRCodeBlockProps) {
  const isNarrow = paperWidth === "58mm";
  const size = sizeOverride ?? (isNarrow ? 72 : 88);
  const captionClass = isNarrow ? "text-[7px]" : "text-[8px]";

  return (
    <section
      className="flex w-full flex-col items-center gap-2 text-center"
      aria-label="Connect"
    >
      <div className="rounded-sm border border-black bg-white p-1.5">
        <QRCode
          value={qrCodeUrl}
          size={size}
          level="H"
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>
      {!hideCaption ? (
        <div
          className={`flex flex-col gap-0.5 ${captionClass} leading-relaxed text-black`}
          style={{ letterSpacing: "0.05em" }}
        >
          {instagramText ? (
            <span className="font-medium uppercase tracking-[0.12em]">
              {instagramText}
            </span>
          ) : null}
          {websiteText ? (
            <span className="font-medium tracking-[0.08em]">{websiteText}</span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
