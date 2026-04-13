"use client";

import { useMemo, useState } from "react";
import { ReceiptPreviewCard, ReceiptPrintLayout } from "@/components/receipt";
import { brandMessageOptions, receiptPreviewBase } from "@/data/receipt-mock";

export default function ReceiptPreviewPage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showQr, setShowQr] = useState(true);

  const messageText = brandMessageOptions[messageIndex] ?? brandMessageOptions[0];

  const props80 = useMemo(
    () => ({
      ...receiptPreviewBase,
      messageText,
      paperWidth: "80mm" as const,
      qrCodeUrl: showQr ? receiptPreviewBase.qrCodeUrl : undefined,
    }),
    [messageText, showQr],
  );

  const props58 = useMemo(
    () => ({
      ...props80,
      paperWidth: "58mm" as const,
    }),
    [props80],
  );

  return (
    <div className="min-h-screen bg-[#ece8e3] px-4 py-12 text-stone-800">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
            STLL HAUS photobooth
          </p>
          <h1 className="text-2xl font-light tracking-tight text-stone-900 md:text-3xl">
            Thermal print preview
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
            A quiet layout for keepsake strips — monochrome, high contrast, and
            sized for 80mm and 58mm rolls. Toggle QR and copy to see how the
            strip breathes.
          </p>
        </header>

        <section className="mx-auto flex max-w-lg flex-col gap-6 rounded-2xl border border-stone-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-2">
            <label
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500"
              htmlFor="message-select"
            >
              Brand message
            </label>
            <select
              id="message-select"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 shadow-inner focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
              value={messageIndex}
              onChange={(e) => setMessageIndex(Number(e.target.value))}
            >
              {brandMessageOptions.map((opt, i) => (
                <option key={opt} value={i}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              QR code
            </span>
            <button
              type="button"
              onClick={() => setShowQr((v) => !v)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                showQr
                  ? "bg-stone-900 text-stone-50"
                  : "border border-stone-300 bg-white text-stone-700"
              }`}
            >
              {showQr ? "On" : "Off"}
            </button>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <ReceiptPreviewCard label="80mm · primary target">
            <ReceiptPrintLayout {...props80} id="receipt-preview-80" />
          </ReceiptPreviewCard>
          <ReceiptPreviewCard label="58mm · compact portable">
            <ReceiptPrintLayout {...props58} id="receipt-preview-58" />
          </ReceiptPreviewCard>
        </div>
      </div>
    </div>
  );
}
