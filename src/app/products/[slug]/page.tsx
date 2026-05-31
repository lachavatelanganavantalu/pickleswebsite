"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PickleProduct } from "@/types/product";
import WeightSelector from "@/components/WeightSelector";
import { StockBadge } from "@/components/ProductTagBadge";
import ProductVisual from "@/components/ProductVisual";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatINRDecimal } from "@/lib/format-price";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<PickleProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { format } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setAdded(false);
    setQuantity(1);
    setSelectedVariant("");
    if (!slug || slug.includes("[")) {
      setLoading(false);
      setProduct(null);
      return;
    }
    setLoading(true);
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setProduct(data);
          setSelectedVariant(data.weightOptions?.[0]?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const selected = useMemo(() => {
    if (!product?.weightOptions?.length) return undefined;
    return (
      product.weightOptions.find((w) => w.id === selectedVariant) ??
      product.weightOptions[0]
    );
  }, [product, selectedVariant]);

  useEffect(() => {
    if (!product?.weightOptions?.length) return;
    const valid = product.weightOptions.some((w) => w.id === selectedVariant);
    if (!valid) setSelectedVariant(product.weightOptions[0].id);
  }, [product, selectedVariant]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted">Loading…</div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted">Product not found</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-brand hover:underline">
          Browse shop
        </Link>
      </div>
    );
  }

  const outOfStock = !product.available || product.tag === "out_of_stock";
  const backHref = "/products";
  const prices = product.weightOptions.map((w) => w.priceINR);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const handleAddToCart = () => {
    if (outOfStock || !selected) return;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        variantId: selected.id,
        variantLabel: selected.label,
        priceINR: selected.priceINR,
      },
      quantity
    );
    setAdded(true);
    window.setTimeout(() => router.push("/cart"), 400);
  };

  return (
    <div className="app-content py-[clamp(1rem,4vw,2.5rem)]">
      <Link href={backHref} className="mb-4 inline-block text-xs font-semibold uppercase tracking-wide text-muted hover:text-brand">
        ← Back to shop
      </Link>

      <div className="relative">
        <ProductVisual product={product} />
        <WishlistHeartButton itemId={product.id} />
      </div>

      <div className="mt-4 px-1">
        <div className="flex flex-wrap gap-2 mb-2">
          <StockBadge available={product.available} tag={product.tag} />
        </div>
        {product.nameTelugu && (
          <p className="text-sm font-semibold text-brand">{product.nameTelugu}</p>
        )}
        <h1 className="mt-1 text-xl font-bold text-brand">{product.name}</h1>
        <p className="text-sm text-muted">{product.subtitle}</p>
        <p className="mt-2 text-sm font-bold text-brand">
          {formatINRDecimal(minPrice)}
          {minPrice !== maxPrice && ` – ${formatINRDecimal(maxPrice)}`}
        </p>

        <div className="mt-8">
          <WeightSelector
            options={product.weightOptions}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            formatPrice={format}
            disabled={outOfStock}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center self-start rounded-full border border-border bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="min-h-[44px] min-w-[44px] px-4 hover:bg-surface transition-colors"
            >
              −
            </button>
            <span className="min-w-[2rem] px-4 text-center font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="min-h-[44px] min-w-[44px] px-4 hover:bg-surface transition-colors"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || !selected}
            className="shop-select-btn disabled:opacity-50"
          >
            {outOfStock
              ? "OUT OF STOCK"
              : added
                ? "ADDED — OPENING CART…"
                : `ADD TO CART — ${format((selected?.priceINR ?? 0) * quantity)}`}
          </button>
          {added && (
            <p className="text-sm font-semibold text-forest" role="status">
              Added to cart.
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          PhonePe / GPay: 63021 12848 · Combo: 5 pickles ₹999 on{" "}
          <Link href="/combos" className="font-semibold text-brand hover:underline">
            combos page
          </Link>
        </p>
      </div>
    </div>
  );
}
