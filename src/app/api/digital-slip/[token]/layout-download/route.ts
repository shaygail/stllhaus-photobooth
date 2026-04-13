import { NextResponse } from "next/server";
import { bufferFromImageDataUrl } from "@/lib/data-url-to-buffer";
import { getDigitalSlip } from "@/lib/digital-slip-store";

export const runtime = "nodejs";

/** Attachment download for the coloured receipt-style layout image */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const slip = getDigitalSlip(token);
  if (!slip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!slip.layoutDataUrl) {
    return NextResponse.json({ error: "Layout unavailable" }, { status: 404 });
  }
  try {
    const body = bufferFromImageDataUrl(slip.layoutDataUrl);
    const bytes = new Uint8Array(body);
    const safe = token.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12) || "layout";
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="stllhaus-layout-${safe}.jpg"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid layout image" }, { status: 500 });
  }
}
