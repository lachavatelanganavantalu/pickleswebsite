"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ComboPack } from "@/data/combos";
import { formatINRDecimal } from "@/lib/format-price";
import ComboVisual from "./ComboVisual";
import WishlistHeartButton from "./WishlistHeartButton";
import CardQuantitySelect from "./CardQuantitySelect";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";

interface Props {
  combo: ComboPack;
}

export default function ComboProductCard({ combo }: Props) {
  const { addItem } = useCart();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = combo.available === false;

  useEffect(() => {
    setOptionsOpen(false);
    setAdded(false);
    setQuantity(1);
  }, [combo.id]);

  const toggleOptions = () => {
    if (outOfStock) return;
    setOptionsOpen((open) => !open);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: combo.id,
        productName: combo.nameTelugu ?? combo.name,
        variantId: "combo",
        variantLabel: "5 jars · 250g each",
        priceINR: combo.priceINR,
      },
      quantity
    );
    setAdded(true);
  };

  return (
    <article className={cn("shop-product-card flex flex-col", outOfStock && "opacity-60")}>
      <div className="relative">
        <ComboVisual combo={combo} className={cn(optionsOpen && "shop-card-image-dimmed")} />

        {!optionsOpen && <WishlistHeartButton itemId={combo.id} />}

        {optionsOpen && (
          <div className="shop-card-options-overlay" role="dialog" aria-label="Select combo quantity">
            <button
              type="button"
              className="shop-card-close-btn"
              onClick={() => setOptionsOpen(false)}
            >
              ✕ Close
            </button>

            <div className="shop-card-options-panel">
              <p className="shop-card-options-label">Combo packs:</p>
              <div className="shop-card-variant-row">
                <span className="shop-card-variant-pill shop-card-variant-pill-active shop-card-variant-pill-static">
                  5 jars · ₹999
                </span>
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
          <button type="button" className="shop-add-cart-btn" onClick={handleAddToCart}>
            ADD TO CART
          </button>
        ))}

      <div className="shop-product-meta flex flex-1 flex-col pt-2.5">
        <Link href="/combos" className="hover:underline">
          <h3 className="shop-product-title">{combo.nameTelugu ?? combo.name}</h3>
        </Link>
        <p className="shop-product-tags">Combo · 5 pickles</p>
        <p className="shop-product-price">{formatINRDecimal(combo.priceINR)}</p>
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
        >
          SELECT OPTIONS
        </button>
      </div>
    </article>
  );
}
