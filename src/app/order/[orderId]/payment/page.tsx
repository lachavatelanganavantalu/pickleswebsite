"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, Download, MessageCircle } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import EditableCartList from "@/components/EditableCartList";
import { formatINRDecimal } from "@/lib/format-price";
import { copyTextToClipboard } from "@/lib/copy-text";
import { paymentQrDownloadUrl } from "@/lib/payment-qr";
import { clearPendingOrderSession } from "@/lib/pending-order-session";
import { readJsonResponse } from "@/lib/read-json-response";
import { useCart } from "@/context/CartContext";
import type { TimelineStep } from "@/lib/order-timeline";

interface PaymentInfo {
  upiId: string;
  upiPhone: string;
  qrImagePath: string;
  payeeName: string;
  showQrPayment: boolean;
}

interface OrderView {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  paymentStatus: string;
  items: { productName: string; variantLabel: string; quantity: number }[];
  customer: { name: string; phone: string };
}

type CopiedField = "upi" | "phone" | null;

export default function OrderPaymentPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [qrBroken, setQrBroken] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const { clearCart, itemCount } = useCart();

  useEffect(() => {
    if (!orderId) return;
    void fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then(async (res) => {
        const data = await readJsonResponse<{
          error?: string;
          order: OrderView;
          payment: PaymentInfo;
          timeline?: TimelineStep[];
          whatsappUrl?: string | null;
        }>(res);
        if (!res.ok) throw new Error(data.error || "Could not load order");
        setOrder(data.order);
        setPayment(data.payment);
        setTimeline(data.timeline ?? []);
        setWhatsappUrl(data.whatsappUrl ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (order?.paymentStatus !== "paid") return;
    clearCart();
    clearPendingOrderSession();
  }, [order?.paymentStatus, clearCart]);

  const showQr = Boolean(payment?.showQrPayment && payment?.qrImagePath && !qrBroken);

  const handleCopy = async (field: CopiedField, text: string) => {
    const ok = await copyTextToClipboard(text);
    if (!ok) {
      window.alert("Could not copy. Please select and copy manually.");
      return;
    }
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadQr = async () => {
    if (!payment?.qrImagePath) return;
    setDownloadingQr(true);
    try {
      const res = await fetch(paymentQrDownloadUrl(payment.qrImagePath));
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "lachava-payment-qr.png";
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert("Could not download QR. Try taking a screenshot instead.");
    } finally {
      setDownloadingQr(false);
    }
  };

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
        <>
          <section className="mt-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Step 1 — Pay with QR</h2>
            <p className="mt-2 text-sm text-muted">
              Open <strong>PhonePe</strong> or <strong>GPay</strong>, scan the QR below, and pay{" "}
              <strong className="text-brand">{formatINRDecimal(order.amountINR)}</strong>. Mention order{" "}
              <strong className="text-brand">{order.displayOrderId}</strong> in the note if possible.
            </p>

            {showQr ? (
              <>
                <div className="mt-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment?.qrImagePath}
                    alt="Payment QR code — scan in PhonePe or GPay"
                    className="max-w-[240px] rounded-xl border border-border shadow-sm"
                    onError={() => setQrBroken(true)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleDownloadQr()}
                  disabled={downloadingQr}
                  className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {downloadingQr ? "Downloading…" : "Download QR code"}
                </button>
              </>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {payment?.showQrPayment === false
                  ? "QR payment is turned off. Use the UPI ID below in your payment app."
                  : "QR image is not available yet. Copy the UPI ID below and pay in PhonePe / GPay."}
              </p>
            )}

            <div className="mt-5 space-y-3 rounded-xl bg-surface/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">
                Or pay manually with UPI ID
              </p>

              {payment?.upiId && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-semibold text-brand">UPI ID:</span>{" "}
                    <span className="font-mono text-ink">{payment.upiId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleCopy("upi", payment.upiId)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-brand px-3 text-xs font-bold uppercase tracking-wide text-brand hover:bg-brand/5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedField === "upi" ? "Copied" : "Copy UPI ID"}
                  </button>
                </div>
              )}

              {payment?.upiPhone && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-semibold text-brand">PhonePe / GPay:</span>{" "}
                    <span className="font-mono text-ink">{payment.upiPhone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleCopy("phone", payment.upiPhone)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold uppercase tracking-wide text-brand hover:border-brand/40"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedField === "phone" ? "Copied" : "Copy number"}
                  </button>
                </div>
              )}

              <p className="text-xs text-muted">
                Paste the UPI ID in PhonePe / GPay → Pay → UPI ID. Do not use browser “open app” links —
                scan QR or copy UPI ID for reliable payment.
              </p>
            </div>
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
