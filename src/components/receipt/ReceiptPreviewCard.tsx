type ReceiptPreviewCardProps = {
  /** e.g. "80mm · with QR" */
  label: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * On-screen “paper” frame around the thermal layout — not part of the printed output.
 */
export function ReceiptPreviewCard({
  label,
  children,
  className = "",
}: ReceiptPreviewCardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/90 bg-[#f7f5f2] p-6 shadow-sm ${className}`}
    >
      <p
        className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500"
      >
        {label}
      </p>
      <div className="mt-5 flex justify-center overflow-x-auto pb-1">
        <div className="origin-top scale-100 rounded-[2px] bg-white shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]">
          {children}
        </div>
      </div>
    </div>
  );
}
