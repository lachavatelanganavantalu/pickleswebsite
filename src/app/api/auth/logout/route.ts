import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/customer-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearCustomerSession(res);
  return res;
}
