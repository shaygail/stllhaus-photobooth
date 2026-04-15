import { NextResponse } from "next/server";
import { bufferAsResponseBody } from "@/lib/buffer-response-body";
import { resolveLayoutJpeg } from "@/lib/digital-slip-resolve";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const resolved = await resolveLayoutJpeg(token);
  if (!resolved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const bytes = resolved.bytes;
    const body = bufferAsResponseBody(bytes);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": 'inline; filename="stllhaus-receipt.jpg"',
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid receipt image" }, { status: 500 });
  }
}
