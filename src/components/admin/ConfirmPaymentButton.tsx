"use client";

import { useState } from "react";
import { Order } from "@/lib/orders-db";
import { customerPaymentWhatsAppUrl } from "@/lib/customer-whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

interface Props {
  order: Order;
  onConfirmed?: () => void;
}

export default function ConfirmPaymentButton({ order, onConfirmed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not confirm payment");

      onConfirmed?.();
      window.open(customerPaymentWhatsAppUrl(order), "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        <WhatsAppIcon className="h-4 w-4" />
        {loading ? "Confirming…" : "Confirm payment & WhatsApp customer"}
      </button>
    </div>
  );
}
