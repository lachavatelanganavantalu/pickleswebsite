import type { SiteSettings } from "@/types/site-settings";

export const PAYMENT_QR_API_PATH = "/api/payment-qr";

export function paymentQrDisplayUrl(settings: SiteSettings): string {
  if (settings.payment.qrImageDataUrl?.startsWith("data:image/")) {
    const v = settings.updatedAt ? encodeURIComponent(String(settings.updatedAt)) : String(Date.now());
    return `${PAYMENT_QR_API_PATH}?v=${v}`;
  }
  const path = settings.payment.qrImagePath?.trim();
  if (path && path !== "/payment-qr.png") return path;
  return "";
}

export function parseDataUrlImage(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,([\s\S]+)$/);
  if (!match) return null;
  try {
    return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
  } catch {
    return null;
  }
}

export function publicPaymentSettings(settings: SiteSettings) {
  const displayUrl = paymentQrDisplayUrl(settings);
  return {
    upiId: settings.payment.upiId,
    upiPhone: settings.payment.upiPhone,
    payeeName: settings.payment.payeeName,
    qrImagePath: displayUrl,
  };
}

export function publicSiteSettings(settings: SiteSettings) {
  return {
    ...settings,
    payment: publicPaymentSettings(settings),
  };
}
