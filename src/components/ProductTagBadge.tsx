import { ProductTag, TAG_LABELS } from "@/types/product";
import { cn } from "@/lib/cn";
import { isDisabledProductTag } from "@/lib/product-stock";

interface Props {
  tag: ProductTag;
  className?: string;
}

export default function ProductTagBadge({ tag, className }: Props) {
  if (!tag || isDisabledProductTag(tag)) return null;
  const meta = TAG_LABELS[tag];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export function StockBadge({
  available,
  tag,
}: {
  available: boolean;
  tag: ProductTag;
}) {
  if (available && !isDisabledProductTag(tag)) return null;
  const label =
    tag && isDisabledProductTag(tag)
      ? TAG_LABELS[tag].label
      : TAG_LABELS.out_of_stock.label;
  const className =
    tag && isDisabledProductTag(tag)
      ? TAG_LABELS[tag].className
      : TAG_LABELS.out_of_stock.className;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {label}
    </span>
  );
}
