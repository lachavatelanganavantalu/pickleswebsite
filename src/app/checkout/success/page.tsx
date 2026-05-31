"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrder } from "@/context/OrderContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { LastOrder } from "@/context/OrderContext";
import { readPendingOrderSession } from "@/lib/pending-order-session";

function readOrderFromSession(): LastOrder | null {
  const pending = readPendingOrderSession();
  return pending as LastOrder | null;
}

export default function CheckoutSuccessPage() {
  const { lastOrder } = useOrder();
  const { format } = useCurrency();
  const [sessionOrder] = useState(readOrderFromSession);
  const order = lastOrder ?? sessionOrder;

  if (!order) {
    return (
      <div className="app-content py-20 text-center">
        <h1 className="font-display text-2xl text-brand">Order placed</h1>
        <p className="mt-4 text-muted">Thank you for your order.</p>
        <Link href="/products" className="mt-8 inline-block font-semibold text-brand hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const pending = order.paymentStatus !== "paid";

  return (
    <div className="app-content py-16 text-center max-w-lg mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-forest">Thank you</p>
      <h1 className="mt-2 font-display text-2xl text-brand">Order placed</h1>
      <p className="mt-4 text-muted">
        Order <strong className="text-brand">{order.displayOrderId ?? order.orderId}</strong>
      </p>
      <p className="mt-2 text-lg font-semibold text-brand">{format(order.amountINR)}</p>

      {pending && (
        <p className="mt-4 text-sm text-muted">
          Complete payment via UPI / QR, then send your payment screenshot on WhatsApp.
        </p>
      )}

      <ul className="mt-8 text-left text-sm text-muted space-y-2 rounded-xl border border-border p-5 bg-white">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.productName} ({item.variantLabel}) × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3">
        {pending && (
          <>
            <Link
              href="/cart"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand px-6 text-sm font-semibold text-brand hover:bg-brand/5"
            >
              Edit cart
            </Link>
            <Link
              href={`/order/${order.orderId}/payment`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            >
              Pay & send screenshot
            </Link>
          </>
        )}
        <Link
          href={`/track?displayOrderId=${encodeURIComponent(order.displayOrderId ?? "")}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-brand hover:border-brand/40"
        >
          Track order
        </Link>
        <Link href="/products" className="text-sm font-semibold text-muted hover:text-brand">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
