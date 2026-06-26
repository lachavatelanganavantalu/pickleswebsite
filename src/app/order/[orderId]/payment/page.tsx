"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import RazorpayOrderPayment from "@/components/RazorpayOrderPayment";
import GuestPaidReceiptModal from "@/components/GuestPaidReceiptModal";
import EditableCartList from "@/components/EditableCartList";
import { formatINRDecimal } from "@/lib/format-price";
import { clearPendingOrderSession } from "@/lib/pending-order-session";
import { updateGuestOrderSessionPaid } from "@/lib/guest-order-session";
import { type GuestReceiptData, markGuestReceiptAutoShown } from "@/lib/guest-receipt";
import { readJsonResponse } from "@/lib/read-json-response";
import { useCart } from "@/context/CartContext";
import type { TimelineStep } from "@/lib/order-timeline";

interface OrderView {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  paymentStatus: string;
  paymentId?: string;
  isGuestCheckout?: boolean;
  createdAt?: string;
  paymentConfirmedAt?: string;
  items: {
    productName: string;
    variantLabel: string;
    quantity: number;
    priceINR: number;
  }[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

function toGuestReceipt(order: OrderView): GuestReceiptData {
  return {
    orderId: order.orderId,
    displayOrderId: order.displayOrderId,
    amountINR: order.amountINR,
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,
    items: order.items,
    customer: order.customer,
    orderedAt: order.createdAt,
    paidAt: order.paymentConfirmedAt ?? new Date().toISOString(),
  };
}

export default function OrderPaymentPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { clearCart, itemCount } = useCart();

  const loadOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    const data = await readJsonResponse<{
      error?: string;
      order: OrderView;
      timeline?: TimelineStep[];
      razorpayEnabled?: boolean;
    }>(res);
    if (!res.ok) throw new Error(data.error || "Could not load order");
    return data;
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    void loadOrder()
      .then((data) => {
        setOrder(data.order);
        setTimeline(data.timeline ?? []);
        setRazorpayEnabled(Boolean(data.razorpayEnabled));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [orderId, loadOrder]);

  const guestReceipt = useMemo(
    () => (order && order.isGuestCheckout ? toGuestReceipt(order) : null),
    [order]
  );

  const isGuest = Boolean(order?.isGuestCheckout);

  useEffect(() => {
    if (order?.paymentStatus !== "paid" || !isGuest || !guestReceipt) return;
    updateGuestOrderSessionPaid({
      paymentStatus: "paid",
      paymentId: order.paymentId,
      paidAt: order.paymentConfirmedAt,
      items: order.items,
      customer: order.customer,
    });
    if (markGuestReceiptAutoShown(order.orderId)) {
      setReceiptOpen(true);
    }
  }, [order, isGuest, guestReceipt]);

  useEffect(() => {
    if (!orderId || !isGuest || order?.paymentStatus === "paid") return;
    const interval = window.setInterval(() => {
      void loadOrder()
        .then((data) => {
          setOrder(data.order);
          setTimeline(data.timeline ?? []);
        })
        .catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(interval);
  }, [orderId, isGuest, order?.paymentStatus, loadOrder]);

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
    <>
      {guestReceipt && (
        <GuestPaidReceiptModal
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          receipt={guestReceipt}
        />
      )}

      <div className="app-content py-[clamp(1.25rem,4vw,2rem)] max-w-lg mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest">Order placed</p>
        <h1 className="shop-page-title mt-1">Pay for order {order.displayOrderId}</h1>
        <p className="mt-2 text-lg font-bold text-brand">{formatINRDecimal(order.amountINR)}</p>

        {!paid && (
          <section className="mt-6 rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Edit cart</h2>
              <Link href="/cart" className="text-xs font-semibold text-brand hover:underline">
                Open full cart
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted">
              Change products or quantities anytime — even if you stopped payment. Place the order again
              when your cart is ready.
            </p>
            {itemCount > 0 ? (
              <div className="mt-4">
                <EditableCartList compact />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Your cart is empty.{" "}
                <Link href="/products" className="font-semibold text-brand hover:underline">
                  Add products
                </Link>
              </p>
            )}
          </section>
        )}

        {!paid ? (
          <section className="mt-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Pay with Razorpay</h2>
            <p className="mt-2 text-sm text-muted">
              Pay securely with UPI, cards, or net banking. Your order is confirmed instantly after
              payment.
            </p>
            {razorpayEnabled ? (
              <div className="mt-4">
                <RazorpayOrderPayment
                  orderId={order.orderId}
                  displayOrderId={order.displayOrderId}
                  amountINR={order.amountINR}
                  customer={order.customer}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Online payment is temporarily unavailable. Please{" "}
                <Link href="/contact" className="font-semibold underline">
                  contact us
                </Link>{" "}
                with order <strong>{order.displayOrderId}</strong>.
              </p>
            )}
          </section>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-forest/30 bg-forest-soft p-5 text-sm text-forest">
              Payment confirmed. We are preparing your order.
            </div>
            {isGuest && guestReceipt && (
              <button
                type="button"
                onClick={() => setReceiptOpen(true)}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-brand px-5 text-sm font-bold uppercase tracking-wide text-brand hover:bg-brand/5"
                data-ai-target="view-guest-receipt"
              >
                <Download className="h-4 w-4" />
                View & save order receipt
              </button>
            )}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Order timeline</h2>
          <div className="mt-4">
            <OrderTimeline steps={timeline} />
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/track?displayOrderId=${encodeURIComponent(order.displayOrderId)}&phone=${encodeURIComponent(order.customer.phone)}`}
            className="flex min-h-[44px] items-center justify-center rounded-full border border-border text-sm font-semibold text-brand hover:border-brand/40"
            data-ai-target="track-order"
          >
            Track this order
          </Link>
          <Link href="/products" className="text-center text-sm font-semibold text-muted hover:text-brand">
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  );
}
