import { NextResponse } from "next/server";
import { getAdityaWellKnown } from "@/lib/aditya/aditya-well-known";

export async function GET() {
  return NextResponse.json(getAdityaWellKnown(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
