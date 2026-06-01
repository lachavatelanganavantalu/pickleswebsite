"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import HeartDotText from "@/components/HeartDotText";

const LACHAVA_PHOTO = "/bg/herosectionframe.jpeg";

const SLIDES = [
  {
    image: "/bg/1bg.png",
    title: "Bold Flavour",
    subtitle: "Tastes like home",
  },
  {
    image: "/bg/2bg.png",
    title: "Fresh Ingredients",
    subtitle: "Tastes like home",
  },
  {
    image: "/bg/3bg.png",
    title: "Traditional Spices",
    subtitle: "Tastes like home",
  },
] as const;

const INTERVAL_MS = 10_000;

export default function HomeHeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="home-hero" aria-label="Shop hero">
      <div className="home-hero-slides">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className={cn("home-hero-slide", index === active && "home-hero-slide-active")}
            aria-hidden={index !== active}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt="" className="home-hero-image" />
          </div>
        ))}
      </div>

      <div className="home-hero-overlay" aria-hidden />

      <div className="home-hero-content">
        <div className="home-hero-layout">
          <div className="home-hero-portrait-wrap">
            <div className="home-hero-portrait-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LACHAVA_PHOTO}
                alt="Lachava preparing traditional pickles"
                className="home-hero-portrait-photo"
              />
            </div>
          </div>

          <div className="home-hero-copy-stack">
            {SLIDES.map((slide, index) => (
              <div
                key={`${slide.image}-copy`}
                className={cn("home-hero-copy", index === active && "home-hero-copy-active")}
                aria-hidden={index !== active}
              >
                <h1 className="home-hero-title font-hero-display">
                  <HeartDotText text={slide.title} />
                </h1>
                <p className="home-hero-subtitle font-hero-display">
                  <HeartDotText text={slide.subtitle} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-hero-dots" role="tablist" aria-label="Hero slides">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Slide ${index + 1}`}
            className={cn("home-hero-dot", index === active && "home-hero-dot-active")}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}
