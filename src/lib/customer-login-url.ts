export const LOGIN_NEXT_PARAM = "next";

/** Safe internal redirect after login (path only). */
export function sanitizeLoginNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export function loginUrl(next?: string | null): string {
  const safe = sanitizeLoginNext(next ?? null);
  if (!safe) return "/account?tab=login";
  const params = new URLSearchParams({
    tab: "login",
    [LOGIN_NEXT_PARAM]: safe,
  });
  return `/account?${params.toString()}`;
}

export function loginPromptForNext(next: string | null): string | null {
  if (!next) return null;
  if (next === "/checkout") return "Log in or sign up to place your order.";
  if (next.startsWith("/order/") && next.endsWith("/payment")) {
    return "Please log in to view and pay for your order.";
  }
  return "Please log in to continue.";
}
