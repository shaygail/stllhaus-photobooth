import type { Metadata } from "next";
import { DigitalKeepsakeClient } from "@/components/digital/DigitalKeepsakeClient";
import { DigitalRouteBoundary } from "@/components/digital/DigitalRouteBoundary";

export const metadata: Metadata = {
  title: "Your STLL HAUS moment",
  description: "Colour keepsake from the STLL HAUS photobooth.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DigitalKeepsakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = typeof raw === "string" ? raw : "";
  if (!token.trim()) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#f4f1ec] px-6 text-center text-stone-700"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <p className="text-lg font-medium">Invalid link</p>
        <p className="max-w-sm text-sm text-stone-600">
          This QR code is incomplete. Ask staff for a new keepsake link.
        </p>
      </div>
    );
  }

  return (
    <DigitalRouteBoundary>
      <DigitalKeepsakeClient token={token} />
    </DigitalRouteBoundary>
  );
}
