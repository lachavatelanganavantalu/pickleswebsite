"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/data/brand";

interface Props {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const heights = { sm: 32, md: 40, lg: 52 };

export default function BrandLogo({
  showWordmark = true,
  size = "md",
  href = "/",
}: Props) {
  const [src, setSrc] = useState<string>(BRAND.logo || BRAND.logoFallback);
  const h = heights[size];

  const mark =
    src === "none" ? (
      <span
        className="font-display font-semibold tracking-tight text-brand"
        style={{ fontSize: size === "lg" ? "1.75rem" : size === "md" ? "1.25rem" : "1rem" }}
      >
        Lachava
      </span>
    ) : (
      <img
        src={src}
        alt="Lachava"
        width={Math.round(h * 2.2)}
        height={h}
        className="h-auto w-auto max-h-[var(--logo-h)] object-contain"
        style={{ "--logo-h": `${h}px` } as React.CSSProperties}
        onError={() => {
          const primary = BRAND.logo || BRAND.logoFallback;
          if (src === primary) setSrc(BRAND.logoFallback);
          else setSrc("none");
        }}
      />
    );

  const inner = (
    <div className="flex items-center gap-3">
      {mark}
      {showWordmark && src !== "none" && (
        <div className="hidden sm:block leading-tight border-l border-brand/10 pl-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
            Telangana
          </span>
          <span className="block text-sm font-medium text-brand/80">Vantalu</span>
        </div>
      )}
    </div>
  );

  return (
    <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  );
}
