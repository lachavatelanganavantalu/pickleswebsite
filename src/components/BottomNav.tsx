"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Store, Heart, User } from "lucide-react";

const items = [
  {
    id: "home",
    href: "/",
    label: "Home",
    shortLabel: "Home",
    icon: Home,
    match: (path: string) => path === "/",
  },
  {
    id: "track",
    href: "/track",
    label: "Track Order",
    shortLabel: "Track",
    icon: MapPin,
    match: (path: string) => path === "/track" || path.startsWith("/order/"),
  },
  {
    id: "shop",
    href: "/products",
    label: "Shop",
    shortLabel: "Shop",
    icon: Store,
    match: (path: string) =>
      path.startsWith("/products") ||
      path === "/combos",
  },
  {
    id: "wishlist",
    href: "/wishlist",
    label: "Wishlist",
    shortLabel: "Wishlist",
    icon: Heart,
    match: (path: string) => path === "/wishlist",
  },
  {
    id: "account",
    href: "/account",
    label: "My account",
    shortLabel: "Account",
    icon: User,
    match: (path: string) => path.startsWith("/account"),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="bottom-nav-grid">
        {items.map(({ id, href, label, shortLabel, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={id}
              href={href}
              className="bottom-nav-link"
              data-active={active}
              aria-current={active ? "page" : undefined}
            >
              <Icon strokeWidth={active ? 2.25 : 1.75} />
              <span className="bottom-nav-label bottom-nav-label-full">{label}</span>
              <span className="bottom-nav-label bottom-nav-label-short">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
