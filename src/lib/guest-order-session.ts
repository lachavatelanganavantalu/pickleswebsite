import type { GuestReceiptCustomer, GuestReceiptData, GuestReceiptItem } from "./guest-receipt";

const KEY = "guestOrderReceipt";

export function writeGuestOrderSession(data: GuestReceiptData & { isGuestCheckout: boolean }): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function readGuestOrderSession(): (GuestReceiptData & { isGuestCheckout: boolean }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GuestReceiptData & { isGuestCheckout: boolean };
    if (!data.orderId || !data.isGuestCheckout) return null;
    return data;
  } catch {
    return null;
  }
}

export function updateGuestOrderSessionPaid(patch: {
  paymentStatus: string;
  paymentId?: string;
  paidAt?: string;
  items?: GuestReceiptItem[];
  customer?: GuestReceiptCustomer;
}): void {
  const existing = readGuestOrderSession();
  if (!existing) return;
  writeGuestOrderSession({
    ...existing,
    ...patch,
    paidAt: patch.paidAt ?? new Date().toISOString(),
  });
}
