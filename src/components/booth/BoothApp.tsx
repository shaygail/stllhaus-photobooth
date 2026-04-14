"use client";

import { useSearchParams } from "next/navigation";
import { flushSync } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminPanel } from "@/components/booth/AdminPanel";
import { InsecureNetworkBanner } from "@/components/booth/InsecureNetworkBanner";
import type { BoothStaffPressProps } from "@/components/booth/BoothMark";
import { CameraScreen } from "@/components/booth/screens/CameraScreen";
import {
  DoneScreen,
  type DigitalSlipUiStatus,
} from "@/components/booth/screens/DoneScreen";
import { PreviewScreen } from "@/components/booth/screens/PreviewScreen";
import { PrintScreen } from "@/components/booth/screens/PrintScreen";
import { ReceiptReviewScreen } from "@/components/booth/screens/ReceiptReviewScreen";
import { LayoutSelectScreen } from "@/components/booth/screens/LayoutSelectScreen";
import { WelcomeScreen } from "@/components/booth/screens/WelcomeScreen";
import { useBoothCamera } from "@/hooks/useBoothCamera";
import { useLongPress } from "@/hooks/useLongPress";
import {
  boothSettingsToReceiptProps,
  printerLabelFromSettings,
} from "@/lib/booth-receipt-map";
import {
  ReceiptPrintLayout,
  type ReceiptPrintLayoutProps,
} from "@/components/receipt";
import { captureReceiptPrintRoot } from "@/lib/capture-receipt-layout";
import { resolveBoothPublicOrigin } from "@/lib/booth-public-url";
import { loadBoothSettings, saveBoothSettings } from "@/lib/booth-settings-storage";
import type {
  BoothGalleryItem,
  BoothStep,
  CountdownChoice,
  PrinterConnectionUi,
  ReceiptPhotoCount,
} from "@/types/booth";
import { DEFAULT_BOOTH_SETTINGS } from "@/types/booth";
import {
  getCustomerLayoutPreset,
  type CustomerLayoutId,
} from "@/lib/customer-layout";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

async function renderFallbackReceiptDataUrl(
  receipt: ReceiptPrintLayoutProps,
): Promise<string | null> {
  const photos = [receipt.photoUrl, ...(receipt.additionalPhotoUrls ?? [])].filter(
    Boolean,
  ) as string[];
  if (!photos.length) return null;

  const aspect =
    receipt.photoAspect === "1/1"
      ? 1
      : receipt.photoAspect === "4/5"
        ? 4 / 5
        : 3 / 4;
  const isGrid = receipt.photoLayout === "mini-grid" && photos.length >= 4;
  const width = 900;
  const cardPadding = 44;
  const gap = 20;
  const titleHeight = 130;
  const contentWidth = width - cardPadding * 2;
  const count = Math.min(photos.length, 4);
  const frameWidth = isGrid ? Math.floor((contentWidth - gap) / 2) : contentWidth;
  const frameHeight = isGrid ? frameWidth : Math.round(frameWidth / aspect);
  const photosBlockHeight = isGrid
    ? frameHeight * 2 + gap
    : frameHeight * count + gap * (count - 1);
  const showMeta = receipt.display?.showMetaBlock ?? true;
  const showMessage = receipt.display?.showMessageBlock ?? true;
  const showConnect = receipt.display?.showConnectBlock ?? true;
  const metaHeight = showMeta ? 86 : 0;
  const messageHeight = showMessage ? 72 : 0;
  const connectHeight = showConnect ? 56 : 0;
  const footerHeight = messageHeight + connectHeight + 64;
  const height = titleHeight + cardPadding + photosBlockHeight + metaHeight + footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.font = "600 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(receipt.brandName || "STLL HAUS", width / 2, 48);
  if (receipt.tagline) {
    ctx.fillStyle = "#444444";
    ctx.font = "500 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(receipt.tagline, width / 2, 72);
  }

  const drawFrame = async (src: string, x: number, y: number, w: number, h: number) => {
    const img = await loadImage(src);
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = "grayscale(1) contrast(1.2) brightness(1.03)";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  };

  let y = titleHeight;
  if (isGrid) {
    const gridPhotos = photos.slice(0, 4);
    for (let i = 0; i < gridPhotos.length; i += 1) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = cardPadding + col * (frameWidth + gap);
      const yy = y + row * (frameHeight + gap);
      await drawFrame(gridPhotos[i]!, x, yy, frameWidth, frameHeight);
    }
    y += photosBlockHeight + gap;
  } else {
    for (let i = 0; i < count; i += 1) {
      await drawFrame(photos[i]!, cardPadding, y, frameWidth, frameHeight);
      y += frameHeight + gap;
    }
  }

  if (showMeta) {
    ctx.fillStyle = "#222";
    ctx.font = "600 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(receipt.dateText || "", width / 2, y + 24);
    ctx.font = "500 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(receipt.timeText || "", width / 2, y + 46);
    ctx.fillText(receipt.locationText || "", width / 2, y + 68);
    y += metaHeight;
  }
  if (showMessage && receipt.messageText) {
    ctx.fillStyle = "#222";
    ctx.font = "600 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(receipt.messageText, width / 2, y + 36);
    y += messageHeight;
  }
  if (showConnect) {
    const links = [receipt.instagramText, receipt.websiteText].filter(Boolean).join("   ");
    if (links) {
      ctx.fillStyle = "#555";
      ctx.font = "500 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(links, width / 2, y + 28);
    }
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.84);
  } catch {
    return null;
  }
}

