import { NextRequest, NextResponse } from "next/server";
import { getOrderById, assignOrderToUser } from "@/lib/orders-db";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { assertOrderAccess } from "@/lib/order-access";

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

    if (access.ctx.kind === "customer" && order && !order.userId) {
      await assignOrderToUser(order.orderId, access.ctx.session.userId);
    }

    return NextResponse.json({
      order: {
        orderId: order!.orderId,
        displayOrderId: order!.displayOrderId,
        amountINR: order!.amountINR,
        paymentStatus: order!.paymentStatus,
        items: order!.items,
        customer: {
          name: order!.customer.name,
          email: order!.customer.email,
          phone: order!.customer.phone,
        },
        createdAt: order!.createdAt,
        paymentConfirmedAt: order!.paymentConfirmedAt,
        dtdcSentAt: order!.dtdcSentAt,
      },
      timeline: buildOrderTimeline(order!),
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Could not load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
