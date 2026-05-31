"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  PickleProduct,
  ProductCategory,
  ProductTag,
  TAG_LABELS,
} from "@/types/product";
import AdminImageUpload from "./AdminImageUpload";
import { validateCatalogImageDataUrl } from "@/lib/catalog-media";
import { slugify, validateProduct } from "@/lib/product-admin";

const TAGS = Object.keys(TAG_LABELS) as NonNullable<ProductTag>[];

interface Props {
  product: PickleProduct;
  existing: PickleProduct[];
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminProductEditor({
  product: initial,
  existing,
  onClose,
  onSaved,
}: Props) {
  const [product, setProduct] = useState<PickleProduct>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isNew = initial.id.startsWith("new-");

  const update = <K extends keyof PickleProduct>(key: K, value: PickleProduct[K]) => {
    setProduct((p) => ({ ...p, [key]: value }));
  };

  const updateWeight = (
    index: number,
    field: "label" | "priceINR" | "originalPriceINR",
    value: string | number
  ) => {
    setProduct((p) => {
      const opts = [...p.weightOptions];
      const opt = { ...opts[index] };
      if (field === "label") opt.label = String(value);
      else if (field === "priceINR") opt.priceINR = Number(value) || 0;
      else opt.originalPriceINR = Number(value) || undefined;
      opts[index] = opt;
      return { ...p, weightOptions: opts };
    });
  };

  const addWeight = () => {
    setProduct((p) => ({
      ...p,
      weightOptions: [...p.weightOptions, { id: `w-${Date.now()}`, label: "", priceINR: 0 }],
    }));
  };

  const removeWeight = (index: number) => {
    if (product.weightOptions.length <= 1) return;
    setProduct((p) => ({
      ...p,
      weightOptions: p.weightOptions.filter((_, i) => i !== index),
    }));
  };

  const handleImagePick = async (dataUrl: string) => {
    const validationError = validateCatalogImageDataUrl(dataUrl);
    if (validationError) {
      setError(validationError);
      return;
    }
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error || "Image upload failed");
      return;
    }
    setError("");
    setProduct((p) => ({ ...p, imageDataUrl: dataUrl, imagePath: "" }));
  };

  const handleSave = async () => {
    const errors = validateProduct(product, existing, isNew ? undefined : product.id);
    if (errors.length) {
      setError(errors.join("; "));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = isNew
        ? "/api/admin/products"
        : `/api/admin/products/${product.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/40 p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[min(90dvh,100%)] overflow-y-auto overflow-x-hidden rounded-2xl bg-surface-elevated border border-border shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-elevated px-5 py-4">
          <h2 className="font-display text-xl text-ink">
            {isNew ? "New product" : "Edit product"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <AdminImageUpload
            label="Product photo"
            previewSrc={product.imageDataUrl || product.imagePath || undefined}
            onPick={handleImagePick}
            onClear={() =>
              setProduct((p) => ({ ...p, imageDataUrl: undefined, imagePath: "" }))
            }
            disabled={saving}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Name</span>
              <input
                value={product.name}
                onChange={(e) => update("name", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Telugu name</span>
              <input
                value={product.nameTelugu ?? ""}
                onChange={(e) => update("nameTelugu", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">Slug</span>
            <input
              value={product.slug}
              onChange={(e) => update("slug", e.target.value)}
              onBlur={() => !product.slug && update("slug", slugify(product.name))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-mono"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">Subtitle</span>
            <input
              value={product.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase">Description</span>
            <textarea
              value={product.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Veg / Non-veg / Combo</span>
              <select
                value={product.category}
                onChange={(e) => update("category", e.target.value as ProductCategory)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="combo">Combo</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Spice (1–5)</span>
              <input
                type="number"
                min={1}
                max={5}
                value={product.spiceLevel}
                onChange={(e) => update("spiceLevel", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Display order</span>
              <input
                type="number"
                value={product.displayOrder}
                onChange={(e) => update("displayOrder", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Tag</span>
              <select
                value={product.tag ?? ""}
                onChange={(e) =>
                  update("tag", (e.target.value || null) as ProductTag)
                }
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {TAG_LABELS[t].label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-3 pt-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) => update("available", e.target.checked)}
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => update("featured", e.target.checked)}
                />
                Featured on home
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted uppercase">Weights & prices</span>
              <button
                type="button"
                onClick={addWeight}
                className="text-xs font-semibold text-accent hover:underline"
              >
                + Add option
              </button>
            </div>
            <div className="space-y-2">
              {product.weightOptions.map((w, i) => (
                <div key={w.id} className="flex flex-wrap gap-2 items-end">
                  <input
                    placeholder="Label"
                    value={w.label}
                    onChange={(e) => updateWeight(i, "label", e.target.value)}
                    className="flex-1 min-w-[80px] rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={w.priceINR || ""}
                    onChange={(e) => updateWeight(i, "priceINR", e.target.value)}
                    className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Was ₹"
                    value={w.originalPriceINR ?? ""}
                    onChange={(e) => updateWeight(i, "originalPriceINR", e.target.value)}
                    className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeWeight(i)}
                    className="text-xs text-muted hover:text-red-600 px-2 py-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-surface-elevated px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}
