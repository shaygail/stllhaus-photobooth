"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginFormProps = {
  passwordConfigured: boolean;
};

export function LoginForm({ passwordConfigured }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next") ?? "/booth";
  const nextPath =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/booth";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/booth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not sign in.");
        return;
      }
      window.location.assign(nextPath);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[#f4f1ec] px-6 py-16"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm space-y-2 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
          STLL HAUS
        </p>
        <h1 className="text-2xl font-light tracking-tight text-stone-900">
          Booth access
        </h1>
        <p className="text-sm text-stone-600">
          Enter the staff password to open the photobooth. Guest QR links (
          <code className="text-[11px]">/digital/…</code>) stay public.
        </p>
        {!passwordConfigured ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Server missing <code className="font-mono">BOOTH_PASSWORD</code> — add
            it to <code className="font-mono">.env.local</code> and restart Next.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white/90 p-6 shadow-lg ring-1 ring-black/[0.06]"
      >
        <label className="block text-sm text-stone-800">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-base outline-none ring-0 focus:border-stone-500"
            required
            disabled={busy}
          />
        </label>
        {error ? (
          <p className="text-center text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-stone-900 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-sm text-stone-500 underline underline-offset-2"
      >
        Back to home
      </button>
    </div>
  );
}
