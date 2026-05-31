export interface PendingOrderSession {
  orderId: string;
  displayOrderId?: string;
  paymentStatus: string;
  amountINR: number;
}

const KEY = "orderSuccess";

export function readPendingOrderSession(): PendingOrderSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingOrderSession;
    if (!data.orderId || data.paymentStatus === "paid") return null;
    return data;
  } catch {
    return null;
  }
}

export function writePendingOrderSession(order: PendingOrderSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(order));
}

export function clearPendingOrderSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
