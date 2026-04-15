import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  attachEmailToSlip,
  createDigitalSlip,
} from "@/lib/digital-slip-store";
import {
  BOOTH_SESSION_COOKIE,
  verifyBoothSessionToken,
} from "@/lib/booth-session";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireBoothSession(): Promise<boolean> {
  const cookie = (await cookies()).get(BOOTH_SESSION_COOKIE)?.value;
  return verifyBoothSessionToken(cookie);
}

export async function POST(request: Request) {
  if (!(await requireBoothSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as {
      imageDataUrl?: string;
      layoutDataUrl?: string;
    };
    const token = await createDigitalSlip(body.imageDataUrl ?? "", body.layoutDataUrl);
    return NextResponse.json({ token, receiptUrl: `/receipt/${token}` });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireBoothSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { token?: string; email?: string };
    const email = (body.email ?? "").trim();
    const token = body.token ?? "";
    if (!token || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid token or email" }, { status: 400 });
    }
    const ok = await attachEmailToSlip(token, email);
    if (!ok) {
      return NextResponse.json({ error: "Slip not found or expired" }, { status: 404 });
    }
    // Stub: wire to Resend / SendGrid / Postmark in production.
    console.info("[digital-slip] email requested", { token, email });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
