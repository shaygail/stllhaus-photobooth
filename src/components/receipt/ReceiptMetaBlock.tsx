import type { PaperWidth } from "./types";

type ReceiptMetaBlockProps = {
  dateText: string;
  timeText: string;
  locationText: string;
  eventText?: string;
  paperWidth: PaperWidth;
};

export function ReceiptMetaBlock({
  dateText,
  timeText,
  locationText,
  eventText,
  paperWidth,
}: ReceiptMetaBlockProps) {
  const isNarrow = paperWidth === "58mm";
  const labelClass = isNarrow ? "text-[7px]" : "text-[8px]";
  const detailClass = isNarrow ? "text-[8px]" : "text-[9px]";

  return (
    <section
      className="flex w-full flex-col items-center gap-2 text-center"
      aria-label="Moment details"
    >
      <div
        className={`w-full space-y-1.5 border-y border-black py-3 ${labelClass} leading-relaxed`}
        style={{ letterSpacing: "0.06em" }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold uppercase tracking-[0.18em] text-black">
            {dateText}
          </span>
          <span className="text-black">{timeText}</span>
        </div>
        <p className={`${detailClass} text-black`}>{locationText}</p>
        {eventText ? (
          <p
            className={`${detailClass} pt-1 font-medium uppercase tracking-[0.14em] text-black`}
          >
            {eventText}
          </p>
        ) : null}
      </div>
    </section>
  );
}
