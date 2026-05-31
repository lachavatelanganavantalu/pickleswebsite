import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, toPublicUser } from "@/lib/customer-auth";
import { getOrdersByUserId } from "@/lib/orders-db";
import { findUserById } from "@/lib/users-db";

export async function GET(req: NextRequest) {
  const session = getCustomerSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const orders = await getOrdersByUserId(user.id);

  return NextResponse.json({
    authenticated: true,
    user: toPublicUser(user),
    orders,
  });
}
