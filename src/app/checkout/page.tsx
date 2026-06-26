"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import PlaceOrderButton from "@/components/PlaceOrderButton";
import EditableCartList from "@/components/EditableCartList";
import PendingOrderBanner from "@/components/PendingOrderBanner";

type CheckoutMode = "guest" | "account";

export default function CheckoutPage() {
  const { items, totalINR } = useCart();
  const { format } = useCurrency();
  const { user } = useCustomerAuth();
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  useEffect(() => {
    if (user?.phone) {
      setCustomer((c) => (c.phone ? c : { ...c, phone: user.phone }));
    }
  }, [user?.phone]);

  const update = (field: keyof typeof customer, value: string) => {
    setCustomer((c) => ({ ...c, [field]: value }));
  };

  const valid =
    customer.name.trim() &&
    customer.phone.trim() &&
    customer.address.trim() &&
    customer.city.trim() &&
    customer.state.trim() &&
    customer.zip.trim();

  if (items.length === 0) {
    return (
      <div className="app-content py-20 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-brand hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink focus:border-brand/50 focus:outline-none";

  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <h1 className="text-xl font-bold text-brand">Checkout</h1>
      <p className="mt-1 text-sm text-muted">After placing your order, pay securely with Razorpay (UPI, cards, or net banking).</p>

      <div className="mt-4">
        <PendingOrderBanner />
      </div>
      {user ? (
        <p className="mt-2 text-xs text-forest">
          Logged in — this order will appear in{" "}
          <Link href="/account" className="font-semibold underline">
            My account
          </Link>
        </p>
      ) : (
        <section className="mt-4 rounded-xl border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">How would you like to checkout?</p>
          <div className="mt-3 flex rounded-full border border-border bg-surface/50 p-1">
            <button
              type="button"
              onClick={() => setCheckoutMode("guest")}
              className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                checkoutMode === "guest" ? "bg-brand text-white" : "text-brand"
              }`}
              data-ai-target="checkout-guest"
            >
              Guest checkout
            </button>
            <Link
              href="/account?returnTo=/checkout"
              className={`flex flex-1 items-center justify-center rounded-full py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                checkoutMode === "account" ? "bg-brand text-white" : "text-brand"
              }`}
              data-ai-target="checkout-account"
              onClick={() => setCheckoutMode("account")}
            >
              Sign in / Sign up
            </Link>
          </div>
          {checkoutMode === "guest" && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <strong>Guest checkout:</strong> you can place an order without creating an account.{" "}
              <strong>Your orders will not appear in My account</strong> — complete payment on this
              device (a secure browser pass is set automatically). Save your order ID for tracking, or{" "}
              <Link href="/account?returnTo=/checkout" className="font-semibold underline">
                create an account
              </Link>{" "}
              to see order history.
            </p>
          )}
          {checkoutMode === "account" && (
            <p className="mt-3 text-xs text-muted">
              <Link href="/account?returnTo=/checkout" className="font-semibold text-brand hover:underline">
                Log in or sign up
              </Link>{" "}
              to link orders to your account and view order history.
            </p>
          )}
        </section>
      )}

      <div className="mt-8 space-y-8">
        <form className="space-y-4 rounded-xl bg-white p-5 border border-border" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Full name</span>
            <input
              required
              value={customer.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              data-ai-target="shipping-full-name"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Phone</span>
            <input
              required
              type="tel"
              value={customer.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              data-ai-target="shipping-phone"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Email</span>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              data-ai-target="shipping-email"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Address</span>
            <textarea
              required
              rows={2}
              value={customer.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputClass}
              data-ai-target="shipping-address"
            />
          </label>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-brand">City</span>
              <input
                required
                value={customer.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
                data-ai-target="shipping-city"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-brand">State</span>
              <input
                required
                value={customer.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
                data-ai-target="shipping-state"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-brand">PIN</span>
              <input
                required
                value={customer.zip}
                onChange={(e) => update("zip", e.target.value)}
                className={inputClass}
                data-ai-target="shipping-pin"
              />
            </label>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-brand">Order summary</h2>
            <Link href="/cart" className="text-xs font-semibold text-brand hover:underline">
              Edit cart
            </Link>
          </div>
          <div className="mt-4">
            <EditableCartList compact />
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold text-brand">
            <span>Total</span>
            <span>{format(totalINR)}</span>
          </div>
        </div>

        <PlaceOrderButton
          customer={customer}
          disabled={!valid}
          guestCheckout={!user && checkoutMode === "guest"}
        />
      </div>
    </div>
  );
}
