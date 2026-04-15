import { NextResponse } from "next/server";
import { resolveReceiptKeepsakeMeta } from "@/lib/digital-slip-resolve";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const meta = await resolveReceiptKeepsakeMeta(token);
  if (!meta) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    createdAt: meta.createdAt,
    assetUrl: `/api/receipt/${encodeURIComponent(token)}/asset`,
    downloadUrl: `/api/receipt/${encodeURIComponent(token)}/download`,
  });
}
