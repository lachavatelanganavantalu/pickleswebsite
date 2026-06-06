export type CheckoutDeliveryDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

const STORAGE_KEY = "lachava-checkout-draft";

export function saveCheckoutDraft(draft: CheckoutDeliveryDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadCheckoutDraft(): CheckoutDeliveryDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutDeliveryDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasCheckoutDraftFields(draft: CheckoutDeliveryDraft): boolean {
  return Boolean(
    draft.name.trim() ||
      draft.phone.trim() ||
      draft.email.trim() ||
      draft.address.trim() ||
      draft.city.trim() ||
      draft.state.trim() ||
      draft.zip.trim(),
  );
}

export function draftToCustomer(
  draft: CheckoutDeliveryDraft | null,
  fallbackPhone?: string,
): CheckoutDeliveryDraft {
  return {
    name: draft?.name ?? "",
    email: draft?.email ?? "",
    phone: draft?.phone || fallbackPhone || "",
    address: draft?.address ?? "",
    city: draft?.city ?? "",
    state: draft?.state ?? "",
    zip: draft?.zip ?? "",
    country: draft?.country || "India",
  };
}

export function isCheckoutCustomerComplete(draft: CheckoutDeliveryDraft): boolean {
  return Boolean(
    draft.name.trim() &&
      draft.phone.trim() &&
      draft.address.trim() &&
      draft.city.trim() &&
      draft.state.trim() &&
      draft.zip.trim(),
  );
}
