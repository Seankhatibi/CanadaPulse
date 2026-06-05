import { NextResponse } from "next/server";
import { getDbIndicatorValues, getFallbackIndicatorValues } from "@/lib/indicator-values";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const geography = url.searchParams.get("geography") ?? "canada";
  const category = url.searchParams.get("category") ?? "economy";

  const dbValues = await getDbIndicatorValues({ geographySlug: geography, categorySlug: category }).catch(() => null);
  const values = dbValues && dbValues.length > 0 ? dbValues : getFallbackIndicatorValues({ geographySlug: geography, categorySlug: category });

  return NextResponse.json({
    geography,
    category,
    source: dbValues && dbValues.length > 0 ? "database" : "fallback",
    values,
  });
}
