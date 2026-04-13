import type { PaperWidth } from "./types";

type ReceiptLinksOnlyBlockProps = {
  websiteText?: string;
  instagramText?: string;
  paperWidth: PaperWidth;
};

/** Elegant text-only connect line when QR is disabled */
export function ReceiptLinksOnlyBlock({
  websiteText,
  instagramText,
  paperWidth,
}: ReceiptLinksOnlyBlockProps) {
  if (!websiteText && !instagramText) return null;

  const isNarrow = paperWidth === "58mm";
  const captionClass = isNarrow ? "text-[7px]" : "text-[8px]";

  return (
    <section
      className={`flex w-full flex-col items-center gap-1 text-center ${captionClass} leading-relaxed text-black`}
      style={{ letterSpacing: "0.06em" }}
      aria-label="Links"
    >
      {instagramText ? (
        <span className="font-semibold uppercase tracking-[0.14em]">
          {instagramText}
        </span>
      ) : null}
      {websiteText ? (
        <span className="font-medium tracking-[0.1em]">{websiteText}</span>
      ) : null}
    </section>
  );
}
