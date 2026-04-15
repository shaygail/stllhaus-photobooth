import { NextResponse } from "next/server";
import { bufferAsResponseBody } from "@/lib/buffer-response-body";
import { resolveLayoutJpeg } from "@/lib/digital-slip-resolve";

export const runtime = "nodejs";

/** Inline JPEG of the composed receipt strip (DOM raster of ReceiptPrintLayout) */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const resolved = await resolveLayoutJpeg(token);
  if (!resolved) {
    return NextResponse.json({ error: "Layout unavailable" }, { status: 404 });
  }
  try {
    const bytes = resolved.bytes;
    const body = bufferAsResponseBody(bytes);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": 'inline; filename="stllhaus-layout.jpg"',
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid layout image" }, { status: 500 });
  }
}
