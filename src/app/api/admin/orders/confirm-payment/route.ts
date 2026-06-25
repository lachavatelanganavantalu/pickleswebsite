import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getOrderById, markOrderPaid } from "@/lib/orders-db";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order is already marked as paid." }, { status: 400 });
    }

    await markOrderPaid(orderId, "upi-manual");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/orders/confirm-payment:", err);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
