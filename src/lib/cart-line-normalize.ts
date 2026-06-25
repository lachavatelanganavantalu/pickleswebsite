import type { CartItem } from "@/context/CartContext";

/** Combo cards historically used `combo-pack`; checkout API expects `combo`. */
const COMBO_VARIANT_ALIASES = new Set(["combo", "combo-pack"]);

export function normalizeComboVariantId(variantId: string): string {
  const id = variantId.trim();
  return COMBO_VARIANT_ALIASES.has(id) ? "combo" : id;
}

/**
 * Older carts used `250g`; the current menu uses `500g` / `1kg` for half-kg and full-kg jars.
 */
export function normalizeProductVariantId(
  variantId: string,
  weightOptionIds: string[]
): string {
  const id = variantId.trim();
  if (weightOptionIds.includes(id)) return id;
  if (id === "250g" && weightOptionIds.includes("500g")) return "500g";
  return id;
}

/** Fix stale browser cart lines saved under old ids. */
export function normalizeStoredCartItems(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    let variantId = item.variantId;
    if (normalizeComboVariantId(variantId) === "combo") {
      variantId = "combo";
    } else if (variantId === "250g") {
      variantId = "500g";
      if (item.variantLabel.toLowerCase().includes("250")) {
        return {
          ...item,
          variantId,
          variantLabel: item.variantLabel.replace(/250\s*g/i, "1/2 kg (500g)"),
        };
      }
    }
    return variantId === item.variantId ? item : { ...item, variantId };
  });
}
