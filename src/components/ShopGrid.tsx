"use client";

import { useEffect, useState } from "react";
import { PickleProduct, ProductCategory } from "@/types/product";
import PickleProductCard from "./PickleProductCard";
import ComboProductCard from "./ComboProductCard";
import type { ComboPack } from "@/data/combos";
import { cn } from "@/lib/cn";

type Filter = "all" | ProductCategory;

interface Props {
  category?: ProductCategory;
  showCombo?: boolean;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  initialProducts?: PickleProduct[];
  initialCombos?: ComboPack[];
}

export default function ShopGrid({
  category,
  showCombo = true,
  showFilters = false,
  title,
  subtitle,
  initialProducts,
  initialCombos = [],
}: Props) {
  const [products, setProducts] = useState<PickleProduct[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const [filter, setFilter] = useState<Filter>(category ?? "all");

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    const query =
      category && !showFilters
        ? `?category=${category}`
        : showFilters
          ? ""
          : category
            ? `?category=${category}`
            : "";

    fetch(`/api/products${query}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [category, initialProducts, showFilters]);

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const showComboCards = showCombo && (filter === "all" || filter === "combo");

  return (
    <section className="shop-grid-section">
      {(title || subtitle) && (
        <div className="mb-3 px-0.5">
          {title && <h1 className="shop-page-title">{title}</h1>}
          {subtitle && <p className="mt-0.5 text-xs text-shop-muted">{subtitle}</p>}
        </div>
      )}

      {showFilters && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["all", "All"],
              ["veg", "Veg"],
              ["non-veg", "Non-Veg"],
              ["combo", "Combo"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide",
                filter === key
                  ? "bg-brand text-white"
                  : "border border-[#d9cfc0] bg-white text-brand"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-shop-muted">Loading…</p>
      ) : filtered.length === 0 && !showComboCards ? (
        <p className="py-16 text-center text-sm text-shop-muted">No products found.</p>
      ) : (
        <div className="shop-product-grid">
          {showComboCards &&
            initialCombos.map((combo) => <ComboProductCard key={combo.id} combo={combo} />)}
          {filtered.map((p) => (
            <PickleProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
