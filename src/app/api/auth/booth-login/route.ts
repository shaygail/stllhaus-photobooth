import { NextResponse } from "next/server";
import {
  BOOTH_SESSION_COOKIE,
  createBoothSessionToken,
  isBoothPasswordConfigured,
  verifyBoothPassword,
} from "@/lib/booth-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isBoothPasswordConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server is not configured: set BOOTH_PASSWORD in the environment (see .env.example).",
      },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!verifyBoothPassword(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = createBoothSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BOOTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
