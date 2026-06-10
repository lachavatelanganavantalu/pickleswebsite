import { getProductDetails } from "@/data/product-details";
import { CATEGORY_LABELS, PickleProduct } from "@/types/product";
import { formatINRDecimal } from "@/lib/format-price";

/** Factual product copy for pages and structured data when DB description is empty. */
export function productSummary(product: PickleProduct): string {
  if (product.description?.trim()) return product.description.trim();

  const prices = product.weightOptions.map((w) => w.priceINR);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const priceText =
    min === max
      ? formatINRDecimal(min)
      : `${formatINRDecimal(min)} – ${formatINRDecimal(max)}`;

  const details = getProductDetails(product.id, product.name);
  return `${details.overview} Available in ${product.subtitle} jars (${priceText}).`;
}
