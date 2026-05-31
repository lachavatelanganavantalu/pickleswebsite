import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isDemoPaymentsEnabled } from "@/lib/demo-payments";
import { getRazorpay } from "@/lib/razorpay";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveOrder } from "@/lib/order-store";
import { createPaidOrder, saveOrderToDb } from "@/lib/orders-db";
import { generateDisplayOrderId } from "@/lib/order-id";

export async function POST(req: NextRequest) {
  try {
    const session = getCustomerSession(req);
    const userId = session?.userId;
    const body = await req.json();
    const { amountINR, items, customer } = body;

    if (!amountINR || amountINR <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!items?.length || !customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }

    const displayOrderId = await generateDisplayOrderId();
    const orderItems = items.map(
      (i: {
        productName: string;
        variantLabel: string;
        quantity: number;
        priceINR: number;
      }) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        priceINR: i.priceINR,
      })
    );

    const customerData = {
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
      country: customer.country || "India",
    };

    if (isDemoPaymentsEnabled()) {
      const orderId = `demo_${crypto.randomUUID()}`;
      const paymentId = `demo_pay_${Date.now()}`;

      await createPaidOrder(
        orderId,
        displayOrderId,
        paymentId,
        orderItems,
        amountINR,
        customerData,
        userId
      );

      return NextResponse.json({
        demo: true,
        orderId,
        displayOrderId,
        paymentId,
        amountINR,
        paymentStatus: "paid",
        items: orderItems,
        customer: customerData,
      });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amountINR * 100),
      currency: "INR",
      receipt: displayOrderId,
    });

    saveOrder({
      orderId: order.id,
      displayOrderId,
      amountINR,
      items: orderItems,
      customer: customerData,
    });

    await saveOrderToDb(order.id, displayOrderId, orderItems, amountINR, customerData, userId);

    return NextResponse.json({
      demo: false,
      orderId: order.id,
      displayOrderId,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("POST /api/create-order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
