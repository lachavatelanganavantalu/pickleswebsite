import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveOrderToDb } from "@/lib/orders-db";
import { generateDisplayOrderId } from "@/lib/order-id";
import { hasMongoDb, isVercelRuntime } from "@/lib/storage-env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (isVercelRuntime() && !hasMongoDb()) {
      return NextResponse.json(
        {
          error:
            "Orders are not configured on the server. Add MONGODB_URI in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 503 }
      );
    }

    const session = getCustomerSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Please log in to place an order." },
        { status: 401 }
      );
    }
    const userId = session.userId;
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
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json(
      {
        error:
          message.includes("MONGODB") || message.includes("Mongo")
            ? message
            : "Failed to create order. Please try again or contact us on WhatsApp.",
      },
      { status: 500 }
    );
  }
}
