"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAditya } from "@/context/AdityaContext";
import ShopSearchOverlay from "@/components/ShopSearchOverlay";
import PwaInstallButton from "@/components/PwaInstallButton";
import ShippingFlagsMarquee from "@/components/ShippingFlagsMarquee";

const links = [
  { href: "/", label: "Home", id: "home" },
  { href: "/products", label: "Pickles", id: "pickles" },
  { href: "/combos", label: "Combo ₹999", id: "combos" },
  { href: "/contact", label: "Contact", id: "contact" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { registerSearchHandler } = useAditya();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState("");
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    setCartReady(true);
  }, []);

  useEffect(() => {
    return registerSearchHandler((query) => {
      setOpen(false);
      setSearchSeed(query);
      setSearchOpen(true);
    });
  }, [registerSearchHandler]);

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <div className="site-header-start">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex min-h-[44px] min-w-[4.5rem] items-center gap-2 pl-1 text-white"
            aria-label="Menu"
            data-ai-target="mobile-menu"
          >
            {open ? (
              <X className="h-[clamp(1.25rem,4vw,1.375rem)] w-[clamp(1.25rem,4vw,1.375rem)]" strokeWidth={2} />
            ) : (
              <Menu className="h-[clamp(1.25rem,4vw,1.375rem)] w-[clamp(1.25rem,4vw,1.375rem)]" strokeWidth={2} />
            )}
            <span className="text-[clamp(0.625rem,2.4vw,0.75rem)] font-bold uppercase tracking-[0.12em]">
              MENU
            </span>
          </button>
        </div>

        <div className="site-header-end">
          <PwaInstallButton />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSearchSeed("");
              setSearchOpen(true);
            }}
            className="flex h-10 w-10 items-center justify-center text-white sm:h-11 sm:w-11"
            aria-label="Search shop"
            data-ai-target="nav-search"
          >
            <Search className="h-[clamp(1.25rem,4vw,1.375rem)] w-[clamp(1.25rem,4vw,1.375rem)]" strokeWidth={2} />
          </button>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center text-white sm:h-11 sm:w-11"
            aria-label="Cart"
            data-ai-target="cart-button"
          >
            <ShoppingBag className="h-[clamp(1.25rem,4vw,1.375rem)] w-[clamp(1.25rem,4vw,1.375rem)]" strokeWidth={2} />
            <span
              className="absolute right-0.5 top-0.5 flex h-[clamp(1rem,3.2vw,1.125rem)] min-w-[clamp(1rem,3.2vw,1.125rem)] items-center justify-center rounded-full bg-white px-0.5 text-[clamp(0.5625rem,2vw,0.625rem)] font-bold leading-none text-brand"
              suppressHydrationWarning
            >
              {cartReady ? itemCount : 0}
            </span>
          </Link>
        </div>
      </div>

      <ShippingFlagsMarquee />

      {open && (
        <nav className="border-t border-white/15 bg-brand-dark">
          <div className="mx-auto w-full px-[var(--content-pad-x)] py-3">
            <div className="space-y-0.5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                  data-ai-target={`nav-${l.id}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      <ShopSearchOverlay
        open={searchOpen}
        initialQuery={searchSeed}
        onClose={() => {
          setSearchOpen(false);
          setSearchSeed("");
        }}
      />
    </header>
  );
}
