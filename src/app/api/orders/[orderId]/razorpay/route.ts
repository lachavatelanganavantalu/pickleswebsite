import { NextRequest, NextResponse } from "next/server";
import { getOrderById, setRazorpayOrderId } from "@/lib/orders-db";
import { assertOrderAccess } from "@/lib/order-access";
import { getRazorpay } from "@/lib/razorpay";
import { getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: "Online payment is not configured" }, { status: 503 });
    }

    const { orderId } = await params;
    const order = await getOrderById(orderId);
    const access = assertOrderAccess(req, order);
    if (!access.ok) return access.response;

    if (order!.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    const amountPaise = Math.round(order!.amountINR * 100);
    if (amountPaise < 100) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order!.displayOrderId.slice(0, 40),
      notes: {
        internalOrderId: order!.orderId,
        displayOrderId: order!.displayOrderId,
      },
    });

    await setRazorpayOrderId(order!.orderId, rzpOrder.id);

    return NextResponse.json({
      key: getRazorpayKeyId(),
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      displayOrderId: order!.displayOrderId,
    });
  } catch (err) {
    console.error("POST /api/orders/[orderId]/razorpay:", err);
    return NextResponse.json({ error: "Could not start online payment" }, { status: 500 });
  }
}
