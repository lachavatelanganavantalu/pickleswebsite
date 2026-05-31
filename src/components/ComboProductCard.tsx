import Link from "next/link";
import { ComboPack } from "@/data/combos";
import { formatINRDecimal } from "@/lib/format-price";
import ComboVisual from "./ComboVisual";
import WishlistHeartButton from "./WishlistHeartButton";

interface Props {
  combo: ComboPack;
}

export default function ComboProductCard({ combo }: Props) {
  return (
    <article className="shop-product-card flex flex-col">
      <div className="relative">
        <ComboVisual combo={combo} />
        <WishlistHeartButton itemId={combo.id} />
      </div>

      <div className="shop-product-meta flex flex-1 flex-col pt-2.5">
        <h3 className="shop-product-title">{combo.nameTelugu ?? combo.name}</h3>
        <p className="shop-product-tags">Combo · ₹999</p>
        <p className="shop-product-price">{formatINRDecimal(combo.priceINR)}</p>
        <Link href="/combos" className="shop-select-btn">
          VIEW COMBO
        </Link>
      </div>
    </article>
  );
}
