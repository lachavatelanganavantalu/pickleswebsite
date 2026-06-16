import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Order } from "@/lib/orders-db";
import { normalizePhone } from "@/lib/phone";

export type CustomerSession = { userId: string; phone: string };

export type OrderAccessContext =
  | { kind: "admin" }
  | { kind: "customer"; session: CustomerSession };

export function customerOwnsOrder(session: CustomerSession, order: Order): boolean {
  if (order.userId) {
    return order.userId === session.userId;
  }
  const orderPhone = normalizePhone(order.customer.phone);
  const sessionPhone = normalizePhone(session.phone);
  return Boolean(orderPhone && sessionPhone && orderPhone === sessionPhone);
}

export function getOrderAccessContext(req: NextRequest): OrderAccessContext | null {
  if (isAdminRequest(req)) return { kind: "admin" };
  const session = getCustomerSession(req);
  if (session) return { kind: "customer", session };
  return null;
}

export function orderAccessDeniedResponse(
  reason: "missing" | "forbidden" | "unauthenticated"
): NextResponse {
  if (reason === "unauthenticated") {
    return NextResponse.json({ error: "Please log in to view this order." }, { status: 401 });
  }
  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}

export function assertOrderAccess(
  req: NextRequest,
  order: Order | null
): { ok: true; ctx: OrderAccessContext } | { ok: false; response: NextResponse } {
  if (!order) {
    return { ok: false, response: orderAccessDeniedResponse("missing") };
  }

  const ctx = getOrderAccessContext(req);
  if (!ctx) {
    return { ok: false, response: orderAccessDeniedResponse("unauthenticated") };
  }
  if (ctx.kind === "admin") {
    return { ok: true, ctx };
  }
  if (!customerOwnsOrder(ctx.session, order)) {
    return { ok: false, response: orderAccessDeniedResponse("forbidden") };
  }
  return { ok: true, ctx };
}

export function assertCustomerSession(
  req: NextRequest
): { ok: true; session: CustomerSession } | { ok: false; response: NextResponse } {
  const session = getCustomerSession(req);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Please log in to continue." }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
