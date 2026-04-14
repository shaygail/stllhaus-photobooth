"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { BoothShell } from "@/components/booth/BoothShell";
import { BoothTapButton } from "@/components/booth/BoothTapButton";

export type DigitalSlipUiStatus = "idle" | "creating" | "ready" | "fail";

type DoneScreenProps = {
  showQrHint: boolean;
  instagramText?: string;
  onStartOver: () => void;
  digitalSlipStatus: DigitalSlipUiStatus;
  digitalSlipError?: string | null;
  digitalViewUrl: string | null;
  onSubmitEmail: (email: string) => Promise<{ ok: boolean; message?: string }>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DoneScreen({
  showQrHint,
  instagramText,
  onStartOver,
  digitalSlipStatus,
  digitalSlipError,
  digitalViewUrl,
  onSubmitEmail,
}: DoneScreenProps) {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailStatus("error");
      setEmailMessage("Please enter a valid email.");
      return;
    }
    setEmailStatus("sending");
    setEmailMessage(null);
    const res = await onSubmitEmail(trimmed);
    if (res.ok) {
      setEmailStatus("sent");
      setEmailMessage(
        res.message ??
          "You’re on the list. We’ll send your receipt keepsake when email is connected.",
      );
    } else {
      setEmailStatus("error");
      setEmailMessage(res.message ?? "Could not save your email. Try again.");
    }
  }

  return (
    <BoothShell className="flex flex-col gap-10 pb-6">
      <div className="flex flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--booth-cream)] text-2xl shadow-sm ring-1 ring-black/5">
            ☁︎
          </div>
          <h2 className="text-3xl font-light text-[var(--booth-ink)]">
            Your print is on the way
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-[var(--booth-walnut)]/85">
            Collect your strip from the printer. Hold it gently — thermal paper
            loves cool, dry hands.
          </p>
        </div>

        {showQrHint && instagramText ? (
          <p className="max-w-sm text-xs uppercase tracking-[0.18em] text-[var(--booth-walnut)]/70">
            Share the slow — find us on Instagram{" "}
            <span className="font-semibold text-[var(--booth-ink)]">
              {instagramText}
            </span>
          </p>
        ) : showQrHint ? (
          <p className="max-w-sm text-xs uppercase tracking-[0.18em] text-[var(--booth-walnut)]/70">
            Tag your moment — we love seeing the stall through your eyes.
          </p>
        ) : null}
      </div>

      <section className="rounded-3xl bg-[var(--booth-cream)]/85 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--booth-walnut)]/55">
          Digital receipt keepsake
        </p>
        <p className="mt-2 text-center text-sm leading-relaxed text-[var(--booth-walnut)]/85">
          Scan for the same thermal-style receipt strip you approved before
          printing — ready to save or share.
        </p>

        {digitalSlipStatus === "creating" ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-6 text-sm text-[var(--booth-walnut)]/80">
            <span className="h-9 w-9 animate-pulse rounded-full bg-[var(--booth-oat)]" />
            Preparing your link…
          </div>
        ) : null}

        {digitalSlipStatus === "fail" ? (
          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-amber-900/90">
              Digital link isn&apos;t available offline or right now. Your print
              is still fine — ask staff if you need help.
            </p>
            {digitalSlipError ? (
              <p className="mx-auto max-w-[22rem] break-words rounded-xl border border-amber-300/60 bg-amber-50/70 px-3 py-2 text-[11px] leading-relaxed text-amber-950/90">
                Debug: {digitalSlipError}
              </p>
            ) : null}
          </div>
        ) : null}

        {digitalSlipStatus === "ready" && digitalViewUrl ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
              <QRCode value={digitalViewUrl} size={168} level="M" />
            </div>
            <p className="max-w-[20rem] break-all text-center text-[10px] leading-relaxed text-[var(--booth-walnut)]/70">
              {digitalViewUrl}
            </p>
            <p className="max-w-[14rem] text-center text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--booth-walnut)]/65">
              Scan with your phone · link stays gentle for 24 hours
            </p>
            <p className="max-w-[18rem] text-center text-xs leading-relaxed text-[var(--booth-walnut)]/80">
              On your phone, open the link, then use{" "}
              <span className="font-semibold text-[var(--booth-ink)]">
                Download receipt layout
              </span>{" "}
              or long-press the strip to save to Photos.
            </p>
          </div>
        ) : null}

        <form
          onSubmit={(e) => void handleEmailSubmit(e)}
          className="mt-8 space-y-3 border-t border-black/5 pt-6"
        >
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
            Email me a copy
          </p>
          <label className="sr-only" htmlFor="digital-email">
            Email address
          </label>
          <input
            id="digital-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            disabled={emailStatus === "sending" || digitalSlipStatus !== "ready"}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[var(--booth-ink)] shadow-inner placeholder:text-stone-400 focus:border-[var(--booth-walnut)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--booth-walnut)]/25"
          />
          <BoothTapButton
            type="submit"
            variant="secondary"
            disabled={
              emailStatus === "sending" ||
              digitalSlipStatus !== "ready" ||
              !email.trim()
            }
            className="min-h-[48px]"
          >
            {emailStatus === "sending" ? "Sending…" : "Request email copy"}
          </BoothTapButton>
          {emailMessage ? (
            <p
              className={`text-center text-xs leading-relaxed ${
                emailStatus === "error"
                  ? "text-red-800/90"
                  : "text-[var(--booth-walnut)]/85"
              }`}
            >
              {emailMessage}
            </p>
          ) : null}
        </form>
      </section>

      <div className="mt-auto w-full max-w-sm self-center">
        <BoothTapButton onClick={onStartOver}>Next guest</BoothTapButton>
      </div>
    </BoothShell>
  );
}
