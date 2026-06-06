"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { loginUrl } from "@/lib/customer-login-url";
import { writePendingOrderSession } from "@/lib/pending-order-session";
import { submitCartOrder, type OrderCustomer } from "@/lib/submit-cart-order";

interface Props {
  customer: OrderCustomer;
  disabled?: boolean;
}

export default function PlaceOrderButton({ customer, disabled }: Props) {
  const { items, totalINR } = useCart();
  const { setLastOrder } = useOrder();
  const { user } = useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push(loginUrl("/checkout"));
      return;
    }
    if (disabled || items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const orderPayload = await submitCartOrder({ customer, items, totalINR });

      setLastOrder(orderPayload);
      writePendingOrderSession(orderPayload);
      router.push(`/order/${orderPayload.orderId}/payment`);
    } catch (e) {
      if (e instanceof Error && e.message.includes("log in")) {
        router.push(loginUrl("/checkout"));
      }
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
      >
        {loading ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
