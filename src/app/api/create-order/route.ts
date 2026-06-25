import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveOrderToDb } from "@/lib/orders-db";
import { generateDisplayOrderId } from "@/lib/order-id";
import {
  generatePaymentAccessToken,
  hashPaymentAccessToken,
  setOrderPaymentAccessCookie,
} from "@/lib/order-payment-token";
import { normalizePhone } from "@/lib/phone";
import { assertProductionSecretsConfigured } from "@/lib/production-secrets";
import { hasMongoDb, isVercelRuntime } from "@/lib/storage-env";
import { validateCartLineItems, type CartLineInput } from "@/lib/validate-order-items";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      assertProductionSecretsConfigured();
    }

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
    const userId = session?.userId;
    const body = await req.json();
    const { items, customer, guestCheckout } = body;

    if (!items?.length || !customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }
    if (!normalizePhone(customer.phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (session) {
      const sessionPhone = normalizePhone(session.phone);
      const customerPhone = normalizePhone(customer.phone);
      if (!sessionPhone || !customerPhone || sessionPhone !== customerPhone) {
        return NextResponse.json(
          { error: "Mobile number must match your account." },
          { status: 400 }
        );
      }
    } else if (guestCheckout === false) {
      return NextResponse.json({ error: "Please log in to place an order." }, { status: 401 });
    }

    const cartLines: CartLineInput[] = items.map(
      (i: { productId?: string; variantId?: string; quantity?: number }) => ({
        productId: String(i.productId || ""),
        variantId: String(i.variantId || ""),
        quantity: Number(i.quantity) || 1,
      })
    );

    const priced = await validateCartLineItems(cartLines);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: 400 });
    }

    const { items: orderItems, amountINR } = priced;
    const isGuest = !userId && guestCheckout !== false;

    const displayOrderId = await generateDisplayOrderId();
    const orderId = `lach_${crypto.randomUUID()}`;

    const customerData = {
      name: String(customer.name).trim().slice(0, 120),
      email: String(customer.email || "").trim().slice(0, 120),
      phone: customer.phone,
      address: String(customer.address || "").trim().slice(0, 300),
      city: String(customer.city || "").trim().slice(0, 80),
      state: String(customer.state || "").trim().slice(0, 80),
      zip: String(customer.zip || "").trim().slice(0, 12),
      country: String(customer.country || "India").trim().slice(0, 80),
    };

    const paymentAccessToken = isGuest ? generatePaymentAccessToken() : undefined;
    const paymentAccessTokenHash = paymentAccessToken
      ? hashPaymentAccessToken(paymentAccessToken)
      : undefined;

    await saveOrderToDb(orderId, displayOrderId, orderItems, amountINR, customerData, {
      userId,
      isGuestCheckout: userId ? false : guestCheckout !== false,
      paymentAccessTokenHash,
    });

    const res = NextResponse.json({
      orderId,
      displayOrderId,
      amountINR,
      paymentStatus: "pending",
      items: orderItems,
      customer: customerData,
      guestCheckout: isGuest,
    });

    if (paymentAccessToken) {
      setOrderPaymentAccessCookie(res, orderId, paymentAccessToken);
    }

    return res;
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
