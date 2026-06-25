"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, PickleProduct } from "@/types/product";
import ProductVisual from "./ProductVisual";
import WishlistHeartButton from "./WishlistHeartButton";
import CardQuantitySelect from "./CardQuantitySelect";
import { formatPriceRange } from "@/lib/format-price";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import {
  getProductUnavailableCta,
  getProductUnavailableLabel,
  isProductPurchasable,
} from "@/lib/product-stock";

interface Props {
  product: PickleProduct;
}

function categoryLabel(product: PickleProduct): string {
  const category = CATEGORY_LABELS[product.category] ?? product.category;
  return product.nameTelugu
    ? `${product.nameTelugu} · ${category}`
    : category;
}

export default function PickleProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.weightOptions[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const prices = product.weightOptions.map((w) => w.priceINR);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const outOfStock = !isProductPurchasable(product);
  const unavailableLabel = getProductUnavailableLabel(product);

  const selectedVariant = useMemo(
    () => product.weightOptions.find((w) => w.id === selectedVariantId),
    [product.weightOptions, selectedVariantId]
  );

  useEffect(() => {
    setOptionsOpen(false);
    setAdded(false);
    setQuantity(1);
    setSelectedVariantId(product.weightOptions[0]?.id ?? "");
  }, [product.id]);

  const toggleOptions = () => {
    if (outOfStock) return;
    setOptionsOpen((open) => !open);
    setAdded(false);
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (outOfStock || !selectedVariant) return;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant.id,
        variantLabel: selectedVariant.label,
        priceINR: selectedVariant.priceINR,
      },
      quantity
    );
    setAdded(true);
  };

  return (
    <article className={cn("shop-product-card flex flex-col", outOfStock && "opacity-60")} data-ai-target="product-card">
      <div className="relative">
        <ProductVisual
          product={product}
          className={cn(optionsOpen && "shop-card-image-dimmed")}
        />

        {!optionsOpen && <WishlistHeartButton itemId={product.id} />}

        {optionsOpen && (
          <div className="shop-card-options-overlay" role="dialog" aria-label="Select options">
            <button
              type="button"
              className="shop-card-close-btn"
              onClick={() => setOptionsOpen(false)}
              data-ai-target="close-options-btn"
            >
              ✕ Close
            </button>

            <div className="shop-card-options-panel">
              <p className="shop-card-options-label">Size:</p>
              <div className="shop-card-variant-row">
                {product.weightOptions.map((opt) => {
                  const isSelected = selectedVariantId === opt.id;
                  return (
                    <button
                      key={`${product.id}-${opt.id}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectVariant(opt.id);
                      }}
                      className={cn(
                        "shop-card-variant-pill",
                        isSelected && "shop-card-variant-pill-active"
                      )}
                      data-ai-target="variant-size-pill"
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <p className="shop-card-options-label shop-card-options-label-spaced">Qty:</p>
              <CardQuantitySelect
                value={quantity}
                onChange={(q) => {
                  setQuantity(q);
                  setAdded(false);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {optionsOpen &&
        (added ? (
          <Link href="/cart" className="shop-add-cart-btn">
            OPEN CART
          </Link>
        ) : (
          <button type="button" className="shop-add-cart-btn" onClick={handleAddToCart} data-ai-target="add-to-cart">
            ADD TO CART
          </button>
        ))}

      <div className="shop-product-meta flex flex-1 flex-col pt-2.5">
        <Link href={`/products/${product.slug}`} className="hover:underline">
          <h3 className="shop-product-title">{product.name}</h3>
        </Link>
        <p className="shop-product-tags">{categoryLabel(product)}</p>
        <p className="shop-product-price">
          {unavailableLabel ?? formatPriceRange(minPrice, maxPrice)}
        </p>
        <button
          type="button"
          onClick={toggleOptions}
          disabled={outOfStock}
          className={cn(
            "shop-select-btn",
            outOfStock && "shop-select-btn-disabled",
            optionsOpen && "shop-select-btn-open"
          )}
          aria-expanded={optionsOpen}
          data-ai-target="select-options-btn"
        >
          {outOfStock ? getProductUnavailableCta(product) : "SELECT OPTIONS"}
        </button>
      </div>
    </article>
  );
}
