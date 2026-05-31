import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { validatePassword } from "@/lib/password";
import { changeUserPassword } from "@/lib/users-db";

export async function POST(req: NextRequest) {
  const session = getCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    const ok = await changeUserPassword(session.userId, currentPassword, newPassword);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/change-password:", err);
    return NextResponse.json({ error: "Could not change password" }, { status: 500 });
  }
}
