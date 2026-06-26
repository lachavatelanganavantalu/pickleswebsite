import { BRAND } from "@/data/brand";

export interface GuestReceiptItem {
  productName: string;
  variantLabel: string;
  quantity: number;
  priceINR: number;
}

export interface GuestReceiptCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface GuestReceiptData {
  orderId: string;
  displayOrderId: string;
  amountINR: number;
  paymentStatus: string;
  paymentId?: string;
  items: GuestReceiptItem[];
  customer: GuestReceiptCustomer;
  orderedAt?: string;
  paidAt?: string;
}

const BRAND_NAME = BRAND.nameFull;
const TZ = "Asia/Kolkata";

export const GUEST_RECEIPT_ONCE_NOTICE =
  "As you are a guest user, this order receipt can only be downloaded once. Please save it for future use.";

const GUEST_RECEIPT_DOWNLOAD_KEY_PREFIX = "guestReceiptDownloaded:";

export function isGuestReceiptDownloaded(orderId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${GUEST_RECEIPT_DOWNLOAD_KEY_PREFIX}${orderId}`) === "1";
}

export function markGuestReceiptDownloaded(orderId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${GUEST_RECEIPT_DOWNLOAD_KEY_PREFIX}${orderId}`, "1");
}

export function formatReceiptDateTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleString("en-IN", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function customerAddress(c: GuestReceiptCustomer): string {
  return [c.address, c.city, c.state, c.zip, c.country].filter(Boolean).join(", ");
}

export function buildGuestReceiptText(receipt: GuestReceiptData): string {
  const lines = [
    BRAND_NAME,
    "Order receipt (guest checkout)",
    "",
    `Order ID: ${receipt.displayOrderId}`,
    `Reference: ${receipt.orderId}`,
    `Status: ${receipt.paymentStatus === "paid" ? "Paid" : receipt.paymentStatus}`,
    receipt.orderedAt ? `Ordered: ${formatReceiptDateTime(receipt.orderedAt)}` : "",
    receipt.paidAt ? `Paid: ${formatReceiptDateTime(receipt.paidAt)}` : "",
    receipt.paymentId ? `Payment ref: ${receipt.paymentId}` : "",
    "",
    "Customer",
    `Name: ${receipt.customer.name}`,
    `Phone: ${receipt.customer.phone}`,
    receipt.customer.email ? `Email: ${receipt.customer.email}` : "",
    customerAddress(receipt.customer) ? `Address: ${customerAddress(receipt.customer)}` : "",
    "",
    "Items",
    ...receipt.items.map(
      (item) =>
        `- ${item.productName} (${item.variantLabel}) × ${item.quantity} — ${formatINR(item.priceINR * item.quantity)}`
    ),
    "",
    `Total: ${formatINR(receipt.amountINR)}`,
    "",
    GUEST_RECEIPT_ONCE_NOTICE,
    "Guest orders are not stored in My account.",
  ];
  return lines.filter((line) => line !== "").join("\n");
}

export function buildGuestReceiptHtml(receipt: GuestReceiptData): string {
  const itemRows = receipt.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.productName)}</td>
        <td>${escapeHtml(item.variantLabel)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatINR(item.priceINR)}</td>
        <td style="text-align:right">${formatINR(item.priceINR * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const metaRows = [
    ["Order ID", receipt.displayOrderId],
    ["Reference", receipt.orderId],
    ["Status", receipt.paymentStatus === "paid" ? "Paid" : receipt.paymentStatus],
    receipt.orderedAt ? ["Ordered on", formatReceiptDateTime(receipt.orderedAt)] : null,
    receipt.paidAt ? ["Paid on", formatReceiptDateTime(receipt.paidAt)] : null,
    receipt.paymentId ? ["Payment ref", receipt.paymentId] : null,
    ["Customer", receipt.customer.name],
    ["Phone", receipt.customer.phone],
    receipt.customer.email ? ["Email", receipt.customer.email] : null,
    customerAddress(receipt.customer) ? ["Address", customerAddress(receipt.customer)] : null,
  ]
    .filter(Boolean)
    .map(
      (row) =>
        `<tr><td class="label">${escapeHtml(row![0])}</td><td>${escapeHtml(row![1])}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(receipt.displayOrderId)} — ${BRAND_NAME}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #2c1810; margin: 0; padding: 24px; background: #faf6f1; }
    .sheet { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e8ddd3; border-radius: 12px; padding: 28px; }
    h1 { margin: 0; font-size: 1.5rem; color: #5c3317; }
    .sub { margin: 4px 0 20px; color: #6b5b52; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    .meta td { padding: 6px 0; vertical-align: top; }
    .meta .label { width: 120px; font-weight: 600; color: #5c3317; }
    .items { margin-top: 24px; }
    .items th, .items td { border-bottom: 1px solid #eee; padding: 8px 6px; }
    .items th { text-align: left; color: #5c3317; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .total { margin-top: 16px; text-align: right; font-size: 1.15rem; font-weight: 700; color: #5c3317; }
    .note { margin-top: 20px; font-size: 0.82rem; color: #6b5b52; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>${BRAND_NAME}</h1>
    <p class="sub">Order receipt · Guest checkout</p>
    <table class="meta">${metaRows}</table>
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th>Size</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p class="total">Total ${formatINR(receipt.amountINR)}</p>
    <p class="note">${escapeHtml(GUEST_RECEIPT_ONCE_NOTICE)} Guest orders are not shown in My account — use Track order with your order ID and mobile number.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function receiptFilename(receipt: GuestReceiptData, ext: string): string {
  const safeId = receipt.displayOrderId.replace(/[^\w-]+/g, "-");
  const stamp = (receipt.paidAt ?? receipt.orderedAt ?? new Date().toISOString()).slice(0, 10);
  return `lachava-order-${safeId}-${stamp}.${ext}`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Client-side only — saves a printable HTML receipt to the user's device. */
export function downloadGuestReceiptHtml(receipt: GuestReceiptData): boolean {
  if (isGuestReceiptDownloaded(receipt.orderId)) return false;
  const html = buildGuestReceiptHtml(receipt);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerBlobDownload(blob, receiptFilename(receipt, "html"));
  markGuestReceiptDownloaded(receipt.orderId);
  return true;
}

/** Client-side plain-text fallback receipt. */
export function downloadGuestReceiptText(receipt: GuestReceiptData): boolean {
  if (isGuestReceiptDownloaded(receipt.orderId)) return false;
  const text = buildGuestReceiptText(receipt);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  triggerBlobDownload(blob, receiptFilename(receipt, "txt"));
  markGuestReceiptDownloaded(receipt.orderId);
  return true;
}

export function markGuestReceiptAutoShown(orderId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `guestReceiptAutoShown:${orderId}`;
  if (sessionStorage.getItem(key)) return false;
  sessionStorage.setItem(key, "1");
  return true;
}
