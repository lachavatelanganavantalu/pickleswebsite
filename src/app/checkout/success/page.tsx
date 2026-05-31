"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrder } from "@/context/OrderContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { LastOrder } from "@/context/OrderContext";

function readOrderFromSession(): LastOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("orderSuccess");
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}

export default function CheckoutSuccessPage() {
  const { lastOrder } = useOrder();
  const { format } = useCurrency();
  const [sessionOrder] = useState(readOrderFromSession);
  const order = lastOrder ?? sessionOrder;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Order confirmed</h1>
        <p className="mt-4 text-muted">Thank you for your order.</p>
        <Link href="/products" className="mt-8 inline-block text-accent font-semibold">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Thank you</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Order confirmed</h1>
      <p className="mt-4 text-muted">
        Order <strong className="text-ink">{order.displayOrderId ?? order.orderId}</strong>
      </p>
      <p className="mt-2 text-lg font-semibold text-accent">{format(order.amountINR)}</p>

      <ul className="mt-8 text-left text-sm text-muted space-y-2 rounded-xl border border-border p-5 bg-surface-elevated">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.productName} ({item.variantLabel}) × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`/api/order-receipt?orderId=${order.orderId}&format=pdf`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-ink hover:border-accent/40"
        >
          Download receipt
        </a>
        <Link
          href="/products"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Shop more
        </Link>
      </div>
    </div>
  );
}
