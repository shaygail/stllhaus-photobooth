import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";
import {
  CUSTOMER_LAYOUT_PRESETS,
  type CustomerLayoutId,
} from "@/lib/customer-layout";

type LayoutSelectScreenProps = {
  selectedId: CustomerLayoutId;
  onSelect: (id: CustomerLayoutId) => void;
  onBack: () => void;
  onContinue: () => void;
};

function LayoutMiniFrame({
  id,
  active,
}: {
  id: CustomerLayoutId;
  active: boolean;
}) {
  const inner =
    id === "classic"
      ? "h-16 w-12"
      : id === "soft-square"
        ? "h-12 w-12"
        : "h-[3.75rem] w-12";

  return (
    <div
      className={`mx-auto flex items-center justify-center rounded-xl bg-[var(--booth-oat)]/90 p-2 ring-1 ring-inset ring-black/[0.06] ${
        active ? "ring-2 ring-[var(--booth-ink)]/35" : ""
      }`}
    >
      <div
        className={`rounded-md bg-[var(--booth-walnut)]/25 ${inner}`}
        aria-hidden
      />
    </div>
  );
}

export function LayoutSelectScreen({
  selectedId,
  onSelect,
  onBack,
  onContinue,
}: LayoutSelectScreenProps) {
  return (
    <BoothShell className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Your keepsake
        </p>
        <h2 className="mt-2 text-2xl font-light text-[var(--booth-ink)]">
          Choose a layout
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--booth-walnut)]/85">
          Pick how your moment sits on the strip — you can always come back
          here before printing.
        </p>
      </header>

      <div className="grid gap-3">
        {CUSTOMER_LAYOUT_PRESETS.map((preset) => {
          const active = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                active
                  ? "border-[var(--booth-ink)]/35 bg-[var(--booth-cream)] shadow-sm"
                  : "border-black/[0.06] bg-white/60 hover:bg-white/90"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <LayoutMiniFrame id={preset.id} active={active} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
                    {active ? "Selected" : "Tap to select"}
                  </p>
                  <p className="text-base font-medium text-[var(--booth-ink)]">
                    {preset.title}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--booth-walnut)]/85">
                    {preset.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <BoothTapButton variant="secondary" onClick={onBack}>
          Back
        </BoothTapButton>
        <BoothTapButton onClick={onContinue}>Preview strip</BoothTapButton>
      </div>
    </BoothShell>
  );
}
