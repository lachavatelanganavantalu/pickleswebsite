import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { productSummary } from "@/lib/product-copy";
import { getProductBySlug } from "@/lib/products-db";
import { productJsonLd } from "@/lib/structured-data";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: productSummary(product),
    alternates: { canonical: `/products/${slug}` },
  };
}

export default async function ProductSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return (
    <>
      {product && <JsonLd data={productJsonLd(product)} />}
      {children}
    </>
  );
}
