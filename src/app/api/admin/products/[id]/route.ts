import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteProduct, getAllProducts, upsertProduct } from "@/lib/products-db";
import { normalizeProduct, validateProduct } from "@/lib/product-admin";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { PickleProduct } from "@/types/product";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const raw = (await req.json()) as PickleProduct;
    const existing = await getAllProducts();
    const current = existing.find((p) => p.id === id);
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = normalizeProduct({ ...current, ...raw, id });
    const errors = validateProduct(product, existing, id);
    if (errors.length) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }
    const saved = await upsertProduct(product);
    revalidateCatalog(saved.slug);
    return NextResponse.json(saved);
  } catch (err) {
    console.error("PATCH /api/admin/products/[id]:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const ok = await deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id]:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
