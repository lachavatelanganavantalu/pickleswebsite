import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductDetailSections from "@/components/ProductDetailSections";
import { StockBadge } from "@/components/ProductTagBadge";
import ProductVisual from "@/components/ProductVisual";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import { productSummary } from "@/lib/product-copy";
import { getProductBySlug } from "@/lib/products-db";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="app-content py-[clamp(1rem,4vw,2.5rem)]">
      <Link
        href="/products"
        className="mb-4 inline-block text-xs font-semibold uppercase tracking-wide text-muted hover:text-brand"
      >
        ← Back to shop
      </Link>

      <div className="relative">
        <ProductVisual product={product} />
        <WishlistHeartButton itemId={product.id} />
      </div>

      <div className="mt-4 px-1">
        <div className="mb-2 flex flex-wrap gap-2">
          <StockBadge available={product.available} tag={product.tag} />
        </div>
        {product.nameTelugu && (
          <p className="text-sm font-semibold text-brand">{product.nameTelugu}</p>
        )}
        <h1 className="mt-1 text-xl font-bold text-brand">{product.name}</h1>
        <p className="text-sm text-muted">{product.subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{productSummary(product)}</p>

        <ProductDetailClient product={product} />

        <p className="mt-4 text-xs text-muted">
          PhonePe / GPay: 63021 12848 · Combo: 5 pickles ₹999 on{" "}
          <Link href="/combos" className="font-semibold text-brand hover:underline">
            combos page
          </Link>
        </p>

        <ProductDetailSections product={product} />
      </div>
    </div>
  );
}
