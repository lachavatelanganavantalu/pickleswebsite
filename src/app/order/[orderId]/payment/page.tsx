"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import { formatINRDecimal } from "@/lib/format-price";
import type { TimelineStep } from "@/lib/order-timeline";

interface PaymentInfo {
  upiId: string;
  upiPhone: string;
  qrImagePath: string;
  payeeName: string;
}

interface OrderView {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  paymentStatus: string;
  items: { productName: string; variantLabel: string; quantity: number }[];
  customer: { name: string; phone: string };
}

export default function OrderPaymentPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [upiPayUrl, setUpiPayUrl] = useState<string | null>(null);
  const [qrBroken, setQrBroken] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    void fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load order");
        setOrder(data.order);
        setPayment(data.payment);
        setTimeline(data.timeline ?? []);
        setWhatsappUrl(data.whatsappUrl ?? null);
        setUpiPayUrl(data.upiPayUrl ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [orderId]);

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
      <h1 className="shop-page-title mt-1">Pay for order {order.displayOrderId}</h1>
      <p className="mt-2 text-lg font-bold text-brand">{formatINRDecimal(order.amountINR)}</p>

      {!paid ? (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Step 1 — Pay</h2>
            <p className="mt-2 text-sm text-muted">
              Scan the QR or pay on PhonePe / GPay to{" "}
              <strong className="text-brand">{payment?.upiPhone ?? payment?.upiId}</strong>
            </p>

            {payment?.qrImagePath && !qrBroken && (
              <div className="mt-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.qrImagePath}
                  alt="UPI payment QR code"
                  className="max-w-[220px] rounded-xl border border-border"
                  onError={() => setQrBroken(true)}
                />
              </div>
            )}

            {qrBroken && (
              <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-muted">
                QR image not uploaded yet. Pay manually to{" "}
                <strong>{payment?.upiPhone}</strong> ({payment?.upiId}).
              </p>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-brand">UPI ID:</span> {payment?.upiId}
              </p>
              <p>
                <span className="font-semibold text-brand">PhonePe / GPay:</span>{" "}
                {payment?.upiPhone}
              </p>
            </div>

            {upiPayUrl && (
              <a
                href={upiPayUrl}
                className="mt-4 flex min-h-[44px] items-center justify-center rounded-full border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5"
              >
                Open UPI app to pay
              </a>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">
              Step 2 — Send payment screenshot
            </h2>
            <p className="mt-2 text-sm text-muted">
              After paying, tap WhatsApp below. Attach your payment screenshot and send the prefilled
              message to us.
            </p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold uppercase tracking-wide text-white hover:opacity-95"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp payment screenshot
              </a>
            )}
          </section>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-forest/30 bg-forest-soft p-5 text-sm text-forest">
          Payment confirmed. We are preparing your order.
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
