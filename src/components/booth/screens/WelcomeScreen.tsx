import {
  BoothMark,
  type BoothStaffPressProps,
} from "@/components/booth/BoothMark";
import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";

type WelcomeScreenProps = {
  onStart: () => void;
  staffMarkProps?: BoothStaffPressProps;
};

export function WelcomeScreen({ onStart, staffMarkProps }: WelcomeScreenProps) {
  return (
    <BoothShell className="flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-12 text-center">
        <BoothMark staffPressProps={staffMarkProps} />
        <div className="max-w-xs space-y-4">
          <h1 className="text-3xl font-light leading-tight tracking-tight text-[var(--booth-ink)] md:text-4xl">
            Take home
            <br />
            <span className="font-medium">a little moment</span>
          </h1>
          <p className="text-sm leading-relaxed text-[var(--booth-walnut)]/85">
            A tiny receipt keepsake from your day — soft, slow, and yours to
            keep.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <BoothTapButton onClick={onStart}>Start</BoothTapButton>
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[var(--booth-walnut)]/50">
            Camera is used only for your photo
          </p>
        </div>
      </div>
    </BoothShell>
  );
}
