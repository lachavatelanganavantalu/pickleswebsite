import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders-db";
import { buildOrderTimeline } from "@/lib/order-timeline";

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

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        displayOrderId: order.displayOrderId,
        amountINR: order.amountINR,
        paymentStatus: order.paymentStatus,
        items: order.items,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
        },
        createdAt: order.createdAt,
        paymentConfirmedAt: order.paymentConfirmedAt,
        dtdcSentAt: order.dtdcSentAt,
      },
      timeline: buildOrderTimeline(order),
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Could not load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
