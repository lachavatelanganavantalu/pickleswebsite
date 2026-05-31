import { NextRequest, NextResponse } from "next/server";
import { setCustomerSession } from "@/lib/customer-auth";
import { validatePassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
import { linkOrdersToUserByPhone } from "@/lib/orders-db";
import { createUser } from "@/lib/users-db";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: "Mobile and password are required" }, { status: 400 });
    }
    if (!normalizePhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const user = await createUser(phone, password);
    await linkOrdersToUserByPhone(user.id, user.phone);

    const res = NextResponse.json({ user });
    setCustomerSession(res, user);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const status = message.includes("already registered") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
