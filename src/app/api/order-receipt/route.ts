import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { assertOrderAccess } from "@/lib/order-access";
import { getOrder } from "@/lib/order-store";
import { getOrderById, getOrderByRazorpayId, type Order } from "@/lib/orders-db";

export const runtime = "nodejs";

async function resolveOrder(orderId: string): Promise<Order | null> {
  const byInternalId = await getOrderById(orderId);
  if (byInternalId) return byInternalId;

  const byRazorpayId = await getOrderByRazorpayId(orderId);
  if (byRazorpayId) return byRazorpayId;

  const pending = getOrder(orderId);
  if (!pending) return null;

  return {
    orderId,
    displayOrderId: pending.displayOrderId,
    amountINR: pending.amountINR,
    items: pending.items,
    customer: {
      name: pending.customer.name,
      email: pending.customer.email ?? "",
      phone: pending.customer.phone,
      address: pending.customer.address ?? "",
      city: pending.customer.city ?? "",
      state: pending.customer.state ?? "",
      zip: pending.customer.zip ?? "",
      country: pending.customer.country ?? "India",
    },
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get("orderId")?.trim();
  const format = new URL(req.url).searchParams.get("format") ?? "json";

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await resolveOrder(orderId);
  const access = assertOrderAccess(req, order);
  if (!access.ok) return access.response;

  const receipt = {
    orderId: order!.orderId,
    displayOrderId: order!.displayOrderId,
    amountINR: order!.amountINR,
    items: order!.items,
    customer: order!.customer,
  };

  if (format === "pdf") {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Assal Heritage Pickles", 14, 20);
    doc.setFontSize(11);
    doc.text(`Order ID: ${receipt.displayOrderId}`, 14, 30);
    if (receipt.customer) {
      doc.text(`Customer: ${receipt.customer.name}`, 14, 38);
      doc.text(`Phone: ${receipt.customer.phone}`, 14, 44);
    }
    autoTable(doc, {
      startY: 52,
      head: [["Item", "Variant", "Qty", "Price"]],
      body: receipt.items.map((i) => [
        i.productName,
        i.variantLabel,
        String(i.quantity),
        `₹${i.priceINR}`,
      ]),
    });
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 80;
    doc.text(`Total: ₹${receipt.amountINR}`, 14, finalY + 12);

    const pdf = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${receipt.displayOrderId}.pdf"`,
      },
    });
  }

  return NextResponse.json(receipt);
}
