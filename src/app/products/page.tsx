import JsonLd from "@/components/JsonLd";
import ShopGrid from "@/components/ShopGrid";
import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import { itemListJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pickles",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return (
    <>
      <JsonLd data={itemListJsonLd(products, "/products", "Lachava pickle menu")} />
      <ShopGrid
      initialProducts={products}
      initialCombos={combos}
      showCombo
      showFilters
      title="Pickles"
      subtitle="1 kg & 1/2 kg — official prices"
    />
    </>
  );
}
