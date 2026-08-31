import { NextResponse } from "next/server";
import { getDbIndicatorValues, getReleaseIndicatorValues } from "@/lib/indicator-values";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const geography = url.searchParams.get("geography") ?? "canada";
  const category = url.searchParams.get("category") ?? "economy";

  const dbValues = await getDbIndicatorValues({ geographySlug: geography, categorySlug: category }).catch(() => null);
  const releaseValues = dbValues && dbValues.length > 0 ? [] : await getReleaseIndicatorValues({ geographySlug: geography, categorySlug: category });
  const values = dbValues && dbValues.length > 0 ? dbValues : releaseValues;

  return NextResponse.json({
    geography,
    category,
    status: values.length ? "live" : "unavailable",
    source: dbValues && dbValues.length > 0 ? "database" : values.length ? "official-release-hub" : "none",
    values,
    note: values.length
      ? "Values are sourced from normalized official releases."
      : "No source-backed values are currently available for this geography and category; Canada Pulse does not substitute modeled data.",
  });
}
