"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface LastOrder {
  orderId: string;
  displayOrderId?: string;
  paymentId: string;
  amountINR: number;
  paymentStatus: string;
  customerPhone?: string;
  items: { productName: string; variantLabel: string; quantity: number }[];
}

interface OrderContextValue {
  lastOrder: LastOrder | null;
  setLastOrder: (o: LastOrder | null) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  return (
    <OrderContext.Provider value={{ lastOrder, setLastOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
