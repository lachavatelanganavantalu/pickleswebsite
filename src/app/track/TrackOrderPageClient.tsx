"use client";

import { useState } from "react";
import Link from "next/link";
import OrderTimeline from "@/components/OrderTimeline";
import { formatINRDecimal } from "@/lib/format-price";
import type { TimelineStep } from "@/lib/order-timeline";

export default function TrackOrderPageClient() {
  const [displayOrderId, setDisplayOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{
    displayOrderId: string;
    amountINR: number;
    paymentStatus: string;
    items: { productName: string; variantLabel: string; quantity: number }[];
    customer: { name: string; phone: string };
  } | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none";

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setTimeline([]);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        displayOrderId: displayOrderId.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not find order");
      setOrder(data.order);
      setTimeline(data.timeline ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Track failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-content py-[clamp(1.25rem,4vw,2rem)] max-w-lg mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Track order</p>
      <h1 className="shop-page-title mt-1">Where is my order?</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order ID and mobile number used at checkout.
      </p>

      <form onSubmit={handleTrack} className="mt-6 space-y-4 rounded-2xl border border-border bg-white p-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <label className="block">
          <span className="text-xs font-semibold uppercase text-muted">Order ID</span>
          <input
            required
            value={displayOrderId}
            onChange={(e) => setDisplayOrderId(e.target.value)}
            placeholder="e.g. 26M28310001"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-muted">Mobile number</span>
          <input
            required
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="shop-select-btn disabled:opacity-50"
        >
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      {order && (
        <section className="mt-6 rounded-2xl border border-border bg-white p-5">
          <p className="text-lg font-bold text-brand">{order.displayOrderId}</p>
          <p className="mt-1 text-sm text-muted">
            {order.customer.name} · {formatINRDecimal(order.amountINR)} ·{" "}
            <span className={order.paymentStatus === "paid" ? "text-forest font-semibold" : "text-amber-600 font-semibold"}>
              {order.paymentStatus}
            </span>
          </p>
          <ul className="mt-3 text-xs text-muted space-y-1">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.productName} ({item.variantLabel}) × {item.quantity}
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <OrderTimeline steps={timeline} />
          </div>
          {timeline.some((s) => s.id === "track_dtdc" && s.done) && (
            <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-muted">
              DTDC will contact you on <strong>{order.customer.phone}</strong>. For delivery updates,
              please follow up with DTDC directly on your registered number.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Need help?{" "}
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
