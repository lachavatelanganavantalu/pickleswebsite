export const LOGIN_NEXT_PARAM = "next";

/** Safe internal redirect after login (path only). */
export function sanitizeLoginNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export function loginUrl(next?: string | null): string {
  const safe = sanitizeLoginNext(next ?? null);
  if (!safe) return "/account";
  return `/account?${LOGIN_NEXT_PARAM}=${encodeURIComponent(safe)}`;
}
