"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OrderTimeline from "@/components/OrderTimeline";
import EditableCartList from "@/components/EditableCartList";
import RazorpayPayButton from "@/components/RazorpayPayButton";
import { formatINRDecimal } from "@/lib/format-price";
import { clearPendingOrderSession } from "@/lib/pending-order-session";
import { readJsonResponse } from "@/lib/read-json-response";
import { useCart } from "@/context/CartContext";
import type { TimelineStep } from "@/lib/order-timeline";

interface OrderView {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  paymentStatus: string;
  items: { productName: string; variantLabel: string; quantity: number }[];
  customer: { name: string; email?: string; phone: string };
}

export default function OrderPaymentPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [razorpayConfigured, setRazorpayConfigured] = useState(true);
  const { clearCart, itemCount } = useCart();

  const loadOrder = async () => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    const data = await readJsonResponse<{
      error?: string;
      order: OrderView;
      timeline?: TimelineStep[];
    }>(res);
    if (!res.ok) throw new Error(data.error || "Could not load order");
    setOrder(data.order);
    setTimeline(data.timeline ?? []);
  };

  useEffect(() => {
    if (!orderId) return;
    void loadOrder()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    void fetch("/api/razorpay/status")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setRazorpayConfigured(Boolean(data.configured)))
      .catch(() => setRazorpayConfigured(false));
  }, []);

  useEffect(() => {
    if (order?.paymentStatus !== "paid") return;
    clearCart();
    clearPendingOrderSession();
  }, [order?.paymentStatus, clearCart]);

  if (loading) {
    return <p className="app-content py-16 text-center text-muted">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="app-content py-16 text-center">
        <p className="text-red-600">{error || "Order not found"}</p>
        <Link href="/products" className="mt-6 inline-block font-semibold text-brand hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const paid = order.paymentStatus === "paid";

  return (
    <div className="app-content py-[clamp(1.25rem,4vw,2rem)] max-w-lg mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-forest">Order placed</p>
      <h1 className="shop-page-title mt-1">
        {paid ? `Order ${order.displayOrderId} confirmed` : `Pay for order ${order.displayOrderId}`}
      </h1>
      <p className="mt-2 text-lg font-bold text-brand">{formatINRDecimal(order.amountINR)}</p>

      {paid ? (
        <div className="mt-6 rounded-2xl border border-forest/30 bg-forest-soft p-5 text-sm text-forest">
          Payment received. We are preparing your order — you can track it anytime below.
        </div>
      ) : (
        <>
          {!razorpayConfigured && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              Online payment is not configured on the server. Please contact us on WhatsApp or try
              again later.
            </div>
          )}

          {razorpayConfigured && (
            <section className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Pay with Razorpay</h2>
              <p className="mt-2 text-sm text-muted">
                UPI, cards, or net banking. Your order is confirmed instantly after payment.
              </p>
              <div className="mt-4">
                <RazorpayPayButton
                  orderId={order.orderId}
                  displayOrderId={order.displayOrderId}
                  amountINR={order.amountINR}
                  customer={order.customer}
                />
              </div>
            </section>
          )}

          <section className="mt-6 rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Order summary</h2>
              <Link href="/cart" className="text-xs font-semibold text-brand hover:underline">
                Edit cart
              </Link>
            </div>
            {itemCount > 0 ? (
              <div className="mt-4">
                <EditableCartList compact />
              </div>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.productName} ({item.variantLabel}) × {item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Order timeline</h2>
        <div className="mt-4">
          <OrderTimeline steps={timeline} />
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3">
        {paid && (
          <Link
            href="/checkout/success"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          >
            View confirmation
          </Link>
        )}
        <Link
          href={`/track?displayOrderId=${encodeURIComponent(order.displayOrderId)}&phone=${encodeURIComponent(order.customer.phone)}`}
          className="flex min-h-[44px] items-center justify-center rounded-full border border-border text-sm font-semibold text-brand hover:border-brand/40"
        >
          Track this order
        </Link>
        <Link href="/products" className="text-center text-sm font-semibold text-muted hover:text-brand">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
