import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCustomerSession } from "@/lib/customer-auth";
import { customerOwnsOrder, isGuestPaymentOrder } from "@/lib/order-access";
import { getOrder, deleteOrder } from "@/lib/order-store";
import { assignOrderToUser, getOrderByRazorpayId, markOrderPaid } from "@/lib/orders-db";
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

    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const dbOrder = await getOrderByRazorpayId(razorpayOrderId);
    if (!dbOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = getCustomerSession(req);
    const guestPayment = isGuestPaymentOrder(dbOrder);

    if (!guestPayment) {
      if (!session) {
        return NextResponse.json({ error: "Please log in to complete payment." }, { status: 401 });
      }
      if (!customerOwnsOrder(session, dbOrder)) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    if (dbOrder.paymentStatus === "paid") {
      if (dbOrder.paymentId === paymentId) {
        return NextResponse.json({
          orderId: dbOrder.orderId,
          displayOrderId: dbOrder.displayOrderId,
          paymentId: dbOrder.paymentId,
          amountINR: dbOrder.amountINR,
          paymentStatus: "paid",
          items: dbOrder.items,
          customer: dbOrder.customer,
        });
      }
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    if (session && !dbOrder.userId && dbOrder.isGuestCheckout === false) {
      await assignOrderToUser(dbOrder.orderId, session.userId);
    }

    let orderData = getOrder(razorpayOrderId);
    if (!orderData) {
      orderData = {
        orderId: dbOrder.orderId,
        displayOrderId: dbOrder.displayOrderId,
        amountINR: dbOrder.amountINR,
        items: dbOrder.items,
        customer: dbOrder.customer,
      };
    }

    await markOrderPaid(dbOrder.orderId, paymentId);

    if (getOrder(razorpayOrderId)) {
      deleteOrder(razorpayOrderId);
    }

    return NextResponse.json({
      orderId: dbOrder.orderId,
      displayOrderId: orderData.displayOrderId,
      paymentId,
      amountINR: orderData.amountINR,
      paymentStatus: "paid",
      items: orderData.items,
      customer: orderData.customer,
    });
  } catch (err) {
    console.error("POST /api/verify-payment:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
