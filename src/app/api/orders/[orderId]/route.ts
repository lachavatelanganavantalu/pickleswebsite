import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders-db";
import { getSiteSettings } from "@/lib/site-settings-db";
import { defaultSiteSettings } from "@/data/default-site-settings";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { adminPaymentProofWhatsAppUrl } from "@/lib/payment-whatsapp";
import { buildUpiPayUrl } from "@/lib/upi";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const settings = await getSiteSettings();
    const payment = settings.payment ?? defaultSiteSettings.payment;
    const adminWhatsApp =
      settings.contact?.whatsapp?.trim() || defaultSiteSettings.contact.whatsapp;

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        displayOrderId: order.displayOrderId,
        amountINR: order.amountINR,
        paymentStatus: order.paymentStatus,
        items: order.items,
        customer: { name: order.customer.name, phone: order.customer.phone },
        createdAt: order.createdAt,
        paymentConfirmedAt: order.paymentConfirmedAt,
        dtdcSentAt: order.dtdcSentAt,
      },
      payment,
      timeline: buildOrderTimeline(order),
      whatsappUrl:
        order.paymentStatus === "pending"
          ? adminPaymentProofWhatsAppUrl(order, adminWhatsApp)
          : null,
      upiPayUrl:
        order.paymentStatus === "pending"
          ? buildUpiPayUrl({
              upiId: payment.upiId,
              payeeName: payment.payeeName,
              amountINR: order.amountINR,
              note: order.displayOrderId,
            })
          : null,
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Could not load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
