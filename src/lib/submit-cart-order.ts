import { readJsonResponse } from "@/lib/read-json-response";
import type { CartItem } from "@/context/CartContext";

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type PlacedOrder = {
  orderId: string;
  displayOrderId: string;
  paymentId: string;
  amountINR: number;
  items: { productName: string; variantLabel: string; quantity: number }[];
  paymentStatus: string;
};

export async function submitCartOrder(params: {
  customer: OrderCustomer;
  items: CartItem[];
  totalINR: number;
}): Promise<PlacedOrder> {
  const { customer, items, totalINR } = params;

  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amountINR: totalINR,
      items: items.map((item) => ({
        productName: item.productName,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        priceINR: item.priceINR,
      })),
      customer,
    }),
  });

  const data = await readJsonResponse<{
    error?: string;
    orderId: string;
    displayOrderId: string;
    amountINR: number;
    items: { productName: string; variantLabel: string; quantity: number }[];
    paymentStatus?: string;
  }>(res);

  if (res.status === 401) {
    throw new Error(data.error || "Please log in to place an order.");
  }
  if (!res.ok) {
    throw new Error(data.error || "Could not place order");
  }

  return {
    orderId: data.orderId,
    displayOrderId: data.displayOrderId,
    paymentId: "",
    amountINR: data.amountINR,
    items: data.items,
    paymentStatus: data.paymentStatus || "pending",
  };
}
