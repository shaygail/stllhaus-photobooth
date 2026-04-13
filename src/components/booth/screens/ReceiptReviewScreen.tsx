import {
  ReceiptPrintLayout,
  type ReceiptPrintLayoutProps,
} from "@/components/receipt";
import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";

type ReceiptReviewScreenProps = {
  receiptProps: ReceiptPrintLayoutProps;
  onBack: () => void;
  onContinue: () => void;
};

export function ReceiptReviewScreen({
  receiptProps,
  onBack,
  onContinue,
}: ReceiptReviewScreenProps) {
  return (
    <BoothShell className="flex flex-col gap-5">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Receipt preview
        </p>
        <h2 className="mt-2 text-2xl font-light text-[var(--booth-ink)]">
          Your thermal moment
        </h2>
        <p className="mt-2 text-sm text-[var(--booth-walnut)]/85">
          Black &amp; white, high contrast, a little grain — just like the real
          strip.
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center overflow-y-auto rounded-3xl bg-[#e8e4dd] p-4 ring-1 ring-black/5">
        <div className="origin-top scale-[0.88] pb-6 sm:scale-95">
          <ReceiptPrintLayout {...receiptProps} id="booth-receipt-live" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BoothTapButton variant="secondary" onClick={onBack}>
          Back
        </BoothTapButton>
        <BoothTapButton onClick={onContinue}>Looks good</BoothTapButton>
      </div>
    </BoothShell>
  );
}
