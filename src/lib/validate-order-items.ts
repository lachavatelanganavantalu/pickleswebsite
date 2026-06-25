import { getComboById } from "@/lib/combos-db";
import { normalizeComboVariantId, normalizeProductVariantId } from "@/lib/cart-line-normalize";
import { getProductById } from "@/lib/products-db";
import type { OrderItem } from "@/lib/orders-db";

export interface CartLineInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export type ValidatedCartResult =
  | { ok: true; items: OrderItem[]; amountINR: number }
  | { ok: false; error: string };

const COMBO_VARIANT_ID = "combo";

export async function validateCartLineItems(
  lines: CartLineInput[]
): Promise<ValidatedCartResult> {
  if (!lines?.length) {
    return { ok: false, error: "Your cart is empty." };
  }

  const orderItems: OrderItem[] = [];

  for (const line of lines) {
    const productId = String(line.productId || "").trim();
    let variantId = String(line.variantId || "").trim();
    const quantity = Math.min(Math.max(Math.floor(Number(line.quantity) || 0), 1), 99);

    if (!productId || !variantId) {
      return { ok: false, error: "Invalid cart item." };
    }

    const combo = await getComboById(productId);
    if (combo) {
      variantId = normalizeComboVariantId(variantId);
      if (variantId !== COMBO_VARIANT_ID) {
        return { ok: false, error: `Invalid option for ${combo.name}.` };
      }
      if (combo.available === false) {
        return { ok: false, error: `${combo.name} is currently unavailable.` };
      }
      orderItems.push({
        productName: combo.nameTelugu ?? combo.name,
        variantLabel: "5 jars · 250g each",
        quantity,
        priceINR: combo.priceINR,
      });
      continue;
    }

    const product = await getProductById(productId);
    if (!product) {
      return { ok: false, error: "A product in your cart is no longer available." };
    }
    if (!product.available) {
      return { ok: false, error: `${product.name} is out of stock.` };
    }

    const variant = product.weightOptions.find(
      (w) => w.id === normalizeProductVariantId(variantId, product.weightOptions.map((w) => w.id))
    );
    if (!variant) {
      return { ok: false, error: `Please re-select a size for ${product.name}.` };
    }

    orderItems.push({
      productName: product.nameTelugu ?? product.name,
      variantLabel: variant.label,
      quantity,
      priceINR: variant.priceINR,
    });
  }

  const amountINR = orderItems.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);
  if (amountINR <= 0) {
    return { ok: false, error: "Invalid order amount." };
  }

  return { ok: true, items: orderItems, amountINR };
}
