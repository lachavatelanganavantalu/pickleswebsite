import { NextRequest, NextResponse } from "next/server";
import { getOrderById, assignOrderToUser } from "@/lib/orders-db";
import { getSiteSettings } from "@/lib/site-settings-db";
import { defaultSiteSettings } from "@/data/default-site-settings";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { assertOrderAccess } from "@/lib/order-access";
import { publicPaymentSettings } from "@/lib/payment-qr";
import {
  adminPaymentProofWhatsAppUrl,
  razorpayFailureDirectPayWhatsAppUrl,
} from "@/lib/payment-whatsapp";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);
    const access = assertOrderAccess(req, order);
    if (!access.ok) return access.response;

    if (
      access.ctx.kind === "customer" &&
      order &&
      !order.userId &&
      order.isGuestCheckout === false
    ) {
      await assignOrderToUser(order.orderId, access.ctx.session.userId);
    }

    const settings = await getSiteSettings();
    const payment = publicPaymentSettings(settings);
    const adminWhatsApp =
      settings.contact?.whatsapp?.trim() || defaultSiteSettings.contact.whatsapp;

    return NextResponse.json({
      order: {
        orderId: order!.orderId,
        displayOrderId: order!.displayOrderId,
        amountINR: order!.amountINR,
        paymentStatus: order!.paymentStatus,
        paymentId: order!.paymentId,
        isGuestCheckout: order!.isGuestCheckout ?? !order!.userId,
        items: order!.items,
        customer: order!.customer,
        createdAt: order!.createdAt,
        paymentConfirmedAt: order!.paymentConfirmedAt,
        dtdcSentAt: order!.dtdcSentAt,
      },
      payment,
      razorpayEnabled: isRazorpayConfigured(),
      timeline: buildOrderTimeline(order!),
      whatsappUrl:
        order!.paymentStatus === "pending"
          ? adminPaymentProofWhatsAppUrl(order!, adminWhatsApp)
          : null,
      directPayWhatsappUrl:
        order!.paymentStatus === "pending"
          ? razorpayFailureDirectPayWhatsAppUrl(order!, adminWhatsApp)
          : null,
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Could not load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
