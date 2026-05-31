/** Normalize Indian mobile to 10 digits (no country code). */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return null;
}

export function formatPhoneDisplay(phone: string): string {
  const n = normalizePhone(phone);
  if (!n) return phone;
  return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
}
