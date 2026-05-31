import { NextRequest, NextResponse } from "next/server";
import { setCustomerSession } from "@/lib/customer-auth";
import { normalizePhone } from "@/lib/phone";
import { linkOrdersToUserByPhone } from "@/lib/orders-db";
import { verifyUserLogin } from "@/lib/users-db";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: "Mobile and password are required" }, { status: 400 });
    }
    if (!normalizePhone(phone)) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    const user = await verifyUserLogin(phone, password);
    if (!user) {
      return NextResponse.json({ error: "Wrong mobile number or password" }, { status: 401 });
    }

    await linkOrdersToUserByPhone(user.id, user.phone);

    const res = NextResponse.json({ user });
    setCustomerSession(res, user);
    return res;
  } catch (err) {
    console.error("POST /api/auth/login:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
