"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import type { ComboPack } from "@/data/combos";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { validateCatalogImageDataUrl } from "@/lib/catalog-media";

export default function AdminCombosPanel() {
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/combos");
    const data = await res.json();
    setCombos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/combos")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCombos(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (index: number, patch: Partial<ComboPack>) => {
    setCombos((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const handleImagePick = async (index: number, dataUrl: string) => {
    const validationError = validateCatalogImageDataUrl(dataUrl);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((data as { error?: string }).error || "Image upload failed");
      return;
    }
    update(index, { imageDataUrl: dataUrl, imagePath: "" });
    setMessage("Photo added — click Save all to publish.");
  };

  const addCombo = () => {
    setCombos((list) => [
      ...list,
      {
        id: `combo-${Date.now()}`,
        name: "New combo",
        description: "",
        items: "",
        priceINR: 0,
        originalPriceINR: 0,
        available: true,
        imagePath: "",
      },
    ]);
  };

  const remove = (index: number) => {
    if (!confirm("Delete this combo?")) return;
    setCombos((list) => list.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/combos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(combos),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setMessage("Saved.");
      load();
    } else {
      setMessage((data as { error?: string }).error || "Save failed");
    }
  };

  if (loading) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl w-full overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Combo packs</h1>
          <p className="text-sm text-muted mt-1">English + Telugu names shown on the shop</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCombo}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save all
          </button>
        </div>
      </div>

      {message && (
        <p className={`mt-4 text-sm font-medium ${message === "Saved." ? "text-forest" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {combos.map((c, i) => (
          <article key={c.id} className="rounded-xl border border-border bg-surface-elevated p-5 space-y-3">
            <div className="flex justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.available !== false}
                  onChange={(e) => update(i, { available: e.target.checked })}
                />
                Visible on site
              </label>
              <button type="button" onClick={() => remove(i)} className="text-red-600 p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-muted">Name (EN)</span>
                <input
                  value={c.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">పేరు (TE)</span>
                <input
                  value={c.nameTelugu ?? ""}
                  onChange={(e) => update(i, { nameTelugu: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
            <AdminImageUpload
              label="Combo photo"
              previewSrc={c.imageDataUrl || c.imagePath || undefined}
              onPick={(dataUrl) => void handleImagePick(i, dataUrl)}
              onClear={() => update(i, { imageDataUrl: undefined, imagePath: "" })}
            />
            <label className="block">
              <span className="text-xs text-muted">Description (EN)</span>
              <textarea
                value={c.description}
                onChange={(e) => update(i, { description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">వివరం (TE)</span>
              <textarea
                value={c.descriptionTelugu ?? ""}
                onChange={(e) => update(i, { descriptionTelugu: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-muted">Price ₹</span>
                <input
                  type="number"
                  value={c.priceINR}
                  onChange={(e) => update(i, { priceINR: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Was ₹</span>
                <input
                  type="number"
                  value={c.originalPriceINR}
                  onChange={(e) => update(i, { originalPriceINR: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Items (EN)</span>
                <input
                  value={c.items}
                  onChange={(e) => update(i, { items: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
