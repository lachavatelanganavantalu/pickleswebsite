import { NextResponse } from "next/server";
import { getAllCombos } from "@/lib/combos-db";
import { stripComboForPublic } from "@/lib/catalog-media";

export async function GET() {
  const combos = await getAllCombos();
  return NextResponse.json(
    combos.filter((c) => c.available !== false).map(stripComboForPublic)
  );
}
