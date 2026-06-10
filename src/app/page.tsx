import type { Metadata } from "next";
import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import { faqPageJsonLd, storeJsonLd } from "@/lib/structured-data";
import HomeHeroCarousel from "@/components/HomeHeroCarousel";
import HomeAboutSection from "@/components/HomeAboutSection";
import HomeFaqSection from "@/components/HomeFaqSection";
import JsonLd from "@/components/JsonLd";
import ShopGrid from "@/components/ShopGrid";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return (
    <>
      <h1 className="sr-only">
        Lachava Telangana Pickles — Authentic Telangana Vantalu &amp; Traditional Pickles
      </h1>
      <JsonLd data={[storeJsonLd(), faqPageJsonLd()]} />
      <HomeHeroCarousel />
      <ShopGrid
        initialProducts={products}
        initialCombos={combos}
        showCombo
        showFilters
        title="Our Pickles"
        titleTag="h2"
        subtitle="1 kg & 1/2 kg — official menu"
      />
      <HomeAboutSection />
      <HomeFaqSection />
    </>
  );
}
