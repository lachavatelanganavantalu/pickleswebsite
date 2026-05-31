import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveOrderToDb } from "@/lib/orders-db";
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
    const orderId = `lach_${crypto.randomUUID()}`;

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

    await saveOrderToDb(orderId, displayOrderId, orderItems, amountINR, customerData, userId);

    return NextResponse.json({
      orderId,
      displayOrderId,
      amountINR,
      paymentStatus: "pending",
      items: orderItems,
      customer: customerData,
    });
  } catch (err) {
    console.error("POST /api/create-order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
