"use client";

import Link from "next/link";
import { PickleProduct } from "@/types/product";
import ProductVisual from "./ProductVisual";
import WishlistHeartButton from "./WishlistHeartButton";
import { formatPriceRange } from "@/lib/format-price";
import { cn } from "@/lib/cn";

interface Props {
  product: PickleProduct;
}

function categoryLabel(product: PickleProduct): string {
  const parts: string[] = [];
  if (product.tag === "new") parts.push("Newly Added");
  if (product.tag === "bestseller") parts.push("Bestseller");
  parts.push(product.category === "veg" ? "Veg Pickles" : "Non-Veg Pickle's");
  parts.push("Shop All");
  return parts.join(", ");
}

export default function PickleProductCard({ product }: Props) {
  const prices = product.weightOptions.map((w) => w.priceINR);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const outOfStock = !product.available || product.tag === "out_of_stock";

  return (
    <article className={cn("shop-product-card flex flex-col", outOfStock && "opacity-60")}>
      <div className="relative">
        <ProductVisual product={product} />
        <WishlistHeartButton itemId={product.id} />
      </div>

      <div className="shop-product-meta flex flex-1 flex-col pt-2.5">
        <h3 className="shop-product-title">{product.name}</h3>
        <p className="shop-product-tags">{categoryLabel(product)}</p>
        <p className="shop-product-price">
          {outOfStock ? "Out of stock" : formatPriceRange(minPrice, maxPrice)}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className={cn("shop-select-btn", outOfStock && "shop-select-btn-disabled")}
          aria-disabled={outOfStock}
          tabIndex={outOfStock ? -1 : undefined}
        >
          SELECT OPTIONS
        </Link>
      </div>
    </article>
  );
}
