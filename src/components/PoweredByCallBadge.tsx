"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { getDtdcTelHref, POWERED_BY_IMAGE_PATH } from "@/lib/dtdc-whatsapp";

type Props = {
  className?: string;
};

export default function PoweredByCallBadge({ className }: Props) {
  const [imageOk, setImageOk] = useState(true);
  const telHref = getDtdcTelHref();

  return (
    <div
      className={cn(
        "mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-shop-muted">
        Powered by
      </p>
      <a
        href={telHref}
        className="inline-flex rounded-lg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="Call +91 99495 25111"
      >
        {imageOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POWERED_BY_IMAGE_PATH}
            alt="Powered by — tap to call"
            className="h-auto max-h-14 w-auto max-w-[min(100%,16rem)] object-contain sm:max-h-16 sm:max-w-[18rem]"
            onError={() => setImageOk(false)}
          />
        ) : (
          <span className="rounded-lg bg-surface px-4 py-2 text-sm font-semibold text-brand">
            Tap to call +91 99495 25111
          </span>
        )}
      </a>
    </div>
  );
}
