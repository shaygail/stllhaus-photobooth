import type { PaperWidth } from "./types";

type ReceiptBrandBlockProps = {
  brandName: string;
  tagline?: string;
  paperWidth: PaperWidth;
};

export function ReceiptBrandBlock({
  brandName,
  tagline,
  paperWidth,
}: ReceiptBrandBlockProps) {
  const isNarrow = paperWidth === "58mm";

  return (
    <header className="flex flex-col items-center text-center">
      <h1
        className={`font-semibold uppercase tracking-[0.22em] text-black ${
          isNarrow ? "text-[11px] leading-tight" : "text-[12px] leading-tight"
        }`}
      >
        {brandName}
      </h1>
      {tagline ? (
        <p
          className={`mt-1 max-w-[18em] text-black/90 ${
            isNarrow ? "text-[7px] leading-relaxed" : "text-[8px] leading-relaxed"
          }`}
          style={{ letterSpacing: "0.04em" }}
        >
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
