import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products-db";

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
      return NextResponse.json(product);
    }

    if (category === "veg" || category === "non-veg") {
      return NextResponse.json(products.filter((p) => p.category === category));
    }

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
