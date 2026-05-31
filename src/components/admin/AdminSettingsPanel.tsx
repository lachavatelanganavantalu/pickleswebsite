"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { BilingualText, SiteSettings } from "@/types/site-settings";

function BilingualField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: BilingualText;
  onChange: (v: BilingualText) => void;
  multiline?: boolean;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <label className="block">
        <span className="text-xs text-muted">English</span>
        <Input
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          rows={multiline ? 3 : undefined}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted">తెలుగు (simple daily usage)</span>
        <Input
          value={value.te}
          onChange={(e) => onChange({ ...value, te: e.target.value })}
          rows={multiline ? 3 : undefined}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
    </div>
  );
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/settings")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load settings");
        return data as SiteSettings;
      })
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setMessage("Could not load settings — log in again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      res.ok
        ? "Saved — refresh the homepage to see changes."
        : (data as { error?: string }).error || "Save failed"
    );
  };

  if (!settings) return <p className="p-8 text-muted">Loading…</p>;

  const setBilingual = (
    section: keyof SiteSettings,
    field: string,
    value: BilingualText
  ) => {
    setSettings((s) => {
      if (!s) return s;
      const block = s[section] as Record<string, BilingualText | string>;
      return {
        ...s,
        [section]: { ...block, [field]: value },
      };
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl w-full overflow-x-hidden">
      <h1 className="font-display text-2xl text-ink">Site settings</h1>
      <p className="text-sm text-muted mt-1">
        Edit homepage and contact in English and Telugu. Customers switch language with EN / తె.
      </p>

      <div className="mt-8 space-y-4">
        <h2 className="font-semibold text-ink">Top banner</h2>
        <BilingualField
          label="Announcement bar"
          value={settings.announcement}
          onChange={(v) => setSettings((s) => s && { ...s, announcement: v })}
          multiline
        />

        <h2 className="font-semibold text-ink pt-4">Homepage hero</h2>
        <BilingualField
          label="Badge"
          value={settings.hero.badge}
          onChange={(v) => setBilingual("hero", "badge", v)}
        />
        <BilingualField
          label="Headline"
          value={settings.hero.title}
          onChange={(v) => setBilingual("hero", "title", v)}
        />
        <BilingualField
          label="Subtitle"
          value={settings.hero.subtitle}
          onChange={(v) => setBilingual("hero", "subtitle", v)}
          multiline
        />
        <BilingualField
          label="Veg button"
          value={settings.hero.ctaVeg}
          onChange={(v) => setBilingual("hero", "ctaVeg", v)}
        />
        <BilingualField
          label="Non-veg button"
          value={settings.hero.ctaNonVeg}
          onChange={(v) => setBilingual("hero", "ctaNonVeg", v)}
        />

        <h2 className="font-semibold text-ink pt-4">Story section</h2>
        <BilingualField
          label="Title"
          value={settings.story.title}
          onChange={(v) => setBilingual("story", "title", v)}
        />
        <BilingualField
          label="Subtitle"
          value={settings.story.subtitle}
          onChange={(v) => setBilingual("story", "subtitle", v)}
        />
        <BilingualField
          label="Paragraph 1"
          value={settings.story.body1}
          onChange={(v) => setBilingual("story", "body1", v)}
          multiline
        />
        <BilingualField
          label="Paragraph 2"
          value={settings.story.body2}
          onChange={(v) => setBilingual("story", "body2", v)}
          multiline
        />

        <h2 className="font-semibold text-ink pt-4">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">Phone</span>
            <input
              value={settings.contact.phone}
              onChange={(e) =>
                setSettings((s) =>
                  s ? { ...s, contact: { ...s.contact, phone: e.target.value } } : s
                )
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">WhatsApp number</span>
            <input
              value={settings.contact.whatsapp}
              onChange={(e) =>
                setSettings((s) =>
                  s ? { ...s, contact: { ...s.contact, whatsapp: e.target.value } } : s
                )
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase">Email</span>
          <input
            value={settings.contact.email}
            onChange={(e) =>
              setSettings((s) =>
                s ? { ...s, contact: { ...s.contact, email: e.target.value } } : s
              )
            }
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <BilingualField
          label="Address"
          value={settings.contact.address}
          onChange={(v) =>
            setSettings((s) =>
              s ? { ...s, contact: { ...s.contact, address: v } } : s
            )
          }
        />

        <h2 className="font-semibold text-ink pt-4">Payment (UPI / QR)</h2>
        <p className="text-xs text-muted">
          Shown to customers after they place an order. Upload your PhonePe / GPay QR image.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">UPI ID</span>
            <input
              value={settings.payment?.upiId ?? ""}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        payment: { ...s.payment, upiId: e.target.value },
                      }
                    : s
                )
              }
              placeholder="6302112848@ybl"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">PhonePe / GPay number</span>
            <input
              value={settings.payment?.upiPhone ?? ""}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        payment: { ...s.payment, upiPhone: e.target.value },
                      }
                    : s
                )
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase">Payee name</span>
          <input
            value={settings.payment?.payeeName ?? ""}
            onChange={(e) =>
              setSettings((s) =>
                s
                  ? {
                      ...s,
                      payment: { ...s.payment, payeeName: e.target.value },
                    }
                  : s
              )
            }
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-semibold uppercase text-muted">Payment QR image</p>
          {settings.payment?.qrImagePath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.payment.qrImagePath}
              alt="Current payment QR"
              className="mt-3 max-w-[180px] rounded-lg border border-border"
            />
          )}
          <input
            type="file"
            accept="image/*"
            className="mt-3 block w-full text-sm"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async () => {
                const dataUrl = reader.result as string;
                const res = await fetch("/api/admin/payment-qr", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ dataUrl }),
                });
                const data = await res.json();
                if (res.ok && data.qrImagePath) {
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          payment: { ...s.payment, qrImagePath: data.qrImagePath },
                        }
                      : s
                  );
                  setMessage("QR uploaded — save settings to keep UPI details.");
                } else {
                  setMessage(data.error || "QR upload failed");
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-forest font-medium">{message}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </button>
    </div>
  );
}
