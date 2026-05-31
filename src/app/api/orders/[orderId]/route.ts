import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders-db";
import { getSiteSettings } from "@/lib/site-settings-db";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { adminPaymentProofWhatsAppUrl } from "@/lib/payment-whatsapp";
import { buildUpiPayUrl } from "@/lib/upi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const settings = await getSiteSettings();
  const payment = settings.payment ?? {
    upiId: "6302112848@ybl",
    upiPhone: "6302112848",
    qrImagePath: "/payment-qr.png",
    payeeName: "Lachava Telangana Vantalu",
  };

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
        ? adminPaymentProofWhatsAppUrl(order, settings.contact.whatsapp)
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
}
