import type { Order } from "./orders-db";

const WHATSAPP_TEAM_GREETING = "Hi Lachavapickles team";

export function formatWhatsAppNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) digits = `91${digits.slice(1)}`;
  return digits;
}

export function buildPaymentProofMessage(order: Order): string {
  return [
    WHATSAPP_TEAM_GREETING,
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

export function buildRazorpayFailureDirectPayMessage(order: Order): string {
  const c = order.customer;
  const addressLine = [c.address, c.city, c.state, c.zip].filter(Boolean).join(", ");
  return [
    WHATSAPP_TEAM_GREETING,
    "",
    "Online payment failed via Razorpay. I want to pay you directly.",
    "",
    `Order ID: *${order.displayOrderId}*`,
    `Amount: ₹${order.amountINR}`,
    `Name: ${c.name}`,
    `Mobile: ${c.phone}`,
    c.email ? `Email: ${c.email}` : "",
    addressLine ? `Address: ${addressLine}` : "",
    "",
    "Please help me complete payment directly with you.",
    "",
    "Thank you!",
  ]
    .filter(Boolean)
    .join("\n");
}

export function razorpayFailureDirectPayWhatsAppUrl(
  order: Order,
  adminWhatsApp: string
): string {
  const num = formatWhatsAppNumber(adminWhatsApp);
  return `https://wa.me/${num}?text=${encodeURIComponent(buildRazorpayFailureDirectPayMessage(order))}`;
}
