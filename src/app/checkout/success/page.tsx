"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { LastOrder } from "@/context/OrderContext";
import GuestPaidReceiptModal from "@/components/GuestPaidReceiptModal";
import { readPendingOrderSession } from "@/lib/pending-order-session";
import { readGuestOrderSession } from "@/lib/guest-order-session";
import { type GuestReceiptData, markGuestReceiptAutoShown } from "@/lib/guest-receipt";

function readOrderFromSession(): LastOrder | null {
  const pending = readPendingOrderSession();
  return pending as LastOrder | null;
}

function buildReceiptFromGuestSession(
  session: GuestReceiptData & { isGuestCheckout: boolean },
  order: LastOrder
): GuestReceiptData {
  return {
    orderId: order.orderId,
    displayOrderId: order.displayOrderId ?? session.displayOrderId,
    amountINR: order.amountINR,
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId || session.paymentId,
    items: session.items.map((item, i) => ({
      ...item,
      priceINR: item.priceINR ?? order.items[i]?.priceINR ?? 0,
    })),
    customer: session.customer,
    orderedAt: session.orderedAt,
    paidAt: session.paidAt ?? new Date().toISOString(),
  };
}

export default function CheckoutSuccessPage() {
  const { lastOrder } = useOrder();
  const { format } = useCurrency();
  const [sessionOrder] = useState(readOrderFromSession);
  const [guestSession] = useState(readGuestOrderSession);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const order = lastOrder ?? sessionOrder;

  const guestReceipt = useMemo(() => {
    if (!order || order.paymentStatus !== "paid" || !guestSession?.isGuestCheckout) return null;
    return buildReceiptFromGuestSession(guestSession, order);
  }, [order, guestSession]);

  useEffect(() => {
    if (!guestReceipt) return;
    if (markGuestReceiptAutoShown(guestReceipt.orderId)) {
      setReceiptOpen(true);
    }
  }, [guestReceipt]);

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
    <>
      {guestReceipt && (
        <GuestPaidReceiptModal
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          receipt={guestReceipt}
        />
      )}

      <div className="app-content py-16 text-center max-w-lg mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest">Thank you</p>
        <h1 className="mt-2 font-display text-2xl text-brand">
          {pending ? "Order placed" : "Payment confirmed"}
        </h1>
        <p className="mt-4 text-muted">
          Order <strong className="text-brand">{order.displayOrderId ?? order.orderId}</strong>
        </p>
        <p className="mt-2 text-lg font-semibold text-brand">{format(order.amountINR)}</p>

        {pending && (
          <p className="mt-4 text-sm text-muted">
            Complete payment with Razorpay on the payment page to confirm your order.
          </p>
        )}

        {!pending && guestReceipt && (
          <p className="mt-4 text-sm text-amber-950 bg-amber-50 rounded-lg px-3 py-2">
            Guest checkout — save your receipt below. This order will not appear in My account.
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
          {!pending && guestReceipt && (
            <button
              type="button"
              onClick={() => setReceiptOpen(true)}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
              data-ai-target="view-guest-receipt"
            >
              <Download className="h-4 w-4" />
              View & save order receipt
            </button>
          )}
          {pending && (
            <>
              <Link
                href="/cart"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand px-6 text-sm font-semibold text-brand hover:bg-brand/5"
                data-ai-target="edit-cart"
              >
                Edit cart
              </Link>
              <Link
                href={`/order/${order.orderId}/payment`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
                data-ai-target="pay-with-razorpay"
              >
                Pay with Razorpay
              </Link>
            </>
          )}
          <Link
            href={`/track?displayOrderId=${encodeURIComponent(order.displayOrderId ?? "")}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-brand hover:border-brand/40"
            data-ai-target="track-order"
          >
            Track order
          </Link>
          <Link href="/products" className="text-sm font-semibold text-muted hover:text-brand">
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  );
}
