"use client";

import { useEffect, useRef } from "react";
import { Download, X } from "lucide-react";
import {
  type GuestReceiptData,
  downloadGuestReceiptHtml,
  downloadGuestReceiptText,
  formatReceiptDateTime,
} from "@/lib/guest-receipt";
import { formatINRDecimal } from "@/lib/format-price";

interface Props {
  open: boolean;
  onClose: () => void;
  receipt: GuestReceiptData;
}

export default function GuestPaidReceiptModal({ open, onClose, receipt }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const address = [receipt.customer.address, receipt.customer.city, receipt.customer.state, receipt.customer.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-receipt-title"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-border bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-forest">Payment confirmed</p>
            <h2 id="guest-receipt-title" className="mt-1 text-lg font-bold text-brand">
              Your order receipt
            </h2>
            <p className="mt-1 text-xs text-muted">
              Guest checkout — save this to your device. It will not appear in My account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-muted hover:bg-surface hover:text-brand"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          <div className="rounded-xl bg-surface/80 p-4 space-y-2">
            <p>
              <span className="font-semibold text-brand">Order ID:</span> {receipt.displayOrderId}
            </p>
            {receipt.orderedAt && (
              <p>
                <span className="font-semibold text-brand">Ordered:</span>{" "}
                {formatReceiptDateTime(receipt.orderedAt)}
              </p>
            )}
            <p>
              <span className="font-semibold text-brand">Paid:</span>{" "}
              {formatReceiptDateTime(receipt.paidAt)}
            </p>
            {receipt.paymentId && (
              <p>
                <span className="font-semibold text-brand">Payment ref:</span> {receipt.paymentId}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Customer</p>
            <p className="mt-1">{receipt.customer.name}</p>
            <p className="text-muted">{receipt.customer.phone}</p>
            {receipt.customer.email && <p className="text-muted">{receipt.customer.email}</p>}
            {address && <p className="text-muted text-xs mt-1">{address}</p>}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Items paid for</p>
            <ul className="mt-2 space-y-2">
              {receipt.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-border/60 pb-2">
                  <span>
                    {item.productName}{" "}
                    <span className="text-muted">({item.variantLabel}) × {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-brand">
                    {formatINRDecimal(item.priceINR * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between text-base font-bold text-brand">
              <span>Total</span>
              <span>{formatINRDecimal(receipt.amountINR)}</span>
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => downloadGuestReceiptHtml(receipt)}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            data-ai-target="download-guest-receipt"
          >
            <Download className="h-4 w-4" />
            Save receipt to device
          </button>
          <button
            type="button"
            onClick={() => downloadGuestReceiptText(receipt)}
            className="min-h-[44px] w-full rounded-full border border-border text-sm font-semibold text-brand hover:border-brand/40"
          >
            Download as text file
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] w-full text-sm font-semibold text-muted hover:text-brand"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
