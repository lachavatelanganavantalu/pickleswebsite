import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, deleteOrder } from "@/lib/order-store";
import { getOrderByRazorpayId, markOrderPaid } from "@/lib/orders-db";
import { getRazorpayKeySecret } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = await req.json();

    if (!razorpayOrderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const secret = getRazorpayKeySecret();
    if (!secret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let orderData = getOrder(razorpayOrderId);
    const dbOrder = await getOrderByRazorpayId(razorpayOrderId);

    if (!orderData && dbOrder) {
      orderData = {
        orderId: dbOrder.orderId,
        displayOrderId: dbOrder.displayOrderId,
        amountINR: dbOrder.amountINR,
        items: dbOrder.items,
        customer: dbOrder.customer,
      };
    }

    const internalOrderId = dbOrder?.orderId ?? orderData?.orderId ?? razorpayOrderId;
    await markOrderPaid(internalOrderId, paymentId);

    if (getOrder(razorpayOrderId)) {
      deleteOrder(razorpayOrderId);
    }

    return NextResponse.json({
      orderId: internalOrderId,
      displayOrderId: orderData?.displayOrderId ?? internalOrderId,
      paymentId,
      amountINR: orderData?.amountINR ?? dbOrder?.amountINR ?? 0,
      paymentStatus: "paid",
      items: orderData?.items ?? dbOrder?.items ?? [],
      customer: orderData?.customer ?? dbOrder?.customer,
    });
  } catch (err) {
    console.error("POST /api/verify-payment:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
