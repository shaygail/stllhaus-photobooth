"use client";

import type { BoothGalleryItem, BoothSettings } from "@/types/booth";
import { BoothTapButton } from "@/components/booth/BoothTapButton";

type AdminPanelProps = {
  open: boolean;
  onClose: () => void;
  settings: BoothSettings;
  onChange: (next: BoothSettings) => void;
  gallery: BoothGalleryItem[];
  onTestPrint: () => void;
  onSignOut?: () => void;
};

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--booth-cream)]/80 px-4 py-3 ring-1 ring-black/5">
      <span className="text-sm text-[var(--booth-ink)]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[var(--booth-ink)]"
      />
    </label>
  );
}

export function AdminPanel({
  open,
  onClose,
  settings,
  onChange,
  gallery,
  onTestPrint,
  onSignOut,
}: AdminPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-[2px]">
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-[var(--booth-stone)] shadow-2xl"
        role="dialog"
        aria-label="Staff settings"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-[var(--booth-stone)]/95 px-5 py-4 backdrop-blur-md">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--booth-walnut)]/60">
              Staff
            </p>
            <h2 className="text-lg font-medium text-[var(--booth-ink)]">
              Booth settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--booth-walnut)] hover:bg-black/[0.05]"
          >
            Close
          </button>
        </div>

        <div className="space-y-8 px-5 py-6">
          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Printer
            </h3>
            <label className="block text-sm text-[var(--booth-ink)]">
              Profile
              <select
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-3 text-sm"
                value={settings.printerProfile}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    printerProfile: e.target.value as BoothSettings["printerProfile"],
                  })
                }
              >
                <option value="xprinter_80">Xprinter · 80mm desk</option>
                <option value="bluetooth_portable">
                  Portable Bluetooth (58 / 80)
                </option>
              </select>
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              Paper width
              <select
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-3 text-sm"
                value={settings.paperWidth}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    paperWidth: e.target.value as BoothSettings["paperWidth"],
                  })
                }
              >
                <option value="80mm">80mm</option>
                <option value="58mm">58mm</option>
              </select>
            </label>
            <p className="text-xs leading-relaxed text-[var(--booth-walnut)]/75">
              Hardware routing comes next — this panel controls layout, copy,
              and how the strip reads on paper.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Phone links (digital keepsake)
            </h3>
            <label className="block text-sm text-[var(--booth-ink)]">
              Public site URL (no trailing slash)
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 font-mono text-xs"
                placeholder="https://192.168.1.10:3000"
                value={settings.publicSiteUrl}
                onChange={(e) =>
                  onChange({ ...settings, publicSiteUrl: e.target.value })
                }
              />
            </label>
            <p className="text-xs leading-relaxed text-[var(--booth-walnut)]/75">
              If the booth runs on <strong>localhost</strong>, the QR for the
              colour keepsake must use your Mac&apos;s <strong>Wi‑Fi URL</strong>{" "}
              (same port), or phones open <em>their</em> localhost and downloads
              fail. You can also set{" "}
              <code className="rounded bg-black/[0.06] px-1 font-mono text-[11px]">
                NEXT_PUBLIC_BOOTH_PUBLIC_URL
              </code>{" "}
              in <code className="font-mono text-[11px]">.env.local</code>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Receipt blocks
            </h3>
            <div className="space-y-2">
              <ToggleRow
                label="Tagline under wordmark"
                checked={settings.showTagline}
                onChange={(v) => onChange({ ...settings, showTagline: v })}
              />
              <ToggleRow
                label="Date · time · place · event"
                checked={settings.showMetaBlock}
                onChange={(v) => onChange({ ...settings, showMetaBlock: v })}
              />
              <ToggleRow
                label="Brand message line"
                checked={settings.showMessageBlock}
                onChange={(v) => onChange({ ...settings, showMessageBlock: v })}
              />
              <ToggleRow
                label="Instagram / site / QR block"
                checked={settings.showConnectBlock}
                onChange={(v) => onChange({ ...settings, showConnectBlock: v })}
              />
              <ToggleRow
                label="QR code (when connect on)"
                checked={settings.showQr}
                onChange={(v) => onChange({ ...settings, showQr: v })}
              />
              <ToggleRow
                label="Bottom ornament"
                checked={settings.showEndOrnament}
                onChange={(v) => onChange({ ...settings, showEndOrnament: v })}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Thermal tuning
            </h3>
            <label className="block text-sm text-[var(--booth-ink)]">
              Brightness ({settings.thermalBrightness.toFixed(2)})
              <input
                type="range"
                min={0.85}
                max={1.18}
                step={0.01}
                value={settings.thermalBrightness}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    thermalBrightness: Number(e.target.value),
                  })
                }
                className="mt-2 w-full accent-[var(--booth-ink)]"
              />
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              Contrast ({settings.thermalContrast.toFixed(2)})
              <input
                type="range"
                min={1.02}
                max={1.48}
                step={0.01}
                value={settings.thermalContrast}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    thermalContrast: Number(e.target.value),
                  })
                }
                className="mt-2 w-full accent-[var(--booth-ink)]"
              />
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Copy
            </h3>
            <label className="block text-sm text-[var(--booth-ink)]">
              Event label
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 text-sm"
                value={settings.eventLabel}
                onChange={(e) =>
                  onChange({ ...settings, eventLabel: e.target.value })
                }
              />
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              Brand message
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 text-sm"
                value={settings.messageText}
                onChange={(e) =>
                  onChange({ ...settings, messageText: e.target.value })
                }
              />
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              Instagram
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 text-sm"
                value={settings.instagramText}
                onChange={(e) =>
                  onChange({ ...settings, instagramText: e.target.value })
                }
              />
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              Website
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 text-sm"
                value={settings.websiteText}
                onChange={(e) =>
                  onChange({ ...settings, websiteText: e.target.value })
                }
              />
            </label>
            <label className="block text-sm text-[var(--booth-ink)]">
              QR destination URL
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--booth-cream)] px-3 py-2.5 text-sm"
                value={settings.qrCodeUrl}
                onChange={(e) =>
                  onChange({ ...settings, qrCodeUrl: e.target.value })
                }
              />
            </label>
          </section>

          <BoothTapButton variant="secondary" onClick={onTestPrint}>
            Test print (demo)
          </BoothTapButton>

          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-2xl border border-red-200/90 bg-red-50/90 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-red-900 transition hover:bg-red-100"
            >
              Sign out (booth lock)
            </button>
          ) : null}

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--booth-walnut)]/55">
              Today&apos;s captures ({gallery.length})
            </h3>
            {gallery.length === 0 ? (
              <p className="text-sm text-[var(--booth-walnut)]/70">
                Frames appear here after guests tap Continue on the colour
                preview.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((g) => (
                  <div
                    key={g.id}
                    className="overflow-hidden rounded-xl bg-[var(--booth-cream)] ring-1 ring-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.dataUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
