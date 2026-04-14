import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function ReceiptLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-digital-keepsake-root
      className="flex w-full min-w-0 flex-1 flex-col"
      style={{
        flex: "1 1 auto",
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "#ece8e3",
        color: "#2c2620",
        colorScheme: "light",
      }}
    >
      {children}
    </div>
  );
}
