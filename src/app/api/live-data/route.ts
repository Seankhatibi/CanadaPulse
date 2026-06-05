import { NextResponse } from "next/server";
import { getDbLiveDataPayload, getFallbackLiveDataPayload } from "@/lib/db-live-data";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";

export async function GET() {
  const dailyEntries = rankDailyEntries(await fetchStatCanDailyEntries().catch(() => [])).slice(0, 8);
  const dbPayload = await getDbLiveDataPayload().catch(() => null);
  const payload = dbPayload ?? getFallbackLiveDataPayload();

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    ...payload,
    liveFeeds: {
      statcanDaily: dailyEntries,
    },
    refreshPolicy: {
      daily:
        "Run official-release monitoring every day and promote major same-day releases to the homepage.",
      monthly:
        "Refresh CPI, labour, housing starts/completions, trade, and energy when their source cadence updates.",
      quarterly:
        "Refresh GDP, population, immigration stock, and provincial accounts on release dates.",
      annual:
        "Refresh tax, budgets, health expenditure, chronic disease, quality of life, and public accounts annually.",
    },
  });
}
