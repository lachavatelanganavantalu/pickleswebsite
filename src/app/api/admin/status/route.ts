import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAllOrders } from "@/lib/orders-db";
import { getAllProducts } from "@/lib/products-db";
import { getAllCombos } from "@/lib/combos-db";
import { isAdminConfigured } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [orders, products, combos] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    getAllCombos(),
  ]);
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paid.reduce((s, o) => s + o.amountINR, 0);
  return NextResponse.json({
    ordersCount: orders.length,
    paidCount: paid.length,
    revenueINR: revenue,
    productsCount: products.length,
    combosCount: combos.length,
    adminConfigured: isAdminConfigured(),
    mongo: Boolean(process.env.MONGODB_URI?.trim()),
  });
}
