"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { PickleProduct, ProductCategory } from "@/types/product";
import ProductVisual from "@/components/ProductVisual";
import { createEmptyProduct, duplicateProduct } from "@/lib/product-admin";
import AdminProductEditor from "./AdminProductEditor";

export default function AdminProductsPanel() {
  const [products, setProducts] = useState<PickleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PickleProduct | null>(null);
  const [filter, setFilter] = useState<"all" | ProductCategory>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const openNew = (category: ProductCategory = "veg") => {
    setEditing(createEmptyProduct(category));
    setEditorOpen(true);
  };

  const openEdit = (p: PickleProduct) => {
    setEditing({ ...p });
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  const handleDuplicate = async (p: PickleProduct) => {
    const maxOrder = Math.max(0, ...products.map((x) => x.displayOrder));
    const copy = duplicateProduct(p, maxOrder);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    if (res.ok) load();
  };

  const handleSaved = () => {
    setEditorOpen(false);
    setEditing(null);
    load();
  };

  return (
    <div className="p-4 sm:p-8 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="text-sm text-muted mt-1">{products.length} items</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-lg border border-border px-3 py-2 text-sm bg-surface-elevated"
          >
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
          </select>
          <button
            type="button"
            onClick={() => openNew("veg")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface-elevated p-4 sm:flex-row sm:gap-4"
            >
              <div className="flex min-w-0 gap-3 sm:flex-1">
                <div className="w-20 shrink-0 overflow-hidden rounded-lg">
                  <ProductVisual product={p} compact className="min-h-[80px] aspect-square" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.slug} · {p.category}</p>
                  <p className="text-xs text-muted mt-1">
                    {p.available ? "Available" : "Hidden"} · Order {p.displayOrder}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1 sm:items-start">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg hover:bg-surface text-muted hover:text-ink"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(p)}
                  className="p-2 rounded-lg hover:bg-surface text-muted hover:text-ink"
                  aria-label="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editorOpen && editing && (
        <AdminProductEditor
          product={editing}
          existing={products}
          onClose={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
