"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { ComboPack } from "@/data/combos";
import { PickleProduct } from "@/types/product";
import { searchCatalog, SearchResult } from "@/lib/search-products";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShopSearchOverlay({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PickleProduct[]>([]);
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setLoading(true);
    Promise.all([fetch("/api/products"), fetch("/api/combos")])
      .then(async ([productsRes, combosRes]) => {
        const productsData = await productsRes.json();
        const combosData = await combosRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCombos(Array.isArray(combosData) ? combosData : []);
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    setResults(searchCatalog(products, query, combos));
  }, [products, query, combos]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/40 pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close search"
        onClick={handleClose}
      />

      <div
        className="relative z-10 mx-auto w-full bg-brand shadow-lg"
        style={{ maxWidth: "var(--content-max)" }}
      >
        <div className="flex items-center gap-2 px-[var(--content-pad-x)] py-3">
          <Search className="h-5 w-5 shrink-0 text-white/80" strokeWidth={2} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pickles, combos…"
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label="Close search"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        className="relative z-10 mx-auto w-full flex-1 overflow-y-auto bg-surface"
        style={{ maxWidth: "var(--content-max)" }}
      >
        <div className="px-[var(--content-pad-x)] py-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-shop-muted">Loading products…</p>
          ) : query.trim() === "" ? (
            <p className="py-8 text-center text-sm text-shop-muted">
              Try mango, chicken, prawn, combo…
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-shop-muted">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleClose}
                    className="flex items-center gap-3 py-3 hover:bg-white/60"
                  >
                    {item.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imagePath}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-lg">
                        🥒
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                      <p className="truncate text-xs text-shop-muted">{item.subtitle}</p>
                    </div>
                    {item.priceLabel && (
                      <span className="shrink-0 text-sm font-semibold text-brand">
                        {item.priceLabel}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
