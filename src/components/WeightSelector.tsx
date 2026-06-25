import { WeightOption } from "@/types/product";
import { cn } from "@/lib/cn";

interface Props {
  options: WeightOption[];
  selected: string;
  onSelect: (id: string) => void;
  formatPrice: (amount: number) => string;
  disabled?: boolean;
}

export default function WeightSelector({
  options,
  selected,
  onSelect,
  formatPrice,
  disabled,
}: Props) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand">Select size</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "flex min-h-[48px] items-center justify-between rounded-full border px-5 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-brand hover:border-brand/40",
                disabled && "cursor-not-allowed opacity-50"
              )}
              data-ai-target="variant-size-pill"
            >
              <span>{opt.label}</span>
              <span className={cn(active ? "text-white/90" : "text-muted")}>
                {formatPrice(opt.priceINR)}
                {opt.originalPriceINR && opt.originalPriceINR > opt.priceINR && (
                  <span className="ml-1 line-through text-xs opacity-70">
                    {formatPrice(opt.originalPriceINR)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
