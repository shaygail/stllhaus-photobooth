"use client";

import type { PointerEventHandler } from "react";
import { useCallback, useRef } from "react";

export function useLongPress(
  durationMs: number,
  onLongPress: () => void,
): {
  longPressProps: {
    onPointerDown: PointerEventHandler<HTMLDivElement>;
    onPointerUp: PointerEventHandler<HTMLDivElement>;
    onPointerLeave: PointerEventHandler<HTMLDivElement>;
    onPointerCancel: PointerEventHandler<HTMLDivElement>;
  };
} {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const longPressProps = {
    onPointerDown: () => {
      clear();
      timer.current = setTimeout(onLongPress, durationMs);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  };

  return { longPressProps };
}
