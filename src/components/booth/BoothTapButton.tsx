import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type BoothTapButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex min-h-[52px] w-full cursor-pointer touch-manipulation items-center justify-center rounded-2xl px-6 text-[13px] font-semibold uppercase tracking-[0.18em] transition [-webkit-tap-highlight-color:transparent] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--booth-ink)] text-[var(--booth-cream)] shadow-[0_10px_30px_-12px_rgba(44,38,32,0.55)] hover:bg-[#3d352c]",
  secondary:
    "border border-[var(--booth-walnut)]/25 bg-[var(--booth-cream)]/80 text-[var(--booth-ink)] backdrop-blur-sm hover:bg-[var(--booth-cream)]",
  ghost:
    "text-[var(--booth-walnut)] hover:bg-black/[0.04]",
};

export function BoothTapButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: BoothTapButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
