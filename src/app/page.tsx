import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import HomeHeroCarousel from "@/components/HomeHeroCarousel";
import HomeAboutSection from "@/components/HomeAboutSection";
import HomeGalleryCarousel from "@/components/HomeGalleryCarousel";
import ShopGrid from "@/components/ShopGrid";

export default async function Home() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return (
    <>
      <HomeHeroCarousel />
      <ShopGrid
        initialProducts={products}
        initialCombos={combos}
        showCombo
        showFilters
        title="Our Pickles"
        subtitle="1 kg & 1/2 kg — official menu"
      />
      <HomeAboutSection />
      <HomeGalleryCarousel />
    </>
  );
}
