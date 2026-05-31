import type { ComboPack } from "@/data/combos";
import { COMBO_PACK_IMAGE } from "@/data/combos";
import { cn } from "@/lib/cn";

interface Props {
  combo: ComboPack;
  className?: string;
  aspect?: "square" | "wide";
}

export default function ComboVisual({ combo, className, aspect = "square" }: Props) {
  const src = combo.imagePath?.trim() || COMBO_PACK_IMAGE;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-brand/10",
        aspect === "wide" ? "aspect-[2/1] w-full" : "aspect-square w-full",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={combo.nameTelugu ? `${combo.name} — ${combo.nameTelugu}` : combo.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
