"use client";

import { useEffect, useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import type { LastOrder } from "@/context/OrderContext";
import { clearPendingOrderSession } from "@/lib/pending-order-session";
import { readPaidOrderSession } from "@/lib/paid-order-session";
import { cleanupRazorpayCheckout, startRazorpayOverlayWatch } from "@/lib/razorpay-cleanup";

function trackOrderHref(order: LastOrder): string {
  const params = new URLSearchParams({
    displayOrderId: order.displayOrderId ?? order.orderId,
  });
  if (order.customerPhone?.trim()) {
    params.set("phone", order.customerPhone.trim());
  }
  return `/track?${params.toString()}`;
}

export default function CheckoutSuccessPage() {
  const { lastOrder } = useOrder();
  const { format } = useCurrency();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stopWatch = startRazorpayOverlayWatch();
    const saved = readPaidOrderSession();
    setOrder(lastOrder ?? saved);
    setReady(true);
    return stopWatch;
  }, [lastOrder]);

  useEffect(() => {
    if (!order) return;
    clearCart();
    clearPendingOrderSession();
  }, [order, clearCart]);

  if (!ready) {
    return <p className="app-content py-16 text-center text-muted">Loading confirmation…</p>;
  }

  if (!order) {
    return (
      <div className="app-content py-20 text-center">
        <h1 className="font-display text-2xl text-brand">Order confirmed</h1>
        <p className="mt-4 text-muted">Thank you for your order.</p>
        <a href="/products" className="mt-8 inline-block font-semibold text-brand hover:underline">
          Continue shopping
        </a>
      </div>
    );
  }

  return (
    <div className="relative z-[100] app-content py-16 text-center max-w-lg mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-forest">Payment successful</p>
      <h1 className="mt-2 font-display text-2xl text-brand">Thank you for your order</h1>

      <div className="mt-6 rounded-2xl border border-forest/30 bg-forest-soft p-5 text-left text-sm text-forest">
        <p>
          <span className="font-semibold">Order ID:</span>{" "}
          <span className="font-mono">{order.displayOrderId ?? order.orderId}</span>
        </p>
        <p className="mt-2">
          <span className="font-semibold">Amount paid:</span> {format(order.amountINR)}
        </p>
        {order.paymentId && (
          <p className="mt-2">
            <span className="font-semibold">Payment ref:</span>{" "}
            <span className="font-mono text-xs">{order.paymentId}</span>
          </p>
        )}
      </div>

      <ul className="mt-6 text-left text-sm text-muted space-y-2 rounded-xl border border-border p-5 bg-white">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.productName} ({item.variantLabel}) × {item.quantity}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted">
        We are preparing your pickles. You can track delivery status anytime.
      </p>

      <div className="relative z-[100] mt-8 flex flex-col gap-3">
        <a
          href={trackOrderHref(order)}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          Track order
        </a>
        <a
          href="/account"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-brand hover:border-brand/40"
        >
          My account
        </a>
        <a href="/products" className="text-sm font-semibold text-muted hover:text-brand">
          Continue shopping
        </a>
      </div>
    </div>
  );
}
