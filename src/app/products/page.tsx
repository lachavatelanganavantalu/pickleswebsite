import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import ShopGrid from "@/components/ShopGrid";

export const metadata = {
  title: "Pickles",
};

export default async function ProductsPage() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return (
    <ShopGrid
      initialProducts={products}
      initialCombos={combos}
      showCombo
      showFilters
      title="Pickles"
      subtitle="1 kg & 1/2 kg — official prices"
    />
  );
}
