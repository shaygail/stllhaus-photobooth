import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isBoothPasswordConfigured } from "@/lib/booth-session";

export const metadata: Metadata = {
  title: "Booth sign in — STLL HAUS",
  description: "Staff access to the photobooth.",
  robots: { index: false, follow: false },
};

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f1ec] text-sm text-stone-600">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  const passwordConfigured = isBoothPasswordConfigured();
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm passwordConfigured={passwordConfigured} />
    </Suspense>
  );
}
