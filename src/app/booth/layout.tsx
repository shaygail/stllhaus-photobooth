import type { ReactNode } from "react";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BOOTH_SESSION_COOKIE,
  verifyBoothSessionToken,
} from "@/lib/booth-session";

/** Booth UI is light-themed; avoids iOS dark chrome painting the page black behind the app */
export const viewport: Viewport = {
  colorScheme: "light",
};

export default async function BoothLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(BOOTH_SESSION_COOKIE)?.value;
  if (!verifyBoothSessionToken(session)) {
    redirect("/login?next=" + encodeURIComponent("/booth"));
  }

  return (
    <div className="min-h-dvh" style={{ colorScheme: "light" }}>
      {children}
    </div>
  );
}
