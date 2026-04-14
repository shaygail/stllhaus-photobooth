import { BOOTH_PHOTO_DISPLAY_SCALE } from "@/constants/booth-photo";
import { BoothMark } from "@/components/booth/BoothMark";
import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";
import type { BoothStaffPressProps } from "@/components/booth/BoothMark";
import type { BackLens } from "@/hooks/useBoothCamera";
import type { CountdownChoice } from "@/types/booth";

type CameraScreenProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  countdownChoice: CountdownChoice;
  onCountdownChange: (v: CountdownChoice) => void;
  backLens: BackLens;
  onBackLensChange: (l: BackLens) => void;
  hasUltraWideBack: boolean;
  facingMode: "environment" | "user";
  onCapture: () => void;
  onSwitchCamera: () => void;
  onBack: () => void;
  error: string | null;
  isStarting: boolean;
  hasStream: boolean;
  isCounting: boolean;
  countDisplay: number | null;
  staffMarkProps?: BoothStaffPressProps;
};

const choices: CountdownChoice[] = [3, 5, 10];

export function CameraScreen({
  videoRef,
  countdownChoice,
  onCountdownChange,
  backLens,
  onBackLensChange,
  hasUltraWideBack,
  facingMode,
  onCapture,
  onSwitchCamera,
  onBack,
  error,
  isStarting,
  hasStream,
  isCounting,
  countDisplay,
  staffMarkProps,
}: CameraScreenProps) {
  const showLens = facingMode === "environment";
  return (
    <BoothShell className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--booth-walnut)] hover:bg-black/[0.04]"
        >
          Back
        </button>
        <BoothMark compact staffPressProps={staffMarkProps} />
        <span className="w-14" aria-hidden />
      </header>

      <div className="relative flex-1 overflow-hidden rounded-[1.75rem] bg-black shadow-inner ring-1 ring-black/10">
        <video
          ref={videoRef}
          className="relative z-0 h-full min-h-[52vh] w-full origin-center object-cover"
          style={{ transform: `scale(${BOOTH_PHOTO_DISPLAY_SCALE})` }}
          playsInline
          muted
          autoPlay
        />
        {isCounting && countDisplay !== null ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
            <span className="text-8xl font-light tabular-nums text-white drop-shadow-lg">
              {countDisplay}
            </span>
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-[var(--booth-oat)]/97 px-5 py-8 text-center">
            <p className="text-base font-semibold text-[var(--booth-ink)]">
              Camera can&apos;t start
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--booth-walnut)]">
              {error}
            </p>
          </div>
        ) : null}
        {!hasStream && !error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--booth-oat)] text-sm text-[var(--booth-walnut)]">
            {isStarting ? "Opening camera…" : "Preparing preview…"}
          </div>
        ) : null}
      </div>

      <section className="space-y-3">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--booth-walnut)]/60">
          Countdown
        </p>
        <div className="grid grid-cols-3 gap-2">
          {choices.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onCountdownChange(n)}
              disabled={isCounting}
              className={`rounded-2xl py-3 text-sm font-semibold tabular-nums transition ${
                countdownChoice === n
                  ? "bg-[var(--booth-ink)] text-[var(--booth-cream)]"
                  : "bg-[var(--booth-cream)]/70 text-[var(--booth-ink)] ring-1 ring-[var(--booth-walnut)]/15"
              }`}
            >
              {n}s
            </button>
          ))}
        </div>
      </section>

      {showLens ? (
        <section className="space-y-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--booth-walnut)]/60">
            Back lens (1× solo · 0.5× group)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onBackLensChange("normal")}
              disabled={isCounting || !hasStream}
              className={`rounded-2xl py-3 text-sm font-semibold transition ${
                backLens === "normal"
                  ? "bg-[var(--booth-ink)] text-[var(--booth-cream)]"
                  : "bg-[var(--booth-cream)]/70 text-[var(--booth-ink)] ring-1 ring-[var(--booth-walnut)]/15"
              }`}
            >
              1×
            </button>
            <button
              type="button"
              onClick={() => onBackLensChange("wide06")}
              disabled={isCounting || !hasStream || !hasUltraWideBack}
              title={
                hasUltraWideBack
                  ? "Ultra-wide (about 0.5× — best for groups)"
                  : "Ultra-wide lens not reported by this device or browser"
              }
              className={`rounded-2xl py-3 text-sm font-semibold transition ${
                backLens === "wide06"
                  ? "bg-[var(--booth-ink)] text-[var(--booth-cream)]"
                  : "bg-[var(--booth-cream)]/70 text-[var(--booth-ink)] ring-1 ring-[var(--booth-walnut)]/15"
              } ${!hasUltraWideBack ? "opacity-50" : ""}`}
            >
              0.5×
            </button>
          </div>
          {!hasUltraWideBack ? (
            <p className="text-center text-[10px] leading-relaxed text-[var(--booth-walnut)]/55">
              0.5× needs a separate ultra-wide camera (many phones). On a single-lens Mac or webcam,
              use 1× only.
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <BoothTapButton
          variant="secondary"
          onClick={onSwitchCamera}
          disabled={isCounting || !hasStream}
        >
          Flip
        </BoothTapButton>
        <BoothTapButton onClick={onCapture} disabled={isCounting || !hasStream}>
          {isCounting ? "Wait…" : "Capture"}
        </BoothTapButton>
      </div>
    </BoothShell>
  );
}
