/** Edge-safe helpers shared by middleware (no Node crypto). */

export const ORDER_ACCESS_COOKIE = "lachava_opp";

export function parseOrderPaymentAccessCookie(
  value: string | undefined
): { orderId: string; token: string } | null {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot <= 0 || dot >= value.length - 1) return null;
  const orderId = value.slice(0, dot);
  const token = value.slice(dot + 1);
  if (!orderId.startsWith("lach_") || token.length < 16) return null;
  return { orderId, token };
}

export function hasOrderPaymentAccessCookie(
  cookieValue: string | undefined,
  orderId: string
): boolean {
  const parsed = parseOrderPaymentAccessCookie(cookieValue);
  return parsed?.orderId === orderId;
}
