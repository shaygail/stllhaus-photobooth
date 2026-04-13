"use client";

import { BOOTH_PHOTO_DISPLAY_SCALE } from "@/constants/booth-photo";
import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "environment" | "user";

type UseBoothCameraResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  facingMode: CameraFacing;
  isStarting: boolean;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => Promise<void>;
  captureDataUrl: () => Promise<string | null>;
};

export function useBoothCamera(): UseBoothCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>("environment");
  const [isStarting, setIsStarting] = useState(false);

  const stop = useCallback(() => {
    const s = streamRef.current;
    if (s) s.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
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
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
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
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Camera unavailable. Check permissions.";
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  }, [facingMode, stop]);

  const switchCamera = useCallback(async () => {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  }, []);

  useEffect(() => {
    if (!streamRef.current) return;
    stop();
    void start();
  }, [facingMode, start, stop]);

  useEffect(() => () => stop(), [stop]);

  const captureDataUrl = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const s = BOOTH_PHOTO_DISPLAY_SCALE;
    const dw = w * s;
    const dh = h * s;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(video, 0, 0, w, h, dx, dy, dw, dh);
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
    isStarting,
    start,
    stop,
    switchCamera,
    captureDataUrl,
  };
}
