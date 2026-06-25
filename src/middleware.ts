import { NextRequest, NextResponse } from "next/server";
import {
  ORDER_ACCESS_COOKIE,
  hasOrderPaymentAccessCookie,
  parseOrderPaymentAccessCookie,
} from "@/lib/order-payment-access-cookie";
import { verifyAdminSessionToken, verifyCustomerSessionToken } from "@/lib/session-edge";

const ADMIN_PANEL_PREFIXES = [
  "/admin/dashboard",
  "/admin/analytics",
  "/admin/orders",
  "/admin/products",
  "/admin/combos",
  "/admin/settings",
  "/admin/customers",
];

function isAdminPanelPath(pathname: string): boolean {
  return ADMIN_PANEL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function loginRedirect(req: NextRequest, nextPath: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/account";
  url.search = `?tab=login&next=${encodeURIComponent(nextPath)}`;
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isAdminPanelPath(pathname)) {
    const adminToken = req.cookies.get("admin_session")?.value;
    const ok = await verifyAdminSessionToken(adminToken);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const orderPaymentMatch = pathname.match(/^\/order\/([^/]+)\/payment$/);
  if (orderPaymentMatch) {
    const orderId = orderPaymentMatch[1];
    const customerToken = req.cookies.get("customer_session")?.value;
    const customerOk = await verifyCustomerSessionToken(customerToken);
    if (customerOk) {
      return NextResponse.next();
    }

    const oppCookie = req.cookies.get(ORDER_ACCESS_COOKIE)?.value;
    if (hasOrderPaymentAccessCookie(oppCookie, orderId)) {
      return NextResponse.next();
    }

    const accessQuery = req.nextUrl.searchParams.get("access")?.trim();
    const fromQuery = parseOrderPaymentAccessCookie(
      accessQuery ? `${orderId}.${accessQuery}` : undefined
    );
    if (fromQuery?.orderId === orderId) {
      return NextResponse.next();
    }

    return loginRedirect(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/analytics/:path*",
    "/admin/orders/:path*",
    "/admin/products/:path*",
    "/admin/combos/:path*",
    "/admin/settings/:path*",
    "/admin/customers/:path*",
    "/order/:orderId/payment",
  ],
};
