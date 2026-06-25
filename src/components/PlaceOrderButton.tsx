"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/read-json-response";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { writePendingOrderSession } from "@/lib/pending-order-session";
import { writeGuestOrderSession } from "@/lib/guest-order-session";

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Props {
  customer: CustomerForm;
  disabled?: boolean;
  guestCheckout?: boolean;
}

export default function PlaceOrderButton({ customer, disabled, guestCheckout }: Props) {
  const { items, totalINR } = useCart();
  const { setLastOrder } = useOrder();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (disabled || items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          customer,
          guestCheckout: guestCheckout ?? true,
        }),
      });
      const data = await readJsonResponse<{
        error?: string;
        orderId: string;
        displayOrderId: string;
        amountINR: number;
        items: {
          productName: string;
          variantLabel: string;
          quantity: number;
          priceINR: number;
        }[];
        customer: CustomerForm;
        paymentStatus?: string;
      }>(res);
      if (!res.ok) throw new Error(data.error || "Could not place order");

      const orderItems = items.map((i) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        priceINR: i.priceINR,
      }));

      const orderPayload = {
        orderId: data.orderId,
        displayOrderId: data.displayOrderId,
        paymentId: "",
        amountINR: data.amountINR,
        items: data.items.length ? data.items : orderItems,
        paymentStatus: data.paymentStatus || "pending",
      };

      setLastOrder(orderPayload);
      writePendingOrderSession(orderPayload);

      if (guestCheckout) {
        writeGuestOrderSession({
          isGuestCheckout: true,
          orderId: data.orderId,
          displayOrderId: data.displayOrderId,
          amountINR: data.amountINR,
          paymentStatus: data.paymentStatus || "pending",
          items: data.items.length ? data.items : orderItems,
          customer: data.customer ?? customer,
          orderedAt: new Date().toISOString(),
        });
      }

      router.push(`/order/${data.orderId}/payment`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={disabled || loading || items.length === 0}
        className="w-full min-h-[48px] rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-ai-target="place-order"
      >
        {loading ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
