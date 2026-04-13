"use client";

import { useEffect, useState } from "react";

function readInsecureLan(): boolean {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  if (protocol === "https:") return false;
  if (hostname === "localhost" || hostname === "127.0.0.1") return false;
  return true;
}

/**
 * iPad/Safari only expose the camera in a **secure context**.
 * `http://192.168.x.x` is not secure → getUserMedia fails. HTTPS (or localhost) fixes it.
 *
 * Must not read `window` during the first render — SSR and the client must match
 * until `useEffect` runs, or hydration fails and Safari can show a blank/black page.
 */
export function InsecureNetworkBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShow(readInsecureLan());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[80] border-b border-amber-200/80 bg-amber-50/98 px-4 py-3 text-center shadow-sm backdrop-blur-sm"
      role="alert"
    >
      <p className="text-sm font-medium text-amber-950">
        Camera needs a <strong>secure (HTTPS)</strong> link on this network address.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
        Plain <code className="rounded bg-amber-100/80 px-1">http://…</code> to your
        computer&apos;s IP is blocked by Safari. On the Mac running the app, use{" "}
        <code className="rounded bg-amber-100/80 px-1">npm run dev:lan</code>, then
        open the <strong>https://</strong> URL from the terminal (same Wi‑Fi). On
        iPad, tap <strong>Advanced</strong> → continue once to trust the dev
        certificate.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 underline"
      >
        Dismiss
      </button>
    </div>
  );
}
