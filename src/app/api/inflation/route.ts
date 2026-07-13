import { NextResponse } from "next/server";
import { fetchStatCanCpiSnapshot } from "@/lib/statcan-cpi";

export async function GET() {
  const snapshot = await fetchStatCanCpiSnapshot();
  return NextResponse.json({
    geography: "Canada",
    status: "live",
    latestKnownPeriod: snapshot.referencePeriod,
    releaseDate: snapshot.releaseDate,
    allItemsCpiYoY: snapshot.canada.allItems.yearOverYearPct,
    foodCpiYoY: snapshot.canada.food.yearOverYearPct,
    provinces: snapshot.provinces,
    components: snapshot.components,
    history: snapshot.history,
    source: {
      publisher: "Statistics Canada",
      table: snapshot.tableId,
      url: snapshot.sourceUrl,
    },
    methodology: "Year-over-year rates are calculated from official CPI index values for the latest month and the same month one year earlier.",
  });
}
