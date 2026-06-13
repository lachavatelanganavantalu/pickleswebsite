import type { Order } from "./orders-db";

export type TimelineStepId =
  | "placed"
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
      id: "payment_confirmed",
      title: paid ? "Payment confirmed" : "Awaiting payment",
      description: paid
        ? "Paid online via Razorpay. We are preparing your pickles."
        : "Complete payment with Razorpay to confirm your order.",
      done: paid,
      active: !paid || (!dtdcSent && paid),
      at: order.paymentConfirmedAt ? String(order.paymentConfirmedAt) : undefined,
    },
    {
      id: "dtdc_sent",
      title: "Sent to DTDC",
      description: dtdcSent
        ? "Your parcel is handed to DTDC for delivery."
        : "Your order will be sent to DTDC after payment.",
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
