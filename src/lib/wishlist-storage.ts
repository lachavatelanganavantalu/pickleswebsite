import { getLocalStorageItem } from "@/lib/local-storage-migrate";

const STORAGE_KEY = "lachava_wishlist";
const LEGACY_STORAGE_KEY = "assal_wishlist";

export function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getLocalStorageItem(STORAGE_KEY, LEGACY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlistIds().includes(id);
}

export function toggleWishlistId(id: string): boolean {
  const ids = getWishlistIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("wishlist-updated"));
  return !exists;
}
