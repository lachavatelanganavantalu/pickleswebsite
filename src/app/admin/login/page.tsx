"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PwaInstallButton from "@/components/PwaInstallButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) router.replace("/admin/orders");
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/admin/orders");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface-elevated p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl text-ink text-center">Lachava Admin</h1>
        <p className="text-center text-sm text-muted mt-1 mb-6">Products & orders</p>
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <label className="block mb-4">
          <span className="text-xs font-semibold text-muted uppercase">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            autoComplete="username"
          />
        </label>
        <label className="block mb-6">
          <span className="text-xs font-semibold text-muted uppercase">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="mt-4 [&_button]:border-border [&_button]:text-muted [&_button]:hover:bg-surface">
          <PwaInstallButton variant="admin" />
        </div>
      </form>
    </div>
  );
}
