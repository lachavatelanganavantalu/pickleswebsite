import ComboOrderButton from "@/components/ComboOrderButton";
import ComboVisual from "@/components/ComboVisual";
import { getAllCombos } from "@/lib/combos-db";
import { formatINRDecimal } from "@/lib/format-price";

export default async function CombosPage() {
  const combos = await getAllCombos();

  return (
    <div className="app-content py-[clamp(1rem,4vw,2rem)]">
      <h1 className="shop-page-title">Combo offer</h1>
      <p className="mt-1 text-sm text-shop-muted">Official 5-pickle pack — ₹999</p>

      <div className="mt-6 space-y-4">
        {combos.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-xl bg-white">
            <ComboVisual combo={c} aspect="wide" />
            <div className="p-5">
              <p className="text-sm text-muted">{c.description}</p>
              {c.descriptionTelugu && (
                <p className="mt-2 text-sm text-muted">{c.descriptionTelugu}</p>
              )}
              <p className="mt-2 text-xs text-muted">{c.items}</p>
              {c.itemsTelugu && (
                <p className="mt-1 text-xs text-muted">{c.itemsTelugu}</p>
              )}
              <p className="mt-4 text-2xl font-bold text-brand">{formatINRDecimal(c.priceINR)}</p>
              <ComboOrderButton combo={c} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
