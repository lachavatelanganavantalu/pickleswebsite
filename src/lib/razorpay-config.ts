/** Public key — safe for the Razorpay checkout script in the browser. */
export function getRazorpayKeyId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    undefined
  );
}

/** Server-only secret — never expose to the client. */
export function getRazorpayKeySecret(): string | undefined {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || undefined;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}
