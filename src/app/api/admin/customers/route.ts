import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAllOrders } from "@/lib/orders-db";
import { listAllUsers } from "@/lib/users-db";
import { normalizePhone } from "@/lib/phone";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [registered, orders] = await Promise.all([listAllUsers(), getAllOrders()]);

    const registeredPhones = new Set(registered.map((u) => u.phone));
    const guestMap = new Map<
      string,
      { phone: string; name: string; orderCount: number; lastOrderAt: string }
    >();

    for (const order of orders) {
      if (!order.isGuestCheckout && order.userId) continue;
      const phone = normalizePhone(order.customer.phone);
      if (!phone) continue;
      if (registeredPhones.has(phone) && order.userId) continue;

      const existing = guestMap.get(phone);
      const createdAt =
        typeof order.createdAt === "string"
          ? order.createdAt
          : order.createdAt.toISOString();

      if (!existing) {
        guestMap.set(phone, {
          phone: order.customer.phone,
          name: order.customer.name,
          orderCount: 1,
          lastOrderAt: createdAt,
        });
      } else {
        existing.orderCount += 1;
        if (new Date(createdAt).getTime() > new Date(existing.lastOrderAt).getTime()) {
          existing.lastOrderAt = createdAt;
          existing.name = order.customer.name;
        }
      }
    }

    const guests = [...guestMap.values()].sort(
      (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
    );

    return NextResponse.json({ registered, guests });
  } catch (err) {
    console.error("GET /api/admin/customers:", err);
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}
