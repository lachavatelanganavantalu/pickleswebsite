"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { readJsonResponse } from "@/lib/read-json-response";
import { clearPendingOrderSession } from "@/lib/pending-order-session";
import { updateGuestOrderSessionPaid } from "@/lib/guest-order-session";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Props {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  customer: CustomerInfo;
  directPayWhatsappUrl: string;
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

export default function RazorpayOrderPayment({
  orderId,
  displayOrderId,
  amountINR,
  customer,
  directPayWhatsappUrl,
  disabled,
}: Props) {
  const router = useRouter();
  const { clearCart } = useCart();
  const { setLastOrder } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayFailed, setRazorpayFailed] = useState(false);

  const handlePayOnline = async () => {
    if (disabled) return;
    setLoading(true);
    setError("");
    setRazorpayFailed(false);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/razorpay`, {
        method: "POST",
      });
      const data = await readJsonResponse<{
        error?: string;
        key: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
      }>(res);
      if (!res.ok) throw new Error(data.error || "Could not start online payment");

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load");

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Assal Heritage Pickles",
        description: `Order ${displayOrderId}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email || "",
          contact: customer.phone,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setRazorpayFailed(true);
            setError(verifyData.error || "Payment verification failed");
            return;
          }
          const payload = {
            orderId: verifyData.orderId,
            displayOrderId: verifyData.displayOrderId,
            paymentId: verifyData.paymentId,
            amountINR: verifyData.amountINR,
            items: verifyData.items,
            paymentStatus: verifyData.paymentStatus || "paid",
          };
          setLastOrder(payload);
          sessionStorage.setItem("orderSuccess", JSON.stringify(payload));
          updateGuestOrderSessionPaid({
            paymentStatus: "paid",
            paymentId: verifyData.paymentId,
            paidAt: new Date().toISOString(),
            items: verifyData.items,
            customer: verifyData.customer,
          });
          clearCart();
          clearPendingOrderSession();
          router.push("/checkout/success");
        },
        theme: { color: "#5c3317" },
      });

      rzp.on("payment.failed", () => {
        setRazorpayFailed(true);
        setError("Online payment was declined or failed. You can pay us directly on WhatsApp.");
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
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <button
        type="button"
        onClick={() => void handlePayOnline()}
        disabled={disabled || loading}
        className="flex w-full min-h-[48px] items-center justify-center rounded-full bg-brand px-5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        data-ai-target="pay-with-razorpay"
      >
        {loading ? "Opening payment…" : `Pay online — ₹${amountINR}`}
      </button>

      {razorpayFailed && (
        <a
          href={directPayWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-[#25D366]/10 px-5 text-sm font-bold uppercase tracking-wide text-[#128C7E] hover:bg-[#25D366]/20"
          data-ai-target="pay-directly-whatsapp"
        >
          <MessageCircle className="h-5 w-5" />
          Pay directly on WhatsApp
        </a>
      )}
    </div>
  );
}
