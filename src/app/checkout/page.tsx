"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { loginUrl } from "@/lib/customer-login-url";
import { loadCheckoutDraft, hasCheckoutDraftFields } from "@/lib/checkout-draft";
import PlaceOrderButton from "@/components/PlaceOrderButton";
import EditableCartList from "@/components/EditableCartList";
import PendingOrderBanner from "@/components/PendingOrderBanner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalINR } = useCart();
  const { format } = useCurrency();
  const { user, loading: authLoading } = useCustomerAuth();
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
    if (authLoading) return;
    if (!user) {
      router.replace(loginUrl("/checkout"));
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.phone) {
      setCustomer((c) => (c.phone ? c : { ...c, phone: user.phone }));
    }
  }, [user?.phone]);

  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (!draft || !hasCheckoutDraftFields(draft)) return;

    setCustomer((current) => ({
      name: draft.name || current.name,
      email: draft.email || current.email,
      phone: draft.phone || current.phone || user?.phone || "",
      address: draft.address || current.address,
      city: draft.city || current.city,
      state: draft.state || current.state,
      zip: draft.zip || current.zip,
      country: draft.country || current.country,
    }));
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

  if (authLoading || !user) {
    return (
      <div className="app-content py-20 text-center text-sm text-muted">
        {authLoading ? "Checking login…" : "Redirecting to log in…"}
      </div>
    );
  }

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
      <p className="mt-1 text-sm text-muted">After placing your order, scan the payment QR or copy UPI ID in PhonePe / GPay.</p>

      <div className="mt-4">
        <PendingOrderBanner />
      </div>
      <p className="mt-2 text-xs text-forest">
        Logged in as {user.phone} — order will appear in{" "}
        <Link href="/account" className="font-semibold underline">
          My account
        </Link>
      </p>

      <div className="mt-8 space-y-8">
        <form className="space-y-4 rounded-xl bg-white p-5 border border-border" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Full name</span>
            <input
              required
              value={customer.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
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
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-brand">Email</span>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
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
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-brand">State</span>
              <input
                required
                value={customer.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-brand">PIN</span>
              <input
                required
                value={customer.zip}
                onChange={(e) => update("zip", e.target.value)}
                className={inputClass}
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

        <PlaceOrderButton customer={customer} disabled={!valid} />
      </div>
    </div>
  );
}
