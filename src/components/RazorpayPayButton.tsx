"use client";

import { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { readJsonResponse } from "@/lib/read-json-response";
import { formatINRDecimal } from "@/lib/format-price";
import { loginUrl } from "@/lib/customer-login-url";
import { navigateAfterRazorpayPayment, cleanupRazorpayCheckout } from "@/lib/razorpay-cleanup";
import { writePaidOrderSession } from "@/lib/paid-order-session";
import { clearPendingOrderSession } from "@/lib/pending-order-session";

interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

interface Props {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  customer: CustomerInfo;
  disabled?: boolean;
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPayButton({
  orderId,
  displayOrderId,
  amountINR,
  customer,
  disabled,
}: Props) {
  const { setLastOrder } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (disabled) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const checkout = await readJsonResponse<{
        error?: string;
        orderId: string;
        key?: string;
        amount?: number;
        currency?: string;
      }>(res);

      if (res.status === 401) {
        window.location.href = loginUrl(`/order/${orderId}/payment`);
        return;
      }

      if (!res.ok) {
        throw new Error(checkout.error || "Could not start payment");
      }
      if (!checkout.key || checkout.amount == null || !checkout.currency) {
        throw new Error("Invalid payment session");
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load");

      const rzp = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "Lachava Telangana Vantalu",
        description: `Order ${displayOrderId}`,
        order_id: checkout.orderId,
        prefill: {
          name: customer.name,
          email: customer.email || "",
          contact: customer.phone,
        },
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          void (async () => {
            try {
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const data = await readJsonResponse<{
                error?: string;
                orderId: string;
                displayOrderId: string;
                paymentId: string;
                amountINR: number;
                paymentStatus: string;
                items: { productName: string; variantLabel: string; quantity: number }[];
                customer?: { phone?: string };
              }>(verifyRes);

              if (verifyRes.status === 401) {
                window.location.href = loginUrl(`/order/${orderId}/payment`);
                return;
              }

              if (!verifyRes.ok) {
                setError(data.error || "Payment verification failed");
                setLoading(false);
                return;
              }

              const confirmed = {
                orderId: data.orderId,
                displayOrderId: data.displayOrderId,
                paymentId: data.paymentId,
                amountINR: data.amountINR,
                items: data.items,
                paymentStatus: "paid",
                customerPhone: data.customer?.phone ?? customer.phone,
              };

              setLastOrder(confirmed);
              writePaidOrderSession(confirmed);
              clearPendingOrderSession();
              navigateAfterRazorpayPayment("/checkout/success");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment verification failed");
              setLoading(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            cleanupRazorpayCheckout();
          },
        },
        theme: { color: "#5c3317" },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={disabled || loading}
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {loading ? "Opening Razorpay…" : `Pay ${formatINRDecimal(amountINR)} with Razorpay`}
      </button>
    </div>
  );
}
