"use client";

import { useCallback, useEffect, useState } from "react";
import { formatBoothDate, formatBoothTime } from "@/lib/booth-datetime";

type ReceiptKeepsakeClientProps = {
  token: string;
};

type MetaState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; createdAt: string };

function safeBoothDateTimeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "Your session";
  }
  try {
    return `${formatBoothDate(d)} · ${formatBoothTime(d)} · New Plymouth, NZ`;
  } catch {
    return "Your session · New Plymouth, NZ";
  }
}

function slugForFilename(iso: string) {
  return iso.replace(/[:.]/g, "-").slice(0, 19);
}

export function ReceiptKeepsakeClient({ token }: ReceiptKeepsakeClientProps) {
  const [meta, setMeta] = useState<MetaState>({ status: "loading" });
  const [imgReady, setImgReady] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgErrDetail, setImgErrDetail] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOrigin(window.location.origin);
      setCanNativeShare(typeof navigator.share === "function");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const t = encodeURIComponent(token.trim());
  const relMeta = `/api/receipt/${t}`;
  const relAsset = `/api/receipt/${t}/asset`;
  const relDownload = `/api/receipt/${t}/download`;

  const abs = useCallback(
    (path: string) => (origin ? `${origin}${path}` : path),
    [origin],
  );

  useEffect(() => {
    if (!token.trim()) {
      setMeta({ status: "error", message: "This link is missing a receipt code." });
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(relMeta, { cache: "no-store" });
        const data = (await res.json()) as { createdAt?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "This receipt link has expired or was removed.");
        }
        if (!data.createdAt) {
          throw new Error("Could not load this receipt.");
        }
        if (!cancelled) {
          setMeta({ status: "ok", createdAt: data.createdAt });
        }
      } catch (e) {
        if (!cancelled) {
          setMeta({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load receipt.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [relMeta, token]);

  const imgSrc =
    meta.status === "ok"
      ? `${abs(relAsset)}?v=${encodeURIComponent(meta.createdAt)}`
      : abs(relAsset);

  useEffect(() => {
    if (meta.status !== "ok") return;
    setImgReady(false);
    setImgFailed(false);
    setImgErrDetail(null);
  }, [meta.status, imgSrc]);

  const onPhotoError = useCallback(() => {
    setImgFailed(true);
    setImgReady(true);
    void (async () => {
      try {
        const res = await fetch(imgSrc);
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setImgErrDetail(data.error || "Could not load receipt.");
        } else {
          setImgErrDetail(res.ok ? "Unexpected response." : `HTTP ${res.status}`);
        }
      } catch {
        setImgErrDetail("Network error while loading receipt.");
      }
    })();
  }, [imgSrc]);

  const handleDownload = useCallback(async () => {
    if (meta.status !== "ok") return;
    setDownloadBusy(true);
    setDownloadError(null);
    try {
      const res = await fetch(abs(relDownload), { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Download failed (${res.status}).`);
      }
      const blob = await res.blob();
      if (!blob.size) throw new Error("Empty file returned.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stllhaus-receipt-${slugForFilename(meta.createdAt)}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Could not download receipt.");
    } finally {
      setDownloadBusy(false);
    }
  }, [abs, meta, relDownload]);

  const handleShare = useCallback(async () => {
    if (!canNativeShare || meta.status !== "ok") return;
    try {
      const res = await fetch(abs(relDownload), { cache: "no-store" });
      const blob = await res.blob();
      const file = new File([blob], "stllhaus-receipt.jpg", { type: "image/jpeg" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "STLL HAUS receipt strip" });
        return;
      }
      await navigator.share({ title: "STLL HAUS receipt strip", url: window.location.href });
    } catch {
      /* ignore */
    }
  }, [abs, canNativeShare, meta, relDownload]);

  if (meta.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f1ec] px-4 text-sm text-stone-600">
        Loading your receipt…
      </div>
    );
  }

  if (meta.status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#f4f1ec] px-6 text-center">
        <p className="text-lg font-medium text-stone-800">Receipt unavailable</p>
        <p className="max-w-sm text-sm text-stone-600">{meta.message}</p>
      </div>
    );
  }

  const dateLine = safeBoothDateTimeLabel(meta.createdAt);
  const linkClass =
    "flex min-h-[52px] w-full items-center justify-center rounded-2xl px-6 text-[13px] font-semibold uppercase tracking-[0.18em] transition active:scale-[0.99]";
  const primaryLink = `${linkClass} bg-stone-900 text-white shadow-md hover:bg-stone-800`;
  const secondaryLink = `${linkClass} border border-stone-300 bg-white/90 text-stone-800 hover:bg-white`;

  return (
    <div className="min-h-dvh bg-[#ece8e3] px-4 py-10 text-[#2c2620]">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <header className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
            STLL HAUS
          </p>
          <h1 className="mt-2 text-2xl font-light tracking-tight text-stone-900">
            Your receipt keepsake
          </h1>
          <p className="mt-2 text-sm text-stone-600">{dateLine}</p>
        </header>

        <div className="overflow-hidden rounded-[1.75rem] bg-[#fdfcfa] p-4 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-black/6">
          <div className="relative aspect-2/5 min-h-[280px] w-full overflow-hidden rounded-2xl bg-[#f6f4f0] shadow-inner sm:aspect-3/7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgSrc}
              src={imgSrc}
              alt="Final STLL HAUS receipt strip"
              decoding="async"
              onLoad={() => {
                setImgReady(true);
                setImgFailed(false);
              }}
              onError={onPhotoError}
              className="absolute inset-0 h-full w-full object-contain object-top"
            />
            {!imgReady && !imgFailed ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f6f4f0]/90 text-xs text-stone-500">
                Loading receipt…
              </div>
            ) : null}
            {imgFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-xs text-stone-600">
                <p className="font-medium text-stone-800">Receipt didn&apos;t load</p>
                <p>{imgErrDetail ?? "Try the download button below."}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={downloadBusy}
            onClick={() => void handleDownload()}
            className={`${primaryLink} disabled:cursor-wait disabled:opacity-70`}
          >
            {downloadBusy ? "Preparing download…" : "Download receipt"}
          </button>
          {downloadError ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-center text-[11px] leading-relaxed text-red-950">
              {downloadError}
            </p>
          ) : null}
          <a href={relAsset} target="_blank" rel="noopener noreferrer" className={secondaryLink}>
            Open full receipt
          </a>
          {canNativeShare ? (
            <button
              type="button"
              onClick={() => void handleShare()}
              className="min-h-[48px] w-full rounded-2xl border border-stone-300 bg-white/90 px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-800 transition hover:bg-white"
            >
              Share…
            </button>
          ) : null}
          <p className="text-center text-[11px] leading-relaxed text-stone-500">
            On iPhone, if Download doesn&apos;t prompt, tap Open full receipt and long-press
            the image, then Save to Photos.
          </p>
        </div>
      </div>
    </div>
  );
}
