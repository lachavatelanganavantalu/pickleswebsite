import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products-db";
import { stripProductForPublic } from "@/lib/catalog-media";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");

    const products = await getAllProducts();

    if (slug) {
      const resolvedSlug = slug === "prawn-pickle" ? "chepala-pickle" : slug;
      const product = products.find((p) => p.slug === resolvedSlug);
      if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(stripProductForPublic(product));
    }

    if (category === "veg" || category === "non-veg" || category === "combo") {
      return NextResponse.json(
        products.filter((p) => p.category === category).map(stripProductForPublic)
      );
    }

    return NextResponse.json(products.map(stripProductForPublic));
  } catch (err) {
    console.error("GET /api/products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
