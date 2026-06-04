"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { GALLERY_IMAGES } from "@/data/gallery";

const INTERVAL_MS = 5000;

type HomeGalleryCarouselProps = {
  /** Renders inside the About / story section instead of a standalone block */
  embedded?: boolean;
};

export default function HomeGalleryCarousel({ embedded = false }: HomeGalleryCarouselProps) {
  const [active, setActive] = useState(0);
  const total = GALLERY_IMAGES.length;

  const goTo = useCallback((index: number) => {
    setActive(((index % total) + total) % total);
  }, [total]);

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % GALLERY_IMAGES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const stage = (
    <div className="home-gallery-stage">
      {GALLERY_IMAGES.map((slide, index) => (
        <div
          key={slide.src}
          className={cn("home-gallery-slide", index === active && "home-gallery-slide-active")}
          aria-hidden={index !== active}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.src} alt={slide.alt} className="home-gallery-image" loading="lazy" />
        </div>
      ))}

      <div className="home-gallery-controls" aria-label="Gallery navigation">
        <button
          type="button"
          className="home-gallery-nav-btn"
          aria-label="Previous photo"
          onClick={goPrev}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <span className="home-gallery-counter" aria-live="polite">
          {active + 1} / {total}
        </span>
        <button
          type="button"
          className="home-gallery-nav-btn"
          aria-label="Next photo"
          onClick={goNext}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div id="gallery" className="home-about-gallery mt-10" aria-labelledby="gallery-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Gallery</p>
        <h3 id="gallery-heading" className="shop-page-title mt-1 text-xl sm:text-2xl">
          From our kitchen
        </h3>
        <p className="mt-2 max-w-xl text-sm text-muted">
          A glimpse of how we prepare and pack every jar.
        </p>
        <div className="mt-6">{stage}</div>
      </div>
    );
  }

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
        <div className="mt-6">{stage}</div>
      </div>
    </section>
  );
}
