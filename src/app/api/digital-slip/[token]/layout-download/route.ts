import { NextResponse } from "next/server";
import { bufferAsResponseBody } from "@/lib/buffer-response-body";
import { resolveLayoutJpeg } from "@/lib/digital-slip-resolve";

export const runtime = "nodejs";

/** Attachment download for the composed receipt strip JPEG */
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
    const safe = token.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12) || "layout";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `attachment; filename="stllhaus-layout-${safe}.jpg"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid layout image" }, { status: 500 });
  }
}
