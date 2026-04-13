import type { ReactNode } from "react";

type BoothShellProps = {
  children: ReactNode;
  /** Soft top padding under status bar / safe area */
  className?: string;
};

export function BoothShell({ children, className = "" }: BoothShellProps) {
  return (
    <div
      className={`booth-root relative min-h-dvh w-full overflow-x-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,var(--booth-blush)_0%,transparent_55%),radial-gradient(ellipse_at_100%_40%,var(--booth-oat)_0%,transparent_45%)] opacity-90" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {children}
      </div>
    </div>
  );
}
