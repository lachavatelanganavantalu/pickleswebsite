import type { Order } from "./orders-db";

export function formatWhatsAppNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) digits = `91${digits.slice(1)}`;
  return digits;
}

export function buildPaymentProofMessage(order: Order): string {
  return [
    "Hi Lachava team 👋",
    "",
    `I have paid for my order *${order.displayOrderId}*.`,
    `Amount: ₹${order.amountINR}`,
    `Name: ${order.customer.name}`,
    `Mobile: ${order.customer.phone}`,
    "",
    "Please find my payment screenshot attached.",
    "",
    "Thank you!",
  ].join("\n");
}

export function adminPaymentProofWhatsAppUrl(order: Order, adminWhatsApp: string): string {
  const num = formatWhatsAppNumber(adminWhatsApp);
  return `https://wa.me/${num}?text=${encodeURIComponent(buildPaymentProofMessage(order))}`;
}
