import { NextResponse } from "next/server";
import { bufferFromImageDataUrl } from "@/lib/data-url-to-buffer";
import { getDigitalSlip } from "@/lib/digital-slip-store";

export const runtime = "nodejs";

/** Inline JPEG for `<img src>` — same-origin, works well on iOS Safari */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const slip = getDigitalSlip(token);
  if (!slip || !slip.imageDataUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = bufferFromImageDataUrl(slip.imageDataUrl);
    const bytes = new Uint8Array(body);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": 'inline; filename="stllhaus-moment.jpg"',
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid image" }, { status: 500 });
  }
}
