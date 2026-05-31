"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readPendingOrderSession, type PendingOrderSession } from "@/lib/pending-order-session";

export default function PendingOrderBanner() {
  const [pending, setPending] = useState<PendingOrderSession | null>(null);

  useEffect(() => {
    setPending(readPendingOrderSession());
    const onStorage = () => setPending(readPendingOrderSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!pending) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">
        Pending order {pending.displayOrderId ?? pending.orderId} — payment not completed yet
      </p>
      <p className="mt-1 text-xs text-amber-900/80">
        You can still edit your cart below. When ready, place the order again or resume payment for
        this order.
      </p>
      <Link
        href={`/order/${pending.orderId}/payment`}
        className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
      >
        Resume payment for pending order →
      </Link>
    </div>
  );
}
