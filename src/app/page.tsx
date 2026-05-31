import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import ShopGrid from "@/components/ShopGrid";

export default async function Home() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return <ShopGrid initialProducts={products} initialCombos={combos} showCombo />;
}
