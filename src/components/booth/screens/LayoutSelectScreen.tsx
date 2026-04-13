import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";
import {
  CUSTOMER_LAYOUT_PRESETS,
  type CustomerLayoutId,
} from "@/lib/customer-layout";
import type { ReceiptPhotoCount } from "@/types/booth";

type LayoutSelectScreenProps = {
  selectedId: CustomerLayoutId;
  onSelect: (id: CustomerLayoutId) => void;
  photoCount: ReceiptPhotoCount;
  onPhotoCountChange: (count: ReceiptPhotoCount) => void;
  availablePhotoCounts: readonly ReceiptPhotoCount[];
  paperWidthLabel: "58mm" | "80mm";
  miniGridEnabled: boolean;
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
  if (id === "mini-grid") {
    return (
      <div
        className={`mx-auto rounded-xl bg-[var(--booth-oat)]/90 p-2 ring-1 ring-inset ring-black/[0.06] ${
          active ? "ring-2 ring-[var(--booth-ink)]/35" : ""
        }`}
      >
        <div className="grid h-16 w-16 grid-cols-2 gap-1">
          <div className="rounded-sm bg-[var(--booth-walnut)]/25" />
          <div className="rounded-sm bg-[var(--booth-walnut)]/30" />
          <div className="rounded-sm bg-[var(--booth-walnut)]/30" />
          <div className="rounded-sm bg-[var(--booth-walnut)]/25" />
        </div>
      </div>
    );
  }
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

function StripCountPreview({
  layoutId,
  photoCount,
}: {
  layoutId: CustomerLayoutId;
  photoCount: ReceiptPhotoCount;
}) {
  if (layoutId === "mini-grid") {
    return (
      <div className="mx-auto w-full max-w-[13rem] rounded-2xl bg-[var(--booth-cream)]/95 p-3 ring-1 ring-black/10 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-lg bg-[var(--booth-walnut)]/20"
              aria-hidden
            />
          ))}
        </div>
        <div className="mt-3 border-t border-black/10 pt-2 text-center text-[10px] uppercase tracking-[0.15em] text-[var(--booth-walnut)]/70">
          mini grid preview
        </div>
      </div>
    );
  }

  const frameClass =
    layoutId === "classic"
      ? "aspect-[3/4]"
      : layoutId === "soft-square"
        ? "aspect-square"
        : "aspect-[4/5]";

  const frames = photoCount === 3 ? [0, 1, 2] : photoCount === 2 ? [0, 1] : [0];

  return (
    <div className="mx-auto w-full max-w-[13rem] rounded-2xl bg-[var(--booth-cream)]/95 p-3 ring-1 ring-black/10 shadow-sm">
      <div className="space-y-2">
        {frames.map((i) => (
          <div
            key={i}
            className={`w-full rounded-lg bg-[var(--booth-walnut)]/20 ${frameClass}`}
            aria-hidden
          />
        ))}
      </div>
      <div className="mt-3 border-t border-black/10 pt-2 text-center text-[10px] uppercase tracking-[0.15em] text-[var(--booth-walnut)]/70">
        {photoCount} photo strip preview
      </div>
    </div>
  );
}

export function LayoutSelectScreen({
  selectedId,
  onSelect,
  photoCount,
  onPhotoCountChange,
  availablePhotoCounts,
  paperWidthLabel,
  miniGridEnabled,
  onBack,
  onContinue,
}: LayoutSelectScreenProps) {
  return (
    <BoothShell className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Before your photo
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
          const disabled = preset.id === "mini-grid" && !miniGridEnabled;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                if (!disabled) onSelect(preset.id);
              }}
              disabled={disabled}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                active
                  ? "border-[var(--booth-ink)]/35 bg-[var(--booth-cream)] shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-black/[0.05] bg-black/[0.03] opacity-60"
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
                  {disabled ? (
                    <p className="text-[11px] text-[var(--booth-walnut)]/70">
                      Available on 80mm only
                    </p>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <section className="space-y-2">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/60">
          Strip preview
        </p>
        <StripCountPreview layoutId={selectedId} photoCount={photoCount} />
      </section>

      <section className="space-y-2">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/60">
          Photos on one receipt ({paperWidthLabel})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as const).map((count) => {
            const available = availablePhotoCounts.includes(count);
            const selected = photoCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => {
                  if (available) onPhotoCountChange(count);
                }}
                disabled={!available}
                className={`rounded-2xl border px-2 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-[var(--booth-ink)]/35 bg-[var(--booth-cream)]"
                    : available
                      ? "border-black/[0.08] bg-white/60 hover:bg-white/90"
                      : "cursor-not-allowed border-black/[0.06] bg-black/[0.04] text-[var(--booth-walnut)]/45"
                }`}
              >
                {count}
              </button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-[var(--booth-walnut)]/75">
          Stacked layouts support 2 or 3 photos. Mini Grid is fixed to 4 photos on 80mm.
        </p>
      </section>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <BoothTapButton variant="secondary" onClick={onBack}>
          Back
        </BoothTapButton>
        <BoothTapButton onClick={onContinue}>Open camera</BoothTapButton>
      </div>
    </BoothShell>
  );
}
