"use client";

import { useState } from "react";
import { BRAND } from "@/data/brand";

export default function HeroBrandMark() {
  const [src, setSrc] = useState<string | "none">(BRAND.logo);

  return (
    <div className="home-hero-logo-wrap">
      <div className="home-hero-logo-frame">
        {src === "none" ? (
          <span className="home-hero-logo-fallback" aria-label="Lachava Telangana Vantalu">
            ల
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Lachava Telangana Vantalu"
            className="home-hero-logo-img"
            onError={() => {
              if (src === BRAND.logo) setSrc(BRAND.logoFallback);
              else setSrc("none");
            }}
          />
        )}
      </div>
    </div>
  );
}
