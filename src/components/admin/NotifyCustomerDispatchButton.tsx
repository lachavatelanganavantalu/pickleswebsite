"use client";

import { useState } from "react";
import { Order } from "@/lib/orders-db";
import { customerDispatchWhatsAppUrl } from "@/lib/customer-whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

interface Props {
  order: Order;
  onNotified?: () => void;
}

export default function NotifyCustomerDispatchButton({ order, onNotified }: Props) {
  const [loading, setLoading] = useState(false);
  const notified = !!order.customerDispatchNotifiedAt;

  const handleMarkNotified = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/orders/dispatch-notified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      onNotified?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={customerDispatchWhatsAppUrl(order)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Notify customer — dispatched
      </a>
      {!notified && (
        <button
          type="button"
          onClick={handleMarkNotified}
          disabled={loading}
          className="rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 disabled:opacity-50"
        >
          {loading ? "…" : "Mark as notified"}
        </button>
      )}
      {notified && (
        <span className="inline-flex items-center rounded-lg bg-forest-soft px-3 py-2.5 text-xs font-medium text-forest">
          Customer notified
        </span>
      )}
    </div>
  );
}
