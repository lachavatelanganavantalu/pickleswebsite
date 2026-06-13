import type { LastOrder } from "@/context/OrderContext";

const PAID_KEY = "lachava_paid_order";

export function writePaidOrderSession(order: LastOrder): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PAID_KEY, JSON.stringify(order));
}

export function readPaidOrderSession(): LastOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PAID_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastOrder;
  } catch {
    return null;
  }
}

export function clearPaidOrderSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PAID_KEY);
}
