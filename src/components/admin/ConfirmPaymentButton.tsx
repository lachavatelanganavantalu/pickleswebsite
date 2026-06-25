"use client";

import { useState } from "react";
import type { Order } from "@/lib/orders-db";

interface Props {
  order: Order;
  onConfirmed?: () => void;
}

export default function ConfirmPaymentButton({ order, onConfirmed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    const ok = window.confirm(
      `Mark order ${order.displayOrderId} as paid?\n\nOnly do this after you have verified the customer's UPI / QR / bank payment or WhatsApp screenshot.`
    );
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not confirm payment");
      onConfirmed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not confirm payment");
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
        className="rounded-lg bg-forest px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        data-ai-target="confirm-payment"
      >
        {loading ? "Confirming…" : "Confirm payment received"}
      </button>
    </div>
  );
}
