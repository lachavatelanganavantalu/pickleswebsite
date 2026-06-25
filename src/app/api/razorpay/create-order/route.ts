import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { assignOrderToUser, getOrderById, setRazorpayOrderId } from "@/lib/orders-db";
import { customerOwnsOrder, isGuestPaymentOrder } from "@/lib/order-access";
import { getRazorpay } from "@/lib/razorpay";
import { getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay-config";
import { saveOrder } from "@/lib/order-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error:
            "Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.",
        },
        { status: 503 }
      );
    }

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = getCustomerSession(req);
    const guestPayment = isGuestPaymentOrder(order);

    if (!guestPayment) {
      if (!session) {
        return NextResponse.json({ error: "Please log in to pay." }, { status: 401 });
      }
      if (!customerOwnsOrder(session, order)) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    if (session && !order.userId && order.isGuestCheckout === false) {
      await assignOrderToUser(order.orderId, session.userId);
    }

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.amountINR * 100),
      currency: "INR",
      receipt: order.displayOrderId,
      notes: { lachava_order_id: order.orderId },
    });

    await setRazorpayOrderId(order.orderId, rzpOrder.id);

    saveOrder({
      orderId: rzpOrder.id,
      displayOrderId: order.displayOrderId,
      amountINR: order.amountINR,
      items: order.items,
      customer: order.customer,
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      lachavaOrderId: order.orderId,
      displayOrderId: order.displayOrderId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: getRazorpayKeyId(),
    });
  } catch (err) {
    console.error("POST /api/razorpay/create-order:", err);
    return NextResponse.json({ error: "Could not start Razorpay checkout" }, { status: 500 });
  }
}
