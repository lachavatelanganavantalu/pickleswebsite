"use client";

import { cn } from "@/lib/cn";
import type { TimelineStep } from "@/lib/order-timeline";

export default function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                step.done
                  ? "bg-forest text-white"
                  : step.active
                    ? "bg-brand text-white"
                    : "bg-brand/10 text-brand/50"
              )}
            >
              {step.done ? "✓" : index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "my-1 w-0.5 flex-1 min-h-[2rem]",
                  step.done ? "bg-forest/40" : "bg-border"
                )}
              />
            )}
          </div>
          <div className={cn("pb-6 min-w-0", index === steps.length - 1 && "pb-0")}>
            <p
              className={cn(
                "text-sm font-semibold",
                step.done || step.active ? "text-brand" : "text-muted"
              )}
            >
              {step.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{step.description}</p>
            {step.at && step.done && (
              <p className="mt-1 text-[11px] text-muted">
                {new Date(step.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
