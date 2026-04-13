"use client";

import { useCallback, useEffect, useState } from "react";
import { BOOTH_PHOTO_DISPLAY_SCALE } from "@/constants/booth-photo";
import { formatBoothDate, formatBoothTime } from "@/lib/booth-datetime";

function slugForFilename(iso: string) {
  return iso.replace(/[:.]/g, "-").slice(0, 19);
}

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

type DigitalKeepsakeClientProps = {
  token: string;
};

type MetaState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; createdAt: string; hasLayout: boolean };

export function DigitalKeepsakeClient({ token }: DigitalKeepsakeClientProps) {
  const [meta, setMeta] = useState<MetaState>({ status: "loading" });
  const [imgReady, setImgReady] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgErrDetail, setImgErrDetail] = useState<string | null>(null);

  /** Must match server first paint — never read `window` during render (hydration) */
  const [origin, setOrigin] = useState("");
  const [onLocalhost, setOnLocalhost] = useState(false);
  /** Same: SSR has no `navigator.share`; phones do — branch only after mount */
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOrigin(window.location.origin);
      const h = window.location.hostname;
      setOnLocalhost(h === "localhost" || h === "127.0.0.1");
      setCanNativeShare(typeof navigator.share === "function");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const rawToken = typeof token === "string" ? token.trim() : "";
  const t = encodeURIComponent(rawToken);
  const relImage = `/api/digital-slip/${t}/image`;
  const relDownload = `/api/digital-slip/${t}/download`;
  const relLayout = `/api/digital-slip/${t}/layout`;
  const relLayoutDownload = `/api/digital-slip/${t}/layout-download`;
  const relMeta = `/api/digital-slip/${t}`;

  /** After mount, use absolute URLs — some mobile WebKit builds fail on relative `/api` in <img> */
  const abs = useCallback(
    (path: string) => (origin ? `${origin}${path}` : path),
    [origin],
  );

  const primaryRelImage =
    meta.status === "ok" && meta.hasLayout ? relLayout : relImage;
  const primaryRelDownload =
    meta.status === "ok" && meta.hasLayout ? relLayoutDownload : relDownload;
  const primaryLabel =
    meta.status === "ok" && meta.hasLayout
      ? "Download colour layout"
      : "Download JPEG";
  const primaryOpenLabel =
    meta.status === "ok" && meta.hasLayout
      ? "Open colour layout"
      : "Open full image";

  const imgSrc =
    meta.status === "ok"
      ? `${abs(primaryRelImage)}?v=${encodeURIComponent(meta.createdAt)}`
      : abs(primaryRelImage);

  useEffect(() => {
    if (!rawToken) {
      setMeta({
        status: "error",
        message: "This link is missing a keepsake code.",
      });
      return;
    }
    let cancelled = false;
    (async () => {
      setMeta({ status: "loading" });
      try {
        const res = await fetch(relMeta, { cache: "no-store" });
        const data = (await res.json()) as {
          createdAt?: string;
          hasLayout?: boolean;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || "This link has expired or was removed.");
        }
        if (!data.createdAt) {
          throw new Error("Something went wrong loading your keepsake.");
        }
        if (!cancelled) {
          setMeta({
            status: "ok",
            createdAt: data.createdAt,
            hasLayout: Boolean(data.hasLayout),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setMeta({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load keepsake.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t, rawToken, relMeta]);

  useEffect(() => {
    if (meta.status !== "ok") {
      setImgReady(false);
      setImgFailed(false);
      setImgErrDetail(null);
      return;
    }
    setImgReady(false);
    setImgFailed(false);
    setImgErrDetail(null);

    const hideLoading = () => setImgReady(true);
    const timer = window.setTimeout(hideLoading, 14_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [meta.status, imgSrc]);

  const onPhotoLoad = useCallback(() => {
    setImgReady(true);
    setImgFailed(false);
  }, []);

  const onPhotoError = useCallback(() => {
    setImgFailed(true);
    setImgReady(true);
    void (async () => {
      try {
        const res = await fetch(imgSrc);
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setImgErrDetail(data.error || "Could not load image.");
        } else {
          setImgErrDetail(
            res.ok
              ? "Unexpected response. Try Download JPEG below."
              : `HTTP ${res.status}`,
          );
        }
      } catch {
        setImgErrDetail("Network error while loading the photo.");
      }
    })();
  }, [imgSrc]);

  const handleShare = useCallback(async () => {
    if (meta.status !== "ok") return;
    if (!navigator.share) return;
    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const file = new File([blob], "stllhaus-moment.jpg", {
        type: "image/jpeg",
      });
      const canFiles =
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });
      if (canFiles) {
        await navigator.share({
          files: [file],
          title: "STLL HAUS moment",
          text: "My moment from STLL HAUS",
        });
      } else {
        await navigator.share({
          title: "STLL HAUS moment",
          text: "My moment from STLL HAUS",
          url: window.location.href,
        });
      }
    } catch {
      /* user cancelled or share failed */
    }
  }, [meta, imgSrc]);

  const handleDownloadJpeg = useCallback(async () => {
    if (meta.status !== "ok") return;
    const saveAs = `stllhaus-moment-${slugForFilename(meta.createdAt)}.jpg`;
    setDownloadError(null);
    setDownloadBusy(true);
    try {
      const res = await fetch(abs(primaryRelDownload), { cache: "no-store" });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDownloadError(
          data.error === "Not found"
            ? "This file is no longer on the booth computer (wrong Wi‑Fi, link expired, or the booth app was restarted). Ask staff to print a new QR from the same session."
            : (data.error ?? `Download failed (${res.status}).`),
        );
        return;
      }
      if (!ct.startsWith("image/")) {
        setDownloadError(
          "The booth did not return a JPEG. Ask staff to try again or use “Open full image”.",
        );
        return;
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        setDownloadError("Empty file from server. Ask staff to restart the booth and take a new photo.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = saveAs;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setDownloadError(
        "Network error. Stay on the booth Wi‑Fi and use the same https:// address as the QR (trust the certificate once if asked).",
      );
    } finally {
      setDownloadBusy(false);
    }
  }, [meta, primaryRelDownload, abs]);

  if (meta.status === "loading") {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-[#f4f1ec] text-sm text-stone-600"
        style={{
          minHeight: "100dvh",
          backgroundColor: "#f4f1ec",
          color: "#57534e",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading your moment…
      </div>
    );
  }

  if (meta.status === "error") {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f4f1ec] px-6 text-center"
        style={{
          minHeight: "100dvh",
          backgroundColor: "#f4f1ec",
          color: "#292524",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p className="text-lg font-light text-stone-800">This moment isn&apos;t here</p>
        <p className="max-w-sm text-sm text-stone-600">{meta.message}</p>
      </div>
    );
  }

  const when = new Date(meta.createdAt);
  const dateLine = Number.isNaN(when.getTime())
    ? "Your session · New Plymouth, NZ"
    : safeBoothDateTimeLabel(meta.createdAt);

  const linkClass =
    "flex min-h-[52px] w-full items-center justify-center rounded-2xl px-6 text-[13px] font-semibold uppercase tracking-[0.18em] transition active:scale-[0.99]";
  const primaryLink = `${linkClass} bg-stone-900 text-white shadow-md hover:bg-stone-800`;
  const secondaryLink = `${linkClass} border border-stone-300 bg-white/90 text-stone-800 hover:bg-white`;

  return (
    <div
      className="min-h-dvh bg-[#ece8e3] px-4 py-10 text-[#2c2620]"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#ece8e3",
        color: "#2c2620",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {onLocalhost ? (
        <div
          className="mx-auto mb-6 max-w-md rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-center text-xs leading-relaxed text-amber-950 shadow-sm"
          role="status"
        >
          You&apos;re on <strong>localhost</strong>. On a phone, that saves to the
          phone itself, not your booth Mac. Ask staff to set{" "}
          <strong>Public site URL</strong> (Wi‑Fi <code className="font-mono">https://…</code>{" "}
          link) so the QR opens the right host — then download works on your device.
        </div>
      ) : null}
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <header className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
            STLL HAUS
          </p>
          <h1 className="mt-2 text-2xl font-light tracking-tight text-stone-900">
            Your colour keepsake
          </h1>
          <p className="mt-2 text-sm text-stone-600">{dateLine}</p>
        </header>

        <div className="overflow-hidden rounded-[1.75rem] bg-[#fdfcfa] p-4 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f6f4f0] shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgSrc}
              src={imgSrc}
              alt="Your STLL HAUS moment — long-press to save"
              decoding="async"
              onLoad={onPhotoLoad}
              onError={onPhotoError}
              className="absolute inset-0 z-0 h-full w-full origin-center object-cover object-center"
              style={{ transform: `scale(${BOOTH_PHOTO_DISPLAY_SCALE})` }}
            />
            {!imgReady && !imgFailed ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#f6f4f0]/90 text-xs text-stone-500">
                Loading photo…
              </div>
            ) : null}
            {imgFailed ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#f6f4f0]/95 px-4 text-center text-xs text-stone-600">
                <p className="font-medium text-stone-800">Photo didn&apos;t load</p>
                <p>{imgErrDetail ?? "Bad response or blocked request."}</p>
                <p className="text-stone-500">
                  Try <span className="font-semibold text-stone-700">{primaryLabel}</span>{" "}
                  or <span className="font-semibold text-stone-700">{primaryOpenLabel}</span>.
                </p>
              </div>
            ) : null}
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-stone-500">
            quiet sips, slow moments ☁️
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Save to your phone
          </p>

          <button
            type="button"
            disabled={downloadBusy}
            onClick={() => void handleDownloadJpeg()}
            className={`${primaryLink} disabled:cursor-wait disabled:opacity-70`}
          >
            {downloadBusy ? "Preparing download…" : primaryLabel}
          </button>
          {downloadError ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-center text-[11px] leading-relaxed text-red-950">
              {downloadError}
            </p>
          ) : null}

          <a
            href={primaryRelImage}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryLink}
          >
            {primaryOpenLabel}
          </a>
          <a
            href={primaryRelDownload}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[11px] font-medium text-stone-600 underline decoration-stone-400 underline-offset-2"
          >
            Direct download link (opens new tab)
          </a>
          {meta.status === "ok" && meta.hasLayout ? (
            <a
              href={relImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[11px] font-medium text-stone-500 underline decoration-stone-300 underline-offset-2"
            >
              Open original photo instead
            </a>
          ) : null}
          <p className="text-center text-[11px] leading-relaxed text-stone-500">
            On iPhone, Safari often ignores a normal save button — we fetch the file for
            you first. If nothing saves, tap{" "}
            <span className="font-semibold text-stone-700">{primaryOpenLabel}</span>, then{" "}
            <span className="font-semibold text-stone-700">long-press</span> the picture and{" "}
            <span className="font-semibold text-stone-700">Save to Photos</span>.
          </p>

          {canNativeShare ? (
            <button
              type="button"
              onClick={() => void handleShare()}
              className="min-h-[48px] w-full rounded-2xl border border-stone-300 bg-white/90 px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-800 transition hover:bg-white"
            >
              Share…
            </button>
          ) : null}

          <p className="text-center text-[11px] leading-relaxed text-stone-400">
            This link is temporary — save while you&apos;re here.
          </p>
        </div>
      </div>
    </div>
  );
}
