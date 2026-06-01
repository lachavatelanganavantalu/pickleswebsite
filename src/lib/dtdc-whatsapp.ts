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
  const country = order.customer.country?.trim() || "India";
  const email = order.customer.email?.trim() || "";
  const phone = order.customer.phone?.trim() || "";
  const city = order.customer.city?.trim() || "";
  const state = order.customer.state?.trim() || "";
  const zip = order.customer.zip?.trim() || "";
  const cityStateZip = [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");

  const lines = [
    `Order ID: ${order.displayOrderId}`,
    `Customer: ${order.customer.name}`,
    "Delivery address:",
    order.customer.address?.trim() || "",
    cityStateZip.trim(),
    `${country}.Email: ${email} Phone: ${phone}`,
  ];

  return lines.filter((line) => line !== "").join("\n");
}

export function dtdcWhatsAppUrl(order: Order): string {
  const num = getDtdcWhatsAppNumber().replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(buildDtdcMessage(order))}`;
}
