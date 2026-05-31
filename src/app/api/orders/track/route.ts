import { NextRequest, NextResponse } from "next/server";
import { getOrderByDisplayId, getOrderById } from "@/lib/orders-db";
import { normalizePhone } from "@/lib/phone";
import { buildOrderTimeline } from "@/lib/order-timeline";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId")?.trim();
  const displayOrderId = req.nextUrl.searchParams.get("displayOrderId")?.trim();
  const phone = req.nextUrl.searchParams.get("phone")?.trim();

  if (!phone) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
  }
  if (!orderId && !displayOrderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
  }

  const order = orderId
    ? await getOrderById(orderId)
    : displayOrderId
      ? await getOrderByDisplayId(displayOrderId)
      : null;

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const orderPhone = normalizePhone(order.customer.phone);
  if (orderPhone !== normalizedPhone) {
    return NextResponse.json({ error: "Order not found for this mobile" }, { status: 404 });
  }

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
      customerDispatchNotifiedAt: order.customerDispatchNotifiedAt,
    },
    timeline: buildOrderTimeline(order),
  });
}
