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
  const { customer } = order;
  const cityStateZip = [customer.city, customer.state].filter(Boolean).join(", ");
  const cityLine = [cityStateZip, customer.zip].filter(Boolean).join(" ");

  return [
    `Order ID: ${order.displayOrderId}`,
    `Customer: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email || ""}`,
    "Delivery address:",
    customer.address,
    cityLine,
    customer.country || "India",
  ].join("\n");
}

export function dtdcWhatsAppUrl(order: Order): string {
  const num = getDtdcWhatsAppNumber().replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(buildDtdcMessage(order))}`;
}
