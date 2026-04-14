import type { Metadata } from "next";
import { ReceiptKeepsakeClient } from "@/components/receipt/ReceiptKeepsakeClient";

export const metadata: Metadata = {
  title: "Your STLL HAUS receipt",
  description: "Download your final STLL HAUS photobooth receipt strip.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: raw } = await params;
  const token = typeof raw === "string" ? raw : "";
  if (!token.trim()) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#f4f1ec] px-6 text-center text-stone-700">
        <p className="text-lg font-medium">Invalid link</p>
        <p className="max-w-sm text-sm text-stone-600">
          This QR code is incomplete. Ask staff for a new receipt link.
        </p>
      </div>
    );
  }
  return <ReceiptKeepsakeClient token={token} />;
}
