import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAllProducts, upsertProduct } from "@/lib/products-db";
import { normalizeProduct, validateProduct } from "@/lib/product-admin";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { PickleProduct } from "@/types/product";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const products = await getAllProducts();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const raw = (await req.json()) as PickleProduct;
    const existing = await getAllProducts();
    const product = normalizeProduct(raw);
    const errors = validateProduct(product, existing);
    if (errors.length) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }
    const saved = await upsertProduct(product);
    revalidateCatalog(saved.slug);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products:", err);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}
