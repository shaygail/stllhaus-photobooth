import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f4f1ec] px-6 py-16 text-center text-stone-800">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
          STLL HAUS
        </p>
        <h1 className="max-w-md text-3xl font-light tracking-tight text-stone-900">
          A space for stillness
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-600">
          Market photobooth for New Plymouth — warm, soft, and receipt-sized.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/booth"
          className="rounded-full border border-stone-800 bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
        >
          Open photobooth
        </Link>
        <Link
          href="/receipt-preview"
          className="rounded-full border border-stone-300 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-800 transition hover:bg-white"
        >
          Thermal layout lab
        </Link>
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
          Staff: add{" "}
          <span className="font-mono text-[11px] normal-case tracking-normal">
            ?staff=1
          </span>{" "}
          to the booth URL for settings
        </p>
      </div>
    </main>
  );
}
