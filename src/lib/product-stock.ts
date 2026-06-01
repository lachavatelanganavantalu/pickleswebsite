import { PickleProduct, ProductTag, TAG_LABELS } from "@/types/product";

/** Tags that block ordering and show a status message on the shop. */
export const DISABLED_PRODUCT_TAGS = ["out_of_stock", "orders_served_100"] as const;

export type DisabledProductTag = (typeof DISABLED_PRODUCT_TAGS)[number];

export function isDisabledProductTag(tag: ProductTag): tag is DisabledProductTag {
  return tag !== null && (DISABLED_PRODUCT_TAGS as readonly string[]).includes(tag);
}

export function isProductPurchasable(product: PickleProduct): boolean {
  return product.available && !isDisabledProductTag(product.tag);
}

export function getProductUnavailableLabel(product: PickleProduct): string | null {
  if (isProductPurchasable(product)) return null;
  if (product.tag && isDisabledProductTag(product.tag)) {
    return TAG_LABELS[product.tag].label;
  }
  return TAG_LABELS.out_of_stock.label;
}

export function getProductUnavailableCta(product: PickleProduct): string {
  const label = getProductUnavailableLabel(product);
  if (label === TAG_LABELS.orders_served_100.label) return "100+ ORDERS SERVED";
  return "OUT OF STOCK";
}
