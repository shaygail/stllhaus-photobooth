import type { PaperWidth } from "./types";

type ReceiptFooterBlockProps = {
  messageText: string;
  paperWidth: PaperWidth;
};

export function ReceiptFooterBlock({
  messageText,
  paperWidth,
}: ReceiptFooterBlockProps) {
  const isNarrow = paperWidth === "58mm";

  return (
    <section className="flex w-full flex-col items-center text-center">
      <p
        className={`max-w-[20em] font-medium leading-relaxed text-black ${
          isNarrow ? "text-[9px]" : "text-[10px]"
        }`}
        style={{ letterSpacing: "0.02em" }}
      >
        {messageText}
      </p>
    </section>
  );
}
