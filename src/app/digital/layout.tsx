import type { ReactNode } from "react";
import type { Viewport } from "next";

/**
 * QR opens `/digital/…` for **viewing / downloading the JPEG** — no camera API.
 * Still force light chrome + a painted shell so iOS dark mode + hydration issues
 * never look like a blank black page behind the client app.
 */
export const viewport: Viewport = {
  colorScheme: "light",
};

export default function DigitalLayout({ children }: { children: ReactNode }) {
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
      <noscript>
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>JavaScript is off</p>
          <p style={{ fontSize: 14, opacity: 0.85 }}>
            Turn JavaScript on to view your keepsake, or use the booth tablet to
            open your link.
          </p>
        </div>
      </noscript>
      {children}
    </div>
  );
}
