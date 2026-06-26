"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Order, PaymentStatus } from "@/lib/orders-db";
import SendToDtdcButton from "@/components/admin/SendToDtdcButton";
import NotifyCustomerDispatchButton from "@/components/admin/NotifyCustomerDispatchButton";
import AdminOrderNotes from "@/components/admin/AdminOrderNotes";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/cn";

type Filter = "all" | PaymentStatus;

function AdminOrderSteps({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const stepDone = (done: boolean) =>
    cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
      done ? "bg-forest text-white" : "bg-brand/10 text-brand"
    );

  if (order.paymentStatus === "pending") {
    return (
      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <span className={stepDone(false)}>1</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">Awaiting payment</p>
            <p className="mt-0.5 text-xs text-muted">
              Customer pays on the website via Razorpay. The order moves to paid automatically when
              payment succeeds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <div className="flex items-start gap-3">
        <span className={stepDone(true)}>1</span>
        <div>
          <p className="text-xs font-semibold text-forest">Payment confirmed (Razorpay)</p>
          {order.paymentConfirmedAt && (
            <p className="text-xs text-muted">
              {new Date(order.paymentConfirmedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className={stepDone(!!order.dtdcSentAt)}>2</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink">Send to DTDC</p>
          <p className="mt-0.5 text-xs text-muted">
            WhatsApp order {order.displayOrderId} to Kodipelli Shravan (+91 99495 25111)
          </p>
          {!order.dtdcSentAt && (
            <div className="mt-2">
              <SendToDtdcButton order={order} onSent={onRefresh} />
            </div>
          )}
          {order.dtdcSentAt && (
            <p className="mt-1 text-xs font-medium text-forest">
              Sent{" "}
              {new Date(order.dtdcSentAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </p>
          )}
        </div>
      </div>

      {order.dtdcSentAt && (
        <div className="flex items-start gap-3">
          <span className={stepDone(!!order.customerDispatchNotifiedAt)}>3</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">Notify customer — dispatched</p>
            <p className="mt-0.5 text-xs text-muted">
              WhatsApp {order.customer.name} that the order is on the way (5 working days or less).
            </p>
            {!order.customerDispatchNotifiedAt && (
              <div className="mt-2">
                <NotifyCustomerDispatchButton order={order} onNotified={onRefresh} />
              </div>
            )}
            {order.customerDispatchNotifiedAt && (
              <p className="mt-1 text-xs font-medium text-forest">
                Notified{" "}
                {new Date(order.customerDispatchNotifiedAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.paymentStatus === filter);
  }, [orders, filter]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      paid: orders.filter((o) => o.paymentStatus === "paid").length,
      pending: orders.filter((o) => o.paymentStatus === "pending").length,
    }),
    [orders]
  );

  return (
    <div className="p-4 sm:p-8 max-w-full overflow-x-hidden">
      <h1 className="font-display text-2xl text-ink">Orders</h1>
      <p className="text-sm text-muted mt-1">
        Razorpay payments move to paid automatically → Send to DTDC → Notify customer.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pending", counts.pending],
            ["paid", "Paid", counts.paid],
            ["all", "All", counts.all],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              filter === key
                ? "bg-brand text-white"
                : "border border-border bg-white text-brand hover:border-brand/40"
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-muted">No {filter === "all" ? "" : filter} orders yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((o) => (
            <article
              key={o.orderId}
              className="rounded-xl border border-border bg-surface-elevated p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-brand">{o.displayOrderId}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    ·{" "}
                    <span
                      className={
                        o.paymentStatus === "paid" ? "text-forest font-semibold" : "text-amber-600"
                      }
                    >
                      {o.paymentStatus}
                    </span>
                    {" · "}
                    {o.userId ? (
                      <span className="text-forest font-semibold">Registered account</span>
                    ) : o.isGuestCheckout !== false ? (
                      <span className="text-amber-700 font-semibold">Guest checkout</span>
                    ) : (
                      <span className="text-muted">No account linked</span>
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    {o.customer.name} · {o.customer.phone}
                  </p>
                  <p className="text-xs text-muted">
                    {o.customer.address}, {o.customer.city}, {o.customer.state} {o.customer.zip}
                  </p>
                  {o.paymentId && o.paymentId !== "manual" && o.paymentId !== "upi-manual" && (
                    <p className="mt-1 text-xs text-muted">Payment ref: {o.paymentId}</p>
                  )}
                </div>
                <p className="text-lg font-semibold text-brand">{formatINR(o.amountINR)}</p>
              </div>

              <ul className="mt-4 text-sm text-muted space-y-1 border-t border-border pt-3">
                {o.items.map((item, i) => (
                  <li key={i}>
                    {item.productName} ({item.variantLabel}) × {item.quantity} — ₹
                    {item.priceINR * item.quantity}
                  </li>
                ))}
              </ul>

              <AdminOrderSteps order={o} onRefresh={load} />
              <AdminOrderNotes order={o} onSaved={load} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
