"use client";

import { useCallback, useEffect, useState } from "react";
import { FSSAI_CERTIFICATE } from "@/data/gallery";

export default function FssaiHeroBadge() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className="home-fssai-badge"
        onClick={() => setOpen(true)}
        aria-label="View FSSAI certificate"
        title="FSSAI certified — view certificate"
      >
        <span className="home-fssai-badge-label">fssai</span>
      </button>

      {open && (
        <div
          className="home-fssai-modal"
          role="dialog"
          aria-modal="true"
          aria-label="FSSAI certificate"
          onClick={close}
        >
          <button
            type="button"
            className="home-fssai-modal-close"
            onClick={close}
            aria-label="Close certificate"
          >
            ✕
          </button>
          <div
            className="home-fssai-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FSSAI_CERTIFICATE}
              alt="FSSAI food business certificate"
              className="home-fssai-certificate-img"
            />
          </div>
        </div>
      )}
    </>
  );
}
