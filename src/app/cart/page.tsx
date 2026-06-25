"use client";

import Link from "next/link";
import EditableCartList from "@/components/EditableCartList";
import PendingOrderBanner from "@/components/PendingOrderBanner";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { loginUrl } from "@/lib/customer-login-url";

export default function CartPage() {
  const { items, totalINR } = useCart();
  const { format } = useCurrency();
  const { user, loading: authLoading } = useCustomerAuth();

  if (items.length === 0) {
    return (
      <div className="app-content py-20 text-center">
        <div className="mx-auto max-w-lg text-left">
          <PendingOrderBanner />
        </div>
        <h1 className="mt-8 text-xl font-bold text-brand">Your cart</h1>
        <p className="mt-4 text-muted">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex mt-8 min-h-[48px] items-center rounded-full bg-brand px-8 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)] max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-brand">Your cart</h1>
      <p className="mt-1 text-sm text-muted">Change quantities or remove items anytime.</p>

      <div className="mt-4">
        <PendingOrderBanner />
      </div>

      <div className="mt-6">
        <EditableCartList />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex justify-between text-lg font-bold text-brand">
          <span>Subtotal</span>
          <span>{format(totalINR)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Shipping calculated at checkout</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {!authLoading && !user && (
          <p className="text-center text-xs text-muted">
            Log in or sign up to place your order.
          </p>
        )}
        <Link
          href={user ? "/checkout" : loginUrl("/checkout")}
          className="flex w-full min-h-[48px] items-center justify-center rounded-full bg-brand text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          data-ai-target="proceed-to-checkout"
        >
          {user ? "Proceed to checkout" : "Log in to checkout"}
        </Link>
        <Link
          href="/products"
          className="text-center text-sm font-semibold text-muted hover:text-brand"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
