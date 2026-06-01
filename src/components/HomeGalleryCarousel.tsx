"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { GALLERY_IMAGES } from "@/data/gallery";

const INTERVAL_MS = 5000;

export default function HomeGalleryCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % GALLERY_IMAGES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="gallery"
      className="home-gallery border-t border-border bg-surface py-[clamp(2rem,6vw,3.5rem)]"
      aria-labelledby="gallery-heading"
    >
      <div className="app-content">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Gallery</p>
        <h2 id="gallery-heading" className="shop-page-title mt-1">
          From our kitchen
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          A glimpse of how we prepare and pack every jar.
        </p>

        <div className="home-gallery-stage mt-6">
          {GALLERY_IMAGES.map((slide, index) => (
            <div
              key={slide.src}
              className={cn(
                "home-gallery-slide",
                index === active && "home-gallery-slide-active"
              )}
              aria-hidden={index !== active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.src} alt={slide.alt} className="home-gallery-image" />
            </div>
          ))}

          <div className="home-gallery-dots" role="tablist" aria-label="Gallery slides">
            {GALLERY_IMAGES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Photo ${index + 1}`}
                className={cn("home-gallery-dot", index === active && "home-gallery-dot-active")}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
