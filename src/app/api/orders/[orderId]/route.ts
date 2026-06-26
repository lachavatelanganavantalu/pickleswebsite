import { NextRequest, NextResponse } from "next/server";
import { getOrderById, assignOrderToUser } from "@/lib/orders-db";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { assertOrderAccess } from "@/lib/order-access";
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
      razorpayEnabled: isRazorpayConfigured(),
      timeline: buildOrderTimeline(order!),
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Could not load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
