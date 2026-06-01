import { Order } from "./orders-db";

export const DTDC_CONTACT_NAME = "Kodipelli Shravan";

export function getDtdcWhatsAppNumber(): string {
  return (
    process.env.NEXT_PUBLIC_DTDC_WHATSAPP_NUMBER ||
    process.env.DTDC_WHATSAPP_NUMBER ||
    "919949525111"
  );
}

/** Opens the phone dialer on mobile (and tel-capable devices). */
export function getDtdcTelHref(): string {
  const digits = getDtdcWhatsAppNumber().replace(/\D/g, "");
  if (!digits) return "tel:+919949525111";
  return digits.startsWith("91") ? `tel:+${digits}` : `tel:+91${digits}`;
}

/** DTDC Husnabad badge on the track page (`public/DTDCH.png`). */
export const POWERED_BY_IMAGE_PATH = "/DTDCH.png";

export function buildDtdcMessage(order: Order): string {
  const lines = [
    "DTDC Shipment Request — Lachava Pickles",
    `Attn: ${DTDC_CONTACT_NAME}`,
    "",
    `Order ID: ${order.displayOrderId}`,
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email || "—"}`,
    "",
    "Delivery address:",
    order.customer.address,
    `${order.customer.city}, ${order.customer.state} ${order.customer.zip}`,
    order.customer.country || "India",
    "",
    "Order items:",
    ...order.items.map(
      (i) =>
        `• ${i.productName} (${i.variantLabel}) × ${i.quantity} — ₹${i.priceINR * i.quantity}`
    ),
    "",
    `Order total: ₹${order.amountINR}`,
    order.paymentId ? `Payment ref: ${order.paymentId}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function dtdcWhatsAppUrl(order: Order): string {
  const num = getDtdcWhatsAppNumber().replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(buildDtdcMessage(order))}`;
}
