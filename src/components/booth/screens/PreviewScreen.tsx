import { BOOTH_PHOTO_DISPLAY_SCALE } from "@/constants/booth-photo";
import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";

type PreviewScreenProps = {
  imageSrc: string;
  onRetake: () => void;
  onContinue: () => void;
};

export function PreviewScreen({
  imageSrc,
  onRetake,
  onContinue,
}: PreviewScreenProps) {
  return (
    <BoothShell className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--booth-walnut)]/60">
          Your frame
        </p>
        <h2 className="mt-2 text-2xl font-light text-[var(--booth-ink)]">
          Looking lovely
        </h2>
      </header>

      <div className="overflow-hidden rounded-[1.75rem] bg-[var(--booth-cream)] shadow-inner ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Your captured photo"
          className="aspect-[3/4] w-full origin-center object-cover object-center"
          style={{ transform: `scale(${BOOTH_PHOTO_DISPLAY_SCALE})` }}
        />
      </div>

      <p className="text-center text-sm leading-relaxed text-[var(--booth-walnut)]/85">
        Next, choose how your moment sits on the strip — then we&apos;ll show
        the soft, receipt-style preview.
      </p>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <BoothTapButton variant="secondary" onClick={onRetake}>
          Retake
        </BoothTapButton>
        <BoothTapButton onClick={onContinue}>Continue</BoothTapButton>
      </div>
    </BoothShell>
  );
}
