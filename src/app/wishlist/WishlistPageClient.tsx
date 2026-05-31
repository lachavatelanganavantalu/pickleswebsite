"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PickleProduct } from "@/types/product";
import PickleProductCard from "@/components/PickleProductCard";
import { getWishlistIds } from "@/lib/wishlist-storage";
import type { ComboPack } from "@/data/combos";
import ComboProductCard from "@/components/ComboProductCard";

export default function WishlistPageClient() {
  const [products, setProducts] = useState<PickleProduct[]>([]);
  const [combos, setCombos] = useState<ComboPack[]>([]);
  const [wishIds, setWishIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const ids = getWishlistIds();
      setWishIds(ids);
    };
    load();
    window.addEventListener("wishlist-updated", load);
    return () => window.removeEventListener("wishlist-updated", load);
  }, []);

  useEffect(() => {
    Promise.all([fetch("/api/products"), fetch("/api/combos")])
      .then(async ([productsRes, combosRes]) => {
        const productsData = await productsRes.json();
        const combosData = await combosRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCombos(Array.isArray(combosData) ? combosData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const savedProducts = products.filter((p) => wishIds.includes(p.id));
  const savedCombos = combos.filter((c) => wishIds.includes(c.id));
  const hasItems = savedProducts.length > 0 || savedCombos.length > 0;

  if (loading) {
    return <p className="py-16 text-center text-sm text-shop-muted">Loading…</p>;
  }

  if (!hasItems) {
    return (
      <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--content-pad-x)] py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Heart className="h-7 w-7 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-base font-bold text-brand">Your wishlist</h1>
        <p className="mt-2 text-xs text-shop-muted">
          Tap the heart on any product to save it here.
        </p>
        <Link href="/products" className="shop-select-btn mx-auto mt-8 max-w-[200px]">
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <section className="shop-grid-section">
      <h1 className="shop-page-title mb-3 px-0.5">Wishlist</h1>
      <div className="shop-product-grid">
        {savedCombos.map((combo) => (
          <ComboProductCard key={combo.id} combo={combo} />
        ))}
        {savedProducts.map((p) => (
          <PickleProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
