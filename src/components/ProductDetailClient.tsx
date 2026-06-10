"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WeightSelector from "@/components/WeightSelector";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatINRDecimal } from "@/lib/format-price";
import {
  getProductUnavailableCta,
  getProductUnavailableLabel,
  isProductPurchasable,
} from "@/lib/product-stock";
import { PickleProduct } from "@/types/product";

interface Props {
  product: PickleProduct;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { format } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState(
    product.weightOptions[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = useMemo(() => {
    return (
      product.weightOptions.find((w) => w.id === selectedVariant) ??
      product.weightOptions[0]
    );
  }, [product, selectedVariant]);

  const outOfStock = !isProductPurchasable(product);
  const unavailableLabel = getProductUnavailableLabel(product);
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
    <>
      <p className="mt-2 text-sm font-bold text-brand">
        {unavailableLabel ? (
          <span className="text-gray-600">{unavailableLabel}</span>
        ) : (
          <>
            {formatINRDecimal(minPrice)}
            {minPrice !== maxPrice && ` – ${formatINRDecimal(maxPrice)}`}
          </>
        )}
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
            ? getProductUnavailableCta(product)
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
    </>
  );
}
