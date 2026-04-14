"use client";

import {
  inferBackCamerasFromDevices,
  type BackLens,
} from "@/lib/camera-back-lenses";
import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "environment" | "user";

export type { BackLens };

export type StartCameraOptions = {
  /** When set, used instead of current `backLens` state (avoids stale state on first open). */
  lens?: BackLens;
};

type UseBoothCameraResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  facingMode: CameraFacing;
  backLens: BackLens;
  setBackLens: (l: BackLens) => void;
  /** True when a separate ultra-wide back camera was detected (0.5× option). */
  hasUltraWideBack: boolean;
  /** Front-facing default + 1× back lens; call on new guest session. */
  resetCameraDefaults: () => void;
  isStarting: boolean;
  start: (opts?: StartCameraOptions) => Promise<void>;
  stop: () => void;
  switchCamera: () => Promise<void>;
  captureDataUrl: () => Promise<string | null>;
};

export function useBoothCamera(): UseBoothCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const backLensRef = useRef<BackLens>("normal");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>("user");
  const [backLens, setBackLensState] = useState<BackLens>("normal");
  const [hasUltraWideBack, setHasUltraWideBack] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  backLensRef.current = backLens;

  const stop = useCallback(() => {
    const s = streamRef.current;
    if (s) s.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(
    async (opts?: StartCameraOptions) => {
      const lens = opts?.lens ?? backLensRef.current;
      setError(null);
      setIsStarting(true);
      stop();
      try {
        if (typeof window !== "undefined" && !window.isSecureContext) {
          throw new Error(
            "HTTPS is required here: Safari blocks the camera on plain http:// plus your Wi‑Fi IP. On the Mac running the booth, use npm run dev:lan, then open the https://… URL (tap Advanced → Continue once for the dev certificate).",
          );
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not expose a camera API.");
        }

        if (facingMode === "user") {
          setHasUltraWideBack(false);
          const s = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "user" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
          streamRef.current = s;
          setStream(s);
          const v = videoRef.current;
          if (v) {
            v.srcObject = s;
            await v.play().catch(() => {});
          }
          return;
        }

        let s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        const { normal, ultraWide } = inferBackCamerasFromDevices(
          await navigator.mediaDevices.enumerateDevices(),
        );
        setHasUltraWideBack(Boolean(ultraWide));

        const wantId =
          lens === "wide06" && ultraWide ? ultraWide : normal ?? null;

        const currentId = s.getVideoTracks()[0]?.getSettings().deviceId;
        if (wantId && currentId && wantId !== currentId) {
          try {
            const s2 = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: wantId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
              audio: false,
            });
            s.getTracks().forEach((t) => t.stop());
            s = s2;
          } catch {
            /* keep the first back stream */
          }
        }

        streamRef.current = s;
        setStream(s);
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          await v.play().catch(() => {});
        }
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Camera unavailable. Check permissions.";
        setError(msg);
      } finally {
        setIsStarting(false);
      }
    },
    [facingMode, stop],
  );

  const setBackLens = useCallback(
    (l: BackLens) => {
      backLensRef.current = l;
      setBackLensState(l);
      if (streamRef.current) {
        stop();
        void start({ lens: l });
      }
    },
    [start, stop],
  );

  const switchCamera = useCallback(async () => {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  }, []);

  const resetCameraDefaults = useCallback(() => {
    setFacingMode("user");
    backLensRef.current = "normal";
    setBackLensState("normal");
  }, []);

  useEffect(() => {
    if (!streamRef.current) return;
    stop();
    void start();
  }, [facingMode, start, stop]);

  useEffect(() => {
    if (!hasUltraWideBack && backLens === "wide06") {
      setBackLens("normal");
    }
  }, [hasUltraWideBack, backLens, setBackLens]);

  useEffect(() => () => stop(), [stop]);

  const captureDataUrl = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;

    // Match the booth frame: centered 3:4 portrait crop from the live stream.
    const targetAspect = 3 / 4;
    const sourceAspect = w / h;
    let sx = 0;
    let sy = 0;
    let sw = w;
    let sh = h;

    if (sourceAspect > targetAspect) {
      // Source is wider: crop horizontal sides.
      sw = h * targetAspect;
      sx = (w - sw) / 2;
    } else if (sourceAspect < targetAspect) {
      // Source is taller: crop top/bottom.
      sh = w / targetAspect;
      sy = (h - sh) / 2;
    }

    const outW = 1200;
    const outH = Math.round(outW / targetAspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    try {
      return canvas.toDataURL("image/jpeg", 0.92);
    } catch {
      return null;
    }
  }, []);

  return {
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
  };
}
