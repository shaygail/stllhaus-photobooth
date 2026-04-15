import { type BoothStaffPressProps } from "@/components/booth/BoothMark";
import { BoothShell } from "@/components/booth/BoothShell";
import { formatBoothDate, formatBoothTime } from "@/lib/booth-datetime";

type WelcomeScreenProps = {
  onStart: () => void;
  staffMarkProps?: BoothStaffPressProps;
};

export function WelcomeScreen({ onStart, staffMarkProps }: WelcomeScreenProps) {
  const now = new Date();
  const dateText = formatBoothDate(now);
  const timeText = formatBoothTime(now);

  return (
    <BoothShell className="flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <header className="space-y-2" {...staffMarkProps}>
          <h1 className="text-4xl font-light uppercase tracking-[0.24em] text-[var(--booth-ink)] md:text-5xl">
            STLL SNAPS
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/65">
            Receipt photobooth
          </p>
        </header>

        <div className="relative w-full max-w-[460px] px-2 py-2">
          <div className="mx-auto w-full max-w-[360px] rounded-[2rem] border border-black/[0.06] bg-[#f2f1ef] p-5 shadow-[0_22px_44px_-24px_rgba(44,38,32,0.45)]">
            <article className="rounded-[1.35rem] border border-black/[0.08] bg-white px-5 pb-5 pt-5">
              <button
                type="button"
                onClick={onStart}
                className="group block w-full cursor-pointer touch-manipulation rounded-sm border border-black/20 bg-white transition active:scale-[0.995] [-webkit-tap-highlight-color:transparent]"
                aria-label="Tap to start photo session"
              >
                <div className="flex aspect-[3/4] w-full items-center justify-center">
                  <p className="px-3 text-center text-[26px] font-bold uppercase tracking-[0.15em] text-[var(--booth-ink)]">
                    TAP TO START
                  </p>
                </div>
              </button>

              <div className="mt-3 h-px w-full bg-black/25" />

              <section className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-3 text-left">
                <div className="flex justify-start">
                  <div className="h-11 w-11" aria-hidden />
                </div>

                <div className="flex justify-center pb-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-black.png"
                    alt="STLL SNAPS"
                    className="h-auto w-14 object-contain"
                    draggable={false}
                  />
                </div>

                <div className="min-w-0 text-right text-[8px] tracking-[0.08em] text-black/85">
                  <p className="font-semibold uppercase tracking-[0.14em] text-black">
                    {dateText}
                  </p>
                  <p>{timeText}</p>
                  <p>New Plymouth, NZ</p>
                </div>
              </section>
            </article>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-1">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
            Camera is used only for your photo
          </p>
        </div>
      </div>
    </BoothShell>
  );
}
