"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  showSubtotal?: boolean;
  compact?: boolean;
}

export default function EditableCartList({ showSubtotal = false, compact = false }: Props) {
  const { items, updateQuantity, removeItem, totalINR } = useCart();
  const { format } = useCurrency();

  if (items.length === 0) {
    return (
      <div className={compact ? "text-sm text-muted" : "py-4 text-center text-muted"}>
        <p>Your cart is empty.</p>
        <Link href="/products" className="mt-2 inline-block font-semibold text-brand hover:underline">
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className={compact ? "space-y-2" : "space-y-3"}>
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId}`}
            className={
              compact
                ? "rounded-lg border border-border bg-surface/40 p-3"
                : "rounded-xl border border-border bg-white p-4"
            }
          >
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-brand">{item.productName}</p>
                <p className="text-sm text-muted">{item.variantLabel}</p>
                <p className="mt-1 text-sm font-semibold text-brand">
                  {format(item.priceINR * item.quantity)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.variantId)}
                className="shrink-0 text-xs text-muted hover:text-red-600"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 flex w-fit items-center rounded-full border border-border bg-white">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                className="min-h-[36px] min-w-[36px] rounded-l-full hover:bg-surface"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[2rem] px-3 text-center text-sm font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                className="min-h-[36px] min-w-[36px] rounded-r-full hover:bg-surface"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showSubtotal && (
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold text-brand">
          <span>Subtotal</span>
          <span>{format(totalINR)}</span>
        </div>
      )}
    </>
  );
}