export function BoothApp() {
  const searchParams = useSearchParams();
  const staffOpened = useRef(false);
  /** iOS Safari: getUserMedia must run in the same gesture as tap — skip duplicate start in effect */
  const cameraStartedInGesture = useRef(false);

  const [settings, setSettings] = useState(DEFAULT_BOOTH_SETTINGS);
  const [step, setStep] = useState<BoothStep>("welcome");
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [countdownChoice, setCountdownChoice] = useState<CountdownChoice>(3);
  const [isCounting, setIsCounting] = useState(false);
  const [countDisplay, setCountDisplay] = useState<number | null>(null);
  const countTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalLayoutSnapRef = useRef<string | null>(null);

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [gallery, setGallery] = useState<BoothGalleryItem[]>([]);
  const [customerLayoutId, setCustomerLayoutId] =
    useState<CustomerLayoutId>("classic");

  const [copies, setCopies] = useState<1 | 2>(1);
  const [receiptPhotoCount, setReceiptPhotoCount] = useState<ReceiptPhotoCount>(2);
  const selectedPreset = useMemo(
    () => getCustomerLayoutPreset(customerLayoutId),
    [customerLayoutId],
  );
  const miniGridEnabled = settings.paperWidth === "80mm";
  const availablePhotoCounts = useMemo<readonly ReceiptPhotoCount[]>(
    () =>
      selectedPreset.id === "mini-grid"
        ? miniGridEnabled
          ? ([4] as const)
          : ([] as const)
        : settings.paperWidth === "58mm"
          ? ([2] as const)
          : ([2, 3] as const),
    [selectedPreset.id, miniGridEnabled, settings.paperWidth],
  );

  useEffect(() => {
    if (!miniGridEnabled && selectedPreset.id === "mini-grid") {
      setCustomerLayoutId("classic");
      return;
    }
    if (!availablePhotoCounts.includes(receiptPhotoCount)) {
      setReceiptPhotoCount(availablePhotoCounts[availablePhotoCounts.length - 1] ?? 2);
    }
  }, [availablePhotoCounts, receiptPhotoCount, miniGridEnabled, selectedPreset.id]);

  const [printerConn, setPrinterConn] =
    useState<PrinterConnectionUi>("checking");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printPhase, setPrintPhase] = useState<"idle" | "sending" | "done">(
    "idle",
  );

  const [digitalSlipStatus, setDigitalSlipStatus] =
    useState<DigitalSlipUiStatus>("idle");
  const [digitalToken, setDigitalToken] = useState<string | null>(null);
  const [digitalSlipError, setDigitalSlipError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const {
    videoRef,
    stream,
    error,
    facingMode,
    backLens,
    setBackLens,
    hasUltraWideBack,
    resetCameraDefaults,
    isStarting,
    start,
    stop,
    switchCamera,
    captureDataUrl,
  } = useBoothCamera();

  useEffect(() => {
    setOrigin(
      typeof window !== "undefined" ? window.location.origin : "",
    );
  }, []);

  useEffect(() => {
    setSettings(loadBoothSettings());
  }, []);

  useEffect(() => {
    saveBoothSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (staffOpened.current) return;
    if (searchParams.get("staff") === "1") {
      staffOpened.current = true;
      setAdminOpen(true);
    }
  }, [searchParams]);

  const openStaff = useCallback(() => {
    setAdminOpen(true);
  }, []);

  const handleSignOut = useCallback(() => {
    void fetch("/api/auth/booth-logout", { method: "POST" }).then(() => {
      window.location.href = "/login";
    });
  }, []);

  const { longPressProps } = useLongPress(2200, openStaff);

  const staffMarkProps: BoothStaffPressProps = longPressProps;

  useEffect(() => {
    if (step !== "camera") {
      stop();
      return;
    }
    if (cameraStartedInGesture.current) {
      cameraStartedInGesture.current = false;
      return () => {
        stop();
      };
    }
    void start();
    return () => {
      stop();
    };
    // Intentionally only step: facing flips are handled inside the camera hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== "print") return;
    setPrinterConn("checking");
    setPrintPhase("idle");
    const t = setTimeout(() => setPrinterConn("ready"), 700);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(
    () => () => {
      if (countTimer.current) clearInterval(countTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (step === "camera") return;
    if (countTimer.current) {
      clearInterval(countTimer.current);
      countTimer.current = null;
    }
    setIsCounting(false);
    setCountDisplay(null);
  }, [step]);

  useEffect(() => {
    if (
      (step === "preview" || step === "receipt" || step === "print") &&
      (capturedPhotos.length === 0 || !capturedAt)
    ) {
      setStep("welcome");
    }
  }, [step, capturedPhotos, capturedAt]);

  const receiptProps = useMemo(() => {
    if (!capturedPhotos.length || !capturedAt) return null;
    const [lead, ...rest] = capturedPhotos;
    if (!lead) return null;
    return boothSettingsToReceiptProps(
      settings,
      lead,
      rest,
      capturedAt,
      customerLayoutId,
    );
  }, [settings, capturedPhotos, capturedAt, customerLayoutId]);

  const handleCapture = useCallback(() => {
    if (isCounting || !stream) return;
    setIsCounting(true);
    let remaining = countdownChoice;
    setCountDisplay(remaining);
    if (countTimer.current) clearInterval(countTimer.current);
    countTimer.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countTimer.current) clearInterval(countTimer.current);
        countTimer.current = null;
        setCountDisplay(null);
        setIsCounting(false);
        void (async () => {
          const url = await captureDataUrl();
          if (url) {
            if (!capturedAt) setCapturedAt(new Date());
            setCapturedPhotos((prev) => {
              const next = [...prev, url];
              return next.slice(0, receiptPhotoCount);
            });
            setStep("preview");
          }
        })();
      } else {
        setCountDisplay(remaining);
      }
    }, 1000);
  }, [isCounting, stream, countdownChoice, captureDataUrl, capturedAt, receiptPhotoCount]);

  const resetSession = useCallback(() => {
    setCapturedPhotos([]);
    setCapturedAt(null);
    setCopies(1);
    setPrintPhase("idle");
    setIsPrinting(false);
    setIsCounting(false);
    setCountDisplay(null);
    if (countTimer.current) clearInterval(countTimer.current);
    countTimer.current = null;
    setDigitalSlipStatus("idle");
    setDigitalSlipError(null);
    setDigitalToken(null);
    setCustomerLayoutId("classic");
    setReceiptPhotoCount(2);
    resetCameraDefaults();
  }, [resetCameraDefaults]);

  const handleWelcomeStart = useCallback(() => {
    resetSession();
    setStep("layout");
  }, [resetSession]);

  const handleStartOver = useCallback(() => {
    resetSession();
    setStep("welcome");
  }, [resetSession]);

  const handleTestPrint = useCallback(() => {
    setToast("Demo: test strip queued. Connect hardware to go live.");
    setTimeout(() => setToast(null), 4200);
  }, []);

  const captureFinalLayout = useCallback(async (): Promise<string | null> => {
    const exportEl = document.getElementById(
      "booth-receipt-export",
    ) as HTMLElement | null;
    if (!receiptProps) return finalLayoutSnapRef.current;
    if (!exportEl) {
      const fb = await renderFallbackReceiptDataUrl(receiptProps);
      if (fb) finalLayoutSnapRef.current = fb;
      return fb ?? finalLayoutSnapRef.current;
    }
    for (let i = 0; i < 3; i += 1) {
      const snap = await captureReceiptPrintRoot(exportEl, {
        pixelRatio: 1.35,
        quality: 0.84,
      });
      if (snap) {
        finalLayoutSnapRef.current = snap;
        return snap;
      }
      await delay(90);
    }
    const fallback = await renderFallbackReceiptDataUrl(receiptProps);
    if (fallback) {
      finalLayoutSnapRef.current = fallback;
      return fallback;
    }
    return finalLayoutSnapRef.current;
  }, [receiptProps]);

  useEffect(() => {
    if (!(step === "receipt" || step === "print")) return;
    if (!receiptProps) return;
    let cancelled = false;
    void (async () => {
      const snap = await captureFinalLayout();
      if (cancelled || !snap) return;
      finalLayoutSnapRef.current = snap;
    })();
    return () => {
      cancelled = true;
    };
  }, [step, receiptProps, captureFinalLayout]);

  const handlePrint = useCallback(async () => {
    if (!receiptProps) return;
    const layoutSnap = await captureFinalLayout();
    setIsPrinting(true);
    setPrintPhase("sending");
    setPrinterConn("ready");
    const per = 1500;
    await delay(per * copies);
    setPrintPhase("done");
    setIsPrinting(false);
    await delay(650);
    setDigitalToken(null);
    setDigitalSlipError(null);
    setDigitalSlipStatus("creating");
    setStep("done");
    if (!layoutSnap) {
      setDigitalSlipError("Layout capture returned empty.");
      setDigitalSlipStatus("fail");
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/digital-slip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layoutDataUrl: layoutSnap,
          }),
        });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok) throw new Error(data.error || `Could not create link (${res.status})`);
        if (!data.token) throw new Error("Missing token");
        setDigitalToken(data.token);
        setDigitalSlipStatus("ready");
      } catch (e) {
        setDigitalSlipError(e instanceof Error ? e.message : "Unknown error creating link.");
        setDigitalSlipStatus("fail");
      }
    })();
  }, [receiptProps, copies, captureFinalLayout]);

  const handleQrOnly = useCallback(async () => {
    if (!receiptProps) return;
    const layoutSnap = await captureFinalLayout();
    setDigitalToken(null);
    setDigitalSlipError(null);
    setDigitalSlipStatus("creating");
    setStep("done");
    if (!layoutSnap) {
      setDigitalSlipError("Layout capture returned empty.");
      setDigitalSlipStatus("fail");
      return;
    }
    try {
      const res = await fetch("/api/digital-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutDataUrl: layoutSnap,
        }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `Could not create link (${res.status})`);
      if (!data.token) throw new Error("Missing token");
      setDigitalToken(data.token);
      setDigitalSlipStatus("ready");
      setToast("QR test ready — no printer needed.");
      setTimeout(() => setToast(null), 3200);
    } catch (e) {
      setDigitalSlipError(e instanceof Error ? e.message : "Unknown error creating link.");
      setDigitalSlipStatus("fail");
    }
  }, [receiptProps, captureFinalLayout]);

  const handleLayoutContinue = useCallback(() => {
    const lensForSession =
      receiptPhotoCount > 1 ? ("wide06" as const) : ("normal" as const);
    cameraStartedInGesture.current = true;
    flushSync(() => {
      setBackLens(lensForSession);
      setStep("camera");
    });
    void start({ lens: lensForSession });
  }, [receiptPhotoCount, setBackLens, start]);

  const handlePhotoCountChange = useCallback(
    (count: ReceiptPhotoCount) => {
      if (!availablePhotoCounts.includes(count)) return;
      setReceiptPhotoCount(count);
    },
    [availablePhotoCounts],
  );

  const digitalViewUrl = useMemo(() => {
    if (!digitalToken || !origin) return null;
    const base = resolveBoothPublicOrigin(settings.publicSiteUrl, origin);
    return `${base}/receipt/${digitalToken}`;
  }, [digitalToken, origin, settings.publicSiteUrl]);

  const handleSubmitDigitalEmail = useCallback(
    async (email: string) => {
      if (!digitalToken) {
        return { ok: false, message: "Digital link is not ready yet." };
      }
      try {
        const res = await fetch("/api/digital-slip", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: digitalToken, email }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          return {
            ok: false,
            message: data.error || "Could not save your email.",
          };
        }
        return {
          ok: true,
          message:
            "Saved. We’ll email your receipt keepsake when outbound mail is connected.",
        };
      } catch {
        return { ok: false, message: "Network error. Try again." };
      }
    },
    [digitalToken],
  );

  return (
    <>
      <InsecureNetworkBanner />
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] max-w-sm -translate-x-1/2 rounded-2xl bg-[var(--booth-ink)] px-5 py-3 text-center text-xs font-medium text-[var(--booth-cream)] shadow-lg">
          {toast}
        </div>
      ) : null}

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        settings={settings}
        onChange={setSettings}
        gallery={gallery}
        onTestPrint={handleTestPrint}
        onSignOut={handleSignOut}
      />

      {step === "welcome" ? (
        <WelcomeScreen
          onStart={handleWelcomeStart}
          staffMarkProps={staffMarkProps}
        />
      ) : null}

      {step === "camera" ? (
        <CameraScreen
          videoRef={videoRef}
          countdownChoice={countdownChoice}
          onCountdownChange={setCountdownChoice}
          backLens={backLens}
          onBackLensChange={setBackLens}
          hasUltraWideBack={hasUltraWideBack}
          facingMode={facingMode}
          onCapture={handleCapture}
          onSwitchCamera={() => void switchCamera()}
          onBack={() => {
            stop();
            setStep("layout");
          }}
          error={error}
          isStarting={isStarting}
          hasStream={Boolean(stream)}
          isCounting={isCounting}
          countDisplay={countDisplay}
          staffMarkProps={staffMarkProps}
        />
      ) : null}

      {step === "preview" && capturedPhotos.length > 0 ? (
        <PreviewScreen
          imageSrc={capturedPhotos[capturedPhotos.length - 1]}
          shotIndex={capturedPhotos.length}
          totalShots={receiptPhotoCount}
          onRetake={() => {
            setCapturedPhotos((prev) => prev.slice(0, -1));
            if (capturedPhotos.length <= 1) {
              setCapturedAt(null);
            }
            setStep("camera");
          }}
          onContinue={() => {
            const latest = capturedPhotos[capturedPhotos.length - 1];
            if (latest && capturedPhotos.length >= receiptPhotoCount) {
              const item: BoothGalleryItem = {
                id:
                  typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),
                dataUrl: latest,
                createdAt: new Date().toISOString(),
              };
              setGallery((g) => [item, ...g].slice(0, 48));
              setStep("receipt");
              return;
            }
            setStep("camera");
          }}
        />
      ) : null}

      {step === "layout" ? (
        <LayoutSelectScreen
          selectedId={customerLayoutId}
          onSelect={setCustomerLayoutId}
          photoCount={receiptPhotoCount}
          onPhotoCountChange={handlePhotoCountChange}
          availablePhotoCounts={availablePhotoCounts}
          paperWidthLabel={settings.paperWidth}
          miniGridEnabled={miniGridEnabled}
          onBack={() => setStep("welcome")}
          onContinue={handleLayoutContinue}
        />
      ) : null}

      {step === "receipt" && receiptProps ? (
        <ReceiptReviewScreen
          receiptProps={receiptProps}
          onBack={() => setStep("preview")}
          onContinue={() => setStep("print")}
        />
      ) : null}

      {step === "print" && receiptProps ? (
        <PrintScreen
          copies={copies}
          onCopiesChange={setCopies}
          printerLabel={printerLabelFromSettings(settings)}
          connection={printerConn}
          isPrinting={isPrinting}
          printPhase={printPhase}
          onPrint={() => void handlePrint()}
          onQrOnly={() => void handleQrOnly()}
          onBack={() => setStep("receipt")}
        />
      ) : null}

      {step === "done" ? (
        <DoneScreen
          showQrHint={settings.showConnectBlock}
          instagramText={settings.instagramText}
          onStartOver={handleStartOver}
          digitalSlipStatus={digitalSlipStatus}
          digitalSlipError={digitalSlipError}
          digitalViewUrl={digitalViewUrl}
          onSubmitEmail={handleSubmitDigitalEmail}
        />
      ) : null}

      {receiptProps && (step === "receipt" || step === "print") ? (
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 z-[-1]"
          style={{ left: "calc(100vw + 64px)", width: "max-content", height: "max-content" }}
        >
          <ReceiptPrintLayout {...receiptProps} id="booth-receipt-export" />
        </div>
      ) : null}
    </>
  );
}
