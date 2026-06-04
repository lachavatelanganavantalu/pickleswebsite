"use client";

import { useState } from "react";
import { Order } from "@/lib/orders-db";
import { dtdcWhatsAppUrl, DTDC_CONTACT_NAME } from "@/lib/dtdc-whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

interface Props {
  order: Order;
  onSent?: () => void;
}

export default function SendToDtdcButton({ order, onSent }: Props) {
  const [loading, setLoading] = useState(false);
  const sent = !!order.dtdcSentAt;

  const handleMarkSent = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/orders/dtdc-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      onSent?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={dtdcWhatsAppUrl(order)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Send to DTDC — {DTDC_CONTACT_NAME}
      </a>
      {!sent && (
        <button
          type="button"
          onClick={handleMarkSent}
          disabled={loading}
          className="rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 disabled:opacity-50"
        >
          {loading ? "…" : "Mark as sent to DTDC"}
        </button>
      )}
      {sent && (
        <span className="inline-flex items-center rounded-lg bg-forest-soft px-3 py-2.5 text-xs font-medium text-forest">
          Sent to DTDC
        </span>
      )}
    </div>
  );
}
