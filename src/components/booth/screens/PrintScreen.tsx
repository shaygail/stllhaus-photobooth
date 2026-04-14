import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";
import type { PrinterConnectionUi } from "@/types/booth";

type PrintScreenProps = {
  copies: 1 | 2;
  onCopiesChange: (n: 1 | 2) => void;
  printerLabel: string;
  connection: PrinterConnectionUi;
  isPrinting: boolean;
  printPhase: "idle" | "sending" | "done";
  onPrint: () => void;
  onQrOnly: () => void;
  onBack: () => void;
};

function statusCopy(connection: PrinterConnectionUi, isPrinting: boolean) {
  if (isPrinting) return "Printing your strip…";
  if (connection === "checking") return "Looking for the printer…";
  if (connection === "ready") return "Printer ready";
  if (connection === "sleep") return "Printer resting — tap print to wake";
  return "Printer not detected — demo mode";
}

export function PrintScreen({
  copies,
  onCopiesChange,
  printerLabel,
  connection,
  isPrinting,
  printPhase,
  onPrint,
  onQrOnly,
  onBack,
}: PrintScreenProps) {
  return (
    <BoothShell className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Print
        </p>
        <h2 className="mt-2 text-2xl font-light text-[var(--booth-ink)]">
          Ready when you are
        </h2>
      </header>

      <div className="rounded-3xl bg-[var(--booth-cream)]/85 p-5 text-center shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
          Printer
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--booth-ink)]">
          {printerLabel}
        </p>
        <p className="mt-3 text-sm text-[var(--booth-walnut)]/85">
          {statusCopy(connection, isPrinting)}
        </p>
        {printPhase === "done" ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Sent ✓
          </p>
        ) : null}
      </div>

      <section className="space-y-3">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--booth-walnut)]/60">
          Copies
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              type="button"
              disabled={isPrinting}
              onClick={() => onCopiesChange(n)}
              className={`rounded-2xl py-3 text-sm font-semibold transition ${
                copies === n
                  ? "bg-[var(--booth-ink)] text-[var(--booth-cream)]"
                  : "bg-[var(--booth-cream)]/70 text-[var(--booth-ink)] ring-1 ring-[var(--booth-walnut)]/15"
              }`}
            >
              {n} {n === 1 ? "copy" : "copies"}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-auto space-y-3">
        <BoothTapButton
          onClick={onPrint}
          disabled={isPrinting}
          className="min-h-[56px]"
        >
          {isPrinting ? "Printing…" : "Print my strip"}
        </BoothTapButton>
        <BoothTapButton
          variant="secondary"
          onClick={onQrOnly}
          disabled={isPrinting}
          className="min-h-[52px]"
        >
          QR test only (no printer)
        </BoothTapButton>
        <BoothTapButton variant="ghost" onClick={onBack} disabled={isPrinting}>
          Back to preview
        </BoothTapButton>
      </div>
    </BoothShell>
  );
}
