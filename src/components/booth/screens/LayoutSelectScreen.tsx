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

function MockPhotoFill({ tone = "base" }: { tone?: "base" | "soft" | "deep" }) {
  const bg =
    tone === "deep"
      ? "linear-gradient(160deg, rgba(50,46,40,0.5) 0%, rgba(109,96,84,0.26) 55%, rgba(230,223,214,0.7) 100%)"
      : tone === "soft"
        ? "linear-gradient(160deg, rgba(66,60,52,0.36) 0%, rgba(147,130,114,0.2) 55%, rgba(238,232,224,0.72) 100%)"
        : "linear-gradient(160deg, rgba(44,38,32,0.44) 0%, rgba(120,105,90,0.24) 55%, rgba(234,227,218,0.72) 100%)";
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2px] border border-black/25"
      style={{ background: bg }}
      aria-hidden
    >
      <div className="absolute left-[20%] top-[14%] h-[22%] w-[24%] rounded-full bg-white/28" />
      <div className="absolute left-[10%] top-[33%] h-[58%] w-[74%] rounded-[40%] bg-black/14 blur-[0.5px]" />
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-black/18" />
    </div>
  );
}

function LayoutMiniFrame({
  id,
  active,
}: {
  id: CustomerLayoutId;
  active: boolean;
}) {
  const shellClass = `mx-auto w-full rounded-xl bg-[var(--booth-oat)]/90 p-2 ring-1 ring-inset ring-black/[0.06] ${
    active ? "ring-2 ring-[var(--booth-ink)]/35 shadow-sm" : ""
  }`;

  if (id === "classic") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full rounded-[2px] border border-black/25 p-1">
            <div className="space-y-[2px] pb-1 text-center">
              <div className="text-[6px] font-semibold uppercase tracking-[0.14em] text-black/90">
                STLL SNAPS
              </div>
              <div className="text-[5px] tracking-[0.04em] text-black/60">
                capture the moment, keep the memory.
              </div>
            </div>
            <div className="h-[72%] w-full">
              <MockPhotoFill tone="base" />
            </div>
            <div className="mt-1 h-px w-full bg-black/35" />
            <div className="mt-1 space-y-[2px]">
              <div className="h-[2px] w-[72%] bg-black/50" />
              <div className="h-[2px] w-[55%] bg-black/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "soft-square") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full overflow-hidden rounded-[2px] border border-black/25 p-1">
            <div className="h-[42%] w-full">
              <MockPhotoFill tone="base" />
            </div>
            <div className="mt-1 h-[42%] w-full">
              <MockPhotoFill tone="soft" />
            </div>
            <div className="mt-1 h-[2px] w-[58%] bg-black/38" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "quiet") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full overflow-hidden rounded-[2px] border border-black/25 p-1">
            <div className="h-[44%] w-full">
              <MockPhotoFill tone="deep" />
            </div>
            <div className="mt-1 h-[44%] w-full">
              <MockPhotoFill tone="soft" />
            </div>
            <div className="mt-1 h-[2px] w-[38%] bg-black/30" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "mini-grid") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full rounded-[2px] border border-black/25 p-1">
            <div className="grid h-[74%] w-full grid-cols-2 gap-1">
              <MockPhotoFill tone="base" />
              <MockPhotoFill tone="soft" />
              <MockPhotoFill tone="deep" />
              <MockPhotoFill tone="base" />
            </div>
            <div className="mt-1 h-px w-full bg-black/35" />
            <div className="mt-1 h-[2px] w-[56%] bg-black/40" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "six-grid") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full rounded-[2px] border border-black/25 p-1">
            <div className="grid h-[74%] w-full grid-cols-2 gap-1">
              <MockPhotoFill tone="base" />
              <MockPhotoFill tone="soft" />
              <MockPhotoFill tone="deep" />
              <MockPhotoFill tone="base" />
              <MockPhotoFill tone="soft" />
              <MockPhotoFill tone="deep" />
            </div>
            <div className="mt-1 h-px w-full bg-black/35" />
            <div className="mt-1 h-[2px] w-[56%] bg-black/40" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "bottom-brand") {
    return (
      <div className={shellClass}>
        <div className="aspect-[3/4] w-full rounded-md border border-black/35 bg-white p-1.5">
          <div className="h-full w-full rounded-[2px] border border-black/25 p-1">
            <div className="h-[68%] w-full">
              <MockPhotoFill tone="base" />
            </div>
            <div className="mt-1 h-px w-full bg-black/35" />
            <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-end gap-1">
              <div className="space-y-[2px]">
                <div className="h-[2px] w-[75%] bg-black/50" />
                <div className="h-[2px] w-[62%] bg-black/40" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-black.png"
                alt=""
                className="h-auto w-4 object-contain opacity-90"
                draggable={false}
                aria-hidden
              />
              <div className="ml-auto h-4 w-4 rounded-[2px] border border-black/45 bg-white/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
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
  const layoutDetailText =
    selectedId === "classic"
      ? "Classic strip uses 1 photo."
      : selectedId === "bottom-brand"
        ? "Bottom logo uses 1 photo with date-left and small QR-right footer."
      : selectedId === "mini-grid"
        ? "Mini Grid is fixed to 4 photos on 80mm."
      : selectedId === "six-grid"
        ? "Six Grid is fixed to 6 photos on 80mm."
        : "Soft Square and Quiet support 2 photos on 58mm, or 2-3 photos on 80mm.";

  return (
    <BoothShell className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Before your photo
        </p>
        <h2 className="mt-2 text-2xl font-light text-[var(--booth-ink)]">
          Choose photo layout
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--booth-walnut)]/85">
          Tap the style you want on your print strip.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CUSTOMER_LAYOUT_PRESETS.map((preset) => {
          const active = preset.id === selectedId;
          const disabled =
            (preset.id === "mini-grid" || preset.id === "six-grid") &&
            !miniGridEnabled;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                if (!disabled) onSelect(preset.id);
              }}
              disabled={disabled}
              className={`h-full rounded-3xl border px-3 py-3 text-center transition ${
                active
                  ? "border-[var(--booth-ink)]/35 bg-[var(--booth-cream)] shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-black/[0.05] bg-black/[0.03] opacity-60"
                    : "border-black/[0.06] bg-white/60 hover:bg-white/90"
              }`}
            >
              <div className="flex h-full flex-col gap-2">
                <div className="mx-auto w-full max-w-[6.5rem] md:max-w-[7rem]">
                  <LayoutMiniFrame id={preset.id} active={active} />
                </div>
                <p className="text-sm font-semibold text-[var(--booth-ink)]">
                  {preset.title}
                </p>
                <p className="min-h-[2.25rem] text-[10px] leading-relaxed text-[var(--booth-walnut)]/78">
                  {preset.subtitle}
                </p>
                {disabled ? (
                  <p className="mt-auto text-[11px] font-medium text-[var(--booth-walnut)]/70">
                    80mm only
                  </p>
                ) : (
                  <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--booth-walnut)]/58">
                    {active ? "Selected" : "Tap to select"}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <section className="space-y-2">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/60">
          Photos on one receipt ({paperWidthLabel})
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:max-w-xl md:mx-auto">
          {([1, 2, 3, 4, 6] as const).map((count) => {
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
          {layoutDetailText}
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
