import type { ComboPack } from "@/data/combos";
import type { PickleProduct } from "@/types/product";
import type { AdityaResolvedAction } from "@/lib/aditya/types";
import {
  buildWeightUnavailableMessage,
  resolveCartLine,
} from "@/lib/aditya/resolve-cart-item";
import { UNKNOWN_PICKLE_MESSAGE } from "@/lib/aditya/unknown-pickle-message";

export type CartActionOutcome = {
  added?: string;
  notice?: string;
};

type AddItemFn = (
  item: {
    productId: string;
    productName: string;
    variantId: string;
    variantLabel: string;
    priceINR: number;
  },
  qty?: number,
) => void;

export function applyCartAction(
  action: AdityaResolvedAction,
  products: PickleProduct[],
  combos: ComboPack[],
  addItem: AddItemFn,
): CartActionOutcome {
  const productQuery = action.product_query?.trim();
  if (!productQuery) {
    return { notice: "Missing product in buy request." };
  }

  const result = resolveCartLine(
    products,
    combos,
    productQuery,
    action.weight_hint ?? null,
  );

  if (!result.ok) {
    if (result.kind === "not_found") {
      return { notice: UNKNOWN_PICKLE_MESSAGE };
    }

    return {
      notice: buildWeightUnavailableMessage(
        result.product.name,
        result.requestedLabel,
        result.available,
      ),
    };
  }

  const quantity = action.quantity ?? 1;

  if (result.line.type === "combo") {
    addItem(
      {
        productId: result.line.combo.id,
        productName: result.line.combo.nameTelugu ?? result.line.combo.name,
        variantId: "combo-pack",
        variantLabel: "5 jars · 250g each",
        priceINR: result.line.combo.priceINR,
      },
      quantity,
    );

    return {
      added: `${quantity} × ${result.line.combo.nameTelugu ?? result.line.combo.name}`,
    };
  }

  addItem(
    {
      productId: result.line.product.id,
      productName: result.line.product.name,
      variantId: result.line.variant.id,
      variantLabel: result.line.variant.label,
      priceINR: result.line.variant.priceINR,
    },
    quantity,
  );

  return {
    added: `${quantity} × ${result.line.product.name} (${result.line.variant.label})`,
  };
}
