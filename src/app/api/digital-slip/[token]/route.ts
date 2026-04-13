import { NextResponse } from "next/server";
import { getDigitalSlip } from "@/lib/digital-slip-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const slip = getDigitalSlip(token);
  if (!slip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    createdAt: new Date(slip.createdAt).toISOString(),
    hasLayout: Boolean(slip.layoutDataUrl),
  });
}
