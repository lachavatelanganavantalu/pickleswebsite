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

  return `${product.name} is a traditional Telangana ${CATEGORY_LABELS[product.category].toLowerCase()} pickle from Lachava Telangana Pickles, sold in ${product.subtitle} jars (${priceText}). Homemade-style recipe, packed fresh for delivery across India.`;
}
