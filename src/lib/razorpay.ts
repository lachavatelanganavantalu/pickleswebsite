import Razorpay from "razorpay";
import { getRazorpayKeyId, getRazorpayKeySecret } from "./razorpay-config";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return instance;
}
