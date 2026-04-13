import type { PointerEventHandler } from "react";

export type BoothStaffPressProps = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
};

type BoothMarkProps = {
  /** Staff gesture: long-press to open settings */
  staffPressProps?: BoothStaffPressProps;
  compact?: boolean;
};

export function BoothMark({ staffPressProps, compact }: BoothMarkProps) {
  return (
    <div
      className={`touch-manipulation text-center select-none ${compact ? "space-y-1" : "space-y-2"}`}
      {...staffPressProps}
    >
      <p
        className={`font-semibold uppercase tracking-[0.38em] text-[var(--booth-walnut)] ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        STLL HAUS
      </p>
      {!compact ? (
        <p className="text-xs font-light leading-relaxed text-[var(--booth-walnut)]/75">
          New Plymouth
        </p>
      ) : null}
    </div>
  );
}
