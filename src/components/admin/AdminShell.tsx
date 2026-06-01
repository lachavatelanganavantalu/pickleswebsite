"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Layers,
  Settings,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import PwaInstallButton from "@/components/PwaInstallButton";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/combos", label: "Combos", icon: Layers },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const currentLabel = nav.find((item) => pathname.startsWith(item.href))?.label ?? "Admin";

  return (
    <div className="admin-layout">
      {menuOpen && (
        <button
          type="button"
          className="admin-overlay md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "admin-sidebar",
          menuOpen ? "admin-sidebar-open" : "admin-sidebar-closed"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-surface/10 p-4 md:p-5">
          <div className="min-w-0">
            <p className="font-display text-lg md:text-xl truncate">Lachava</p>
            <p className="text-xs text-surface/50 uppercase tracking-widest mt-0.5">Admin</p>
          </div>
          <button
            type="button"
            className="md:hidden shrink-0 rounded-lg p-2 text-surface/70 hover:bg-surface/10 hover:text-white"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-accent text-white"
                  : "text-surface/70 hover:bg-surface/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="m-3 space-y-2">
          <PwaInstallButton variant="admin" />
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-surface/60 hover:bg-surface/10 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-content-column">
        <header className="admin-topbar md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-surface"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-ink">
            {currentLabel}
          </p>
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold text-brand hover:underline"
          >
            Shop
          </Link>
        </header>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
