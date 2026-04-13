"use client";

import { useEffect } from "react";

export default function DigitalKeepsakeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[digital-keepsake] route error", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        backgroundColor: "#f4f1ec",
        color: "#292524",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 18, fontWeight: 600 }}>Couldn&apos;t load this page</p>
      <p style={{ fontSize: 14, maxWidth: 360, lineHeight: 1.5, opacity: 0.9 }}>
        {error.message || "Something went wrong. Try the link again on the booth Wi‑Fi."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 8,
          padding: "12px 20px",
          borderRadius: 12,
          border: "1px solid #292524",
          background: "#2c2620",
          color: "#fdfcfa",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  );
}
