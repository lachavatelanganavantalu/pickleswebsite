import type { Order } from "./orders-db";

export type TimelineStepId =
  | "placed"
  | "awaiting_payment"
  | "payment_confirmed"
  | "dtdc_sent"
  | "track_dtdc";

export interface TimelineStep {
  id: TimelineStepId;
  title: string;
  description: string;
  done: boolean;
  active: boolean;
  at?: string;
}

export function buildOrderTimeline(order: Order): TimelineStep[] {
  const paid = order.paymentStatus === "paid";
  const dtdcSent = Boolean(order.dtdcSentAt);

  const steps: TimelineStep[] = [
    {
      id: "placed",
      title: "Order placed",
      description: "We received your order details.",
      done: true,
      active: !paid && !dtdcSent,
      at: String(order.createdAt),
    },
    {
      id: "awaiting_payment",
      title: "Pay via UPI / QR",
      description: paid
        ? "Payment received — thank you."
        : "Scan the QR or pay on PhonePe / GPay, then send payment screenshot on WhatsApp.",
      done: paid,
      active: !paid,
      at: paid ? String(order.paymentConfirmedAt ?? order.createdAt) : undefined,
    },
    {
      id: "payment_confirmed",
      title: "Order confirmed",
      description: paid
        ? "Admin verified your payment. We are preparing your pickles."
        : "Waiting for admin to verify your payment screenshot.",
      done: paid,
      active: paid && !dtdcSent,
      at: order.paymentConfirmedAt ? String(order.paymentConfirmedAt) : undefined,
    },
    {
      id: "dtdc_sent",
      title: "Sent to DTDC",
      description: dtdcSent
        ? "Your parcel is handed to DTDC for delivery."
        : "Your order will be sent to DTDC after confirmation.",
      done: dtdcSent,
      active: paid && !dtdcSent,
      at: order.dtdcSentAt ? String(order.dtdcSentAt) : undefined,
    },
    {
      id: "track_dtdc",
      title: "Delivery via DTDC",
      description: dtdcSent
        ? "DTDC will contact you on your registered mobile. Please follow up with DTDC for tracking."
        : "Available once the order is sent to DTDC.",
      done: dtdcSent,
      active: dtdcSent,
      at: order.dtdcSentAt ? String(order.dtdcSentAt) : undefined,
    },
  ];

  return steps;
}
