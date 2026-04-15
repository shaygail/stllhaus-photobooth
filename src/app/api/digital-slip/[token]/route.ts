import { NextResponse } from "next/server";
import { resolveSlipSummary } from "@/lib/digital-slip-resolve";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const summary = await resolveSlipSummary(token);
  if (!summary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    createdAt: new Date(summary.createdAt).toISOString(),
    hasLayout: summary.hasLayout,
  });
}
