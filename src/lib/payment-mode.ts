import { isDemoPaymentsEnabled } from "@/lib/demo-payments";

export type PaymentMode = "upi" | "demo";

export function getPaymentMode(): PaymentMode {
  return isDemoPaymentsEnabled() ? "demo" : "upi";
}

export function getPaymentModeLabel(): { en: string; te: string } {
  return {
    en: "UPI / QR — customer pays, admin confirms in dashboard",
    te: "UPI / QR — కస్టమర్ చెల్లిస్తారు, అడ్మిన్ డాష్‌బోర్డ్‌లో confirm చేస్తారు",
  };
}
