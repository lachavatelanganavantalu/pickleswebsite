"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { POWERED_BY_IMAGE_PATH } from "@/lib/dtdc-whatsapp";

type Props = {
  className?: string;
};

export default function PoweredByCallBadge({ className }: Props) {
  const [imageOk, setImageOk] = useState(true);

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
      <div className="inline-flex rounded-lg">
        {imageOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POWERED_BY_IMAGE_PATH}
            alt="DTDC Courier & Logistics Husnabad"
            className="h-auto max-h-20 w-auto max-w-[min(100%,11rem)] object-contain sm:max-h-24 sm:max-w-[12.5rem]"
            onError={() => setImageOk(false)}
          />
        ) : (
          <span className="rounded-lg bg-surface px-4 py-2 text-sm font-semibold text-brand">
            DTDC Courier &amp; Logistics
          </span>
        )}
      </div>
    </div>
  );
}
