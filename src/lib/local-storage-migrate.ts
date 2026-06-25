/** Read a localStorage key, migrating from a legacy key once if needed. */
export function getLocalStorageItem(primaryKey: string, legacyKey: string): string | null {
  if (typeof window === "undefined") return null;
  const current = localStorage.getItem(primaryKey);
  if (current != null) return current;
  const legacy = localStorage.getItem(legacyKey);
  if (legacy == null) return null;
  localStorage.setItem(primaryKey, legacy);
  localStorage.removeItem(legacyKey);
  return legacy;
}
