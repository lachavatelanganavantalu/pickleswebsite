"use client";

import { useCallback, useEffect, useState } from "react";
import { FSSAI_CERTIFICATE } from "@/data/gallery";
import { SITE_CONTACT } from "@/lib/site-contact";

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
        aria-label={`View FSSAI certificate — license ${SITE_CONTACT.fssaiLicenseNumber}`}
        title={`FSSAI ${SITE_CONTACT.fssaiLicenseNumber} — view certificate`}
      >
        <span className="home-fssai-badge-text">
          <span className="home-fssai-badge-label">fssai</span>
          <span className="home-fssai-badge-number">{SITE_CONTACT.fssaiLicenseNumber}</span>
        </span>
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
              alt={`FSSAI registration certificate — license ${SITE_CONTACT.fssaiLicenseNumber}`}
              className="home-fssai-certificate-img"
            />
            <p className="home-fssai-modal-caption">
              FSSAI license {SITE_CONTACT.fssaiLicenseNumber}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
