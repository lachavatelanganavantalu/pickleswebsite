"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { OrderProvider } from "@/context/OrderContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { AdityaProvider } from "@/context/AdityaContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <OrderProvider>
              <AdityaProvider>{children}</AdityaProvider>
            </OrderProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
