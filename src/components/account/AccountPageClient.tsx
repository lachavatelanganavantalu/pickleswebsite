"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatINR } from "@/lib/currency";

type Tab = "login" | "register";

export default function AccountPageClient() {
  const router = useRouter();
  const { user, orders, loading, login, register, logout, changePassword } = useCustomerAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const err =
      tab === "login" ? await login(phone, password) : await register(phone, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setPassword("");
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    const err = await changePassword(currentPassword, newPassword);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password updated successfully.");
  };

  if (loading) {
    return <p className="app-content py-16 text-center text-muted">Loading…</p>;
  }

  if (user) {
    return (
      <div className="app-content py-[clamp(1.5rem,5vw,3rem)] max-w-lg mx-auto">
        <h1 className="shop-page-title">My account</h1>
        <p className="mt-1 text-sm text-muted">
          Logged in as <strong className="text-brand">{formatPhoneDisplay(user.phone)}</strong>
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand">My orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders linked to this account yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {orders.map((o) => (
                <li key={o.orderId} className="rounded-xl border border-border bg-white p-4">
                  <p className="font-semibold text-brand">{o.displayOrderId}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    · {o.paymentStatus}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{formatINR(o.amountINR)}</p>
                  <ul className="mt-2 text-xs text-muted space-y-0.5">
                    {o.items.map((item, i) => (
                      <li key={i}>
                        {item.productName} ({item.variantLabel}) × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Shop more pickles
          </Link>
        </section>

        <section className="mt-10 rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Change password</h2>
          <p className="mt-1 text-xs text-muted">Use your current mobile login password, then set a new one.</p>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {message && (
              <p className="text-sm text-forest bg-forest-soft rounded-lg px-3 py-2">{message}</p>
            )}
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="shop-select-btn disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        </section>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-8 w-full rounded-xl border border-border py-3 text-sm font-semibold text-muted hover:text-brand"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)] max-w-md mx-auto">
      <h1 className="shop-page-title">My account</h1>
      <p className="mt-1 text-sm text-muted">
        Create an account with your mobile number and a password you choose. No email required.
      </p>

      <div className="mt-6 flex rounded-full border border-border bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setError("");
          }}
          className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wide ${
            tab === "login" ? "bg-brand text-white" : "text-brand"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register");
            setError("");
          }}
          className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wide ${
            tab === "register" ? "bg-brand text-white" : "text-brand"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleAuth} className="mt-6 space-y-4 rounded-xl border border-border bg-white p-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase">Mobile number</span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
          />
          <p className="mt-1 text-xs text-muted">At least 6 characters</p>
        </label>
        <button type="submit" disabled={submitting} className="shop-select-btn disabled:opacity-50">
          {submitting ? "Please wait…" : tab === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Orders placed while logged in appear here. Past orders with the same mobile are linked when you sign up or log in.
      </p>
    </div>
  );
}
