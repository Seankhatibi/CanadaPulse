import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    geography: "Canada",
    latestKnownPeriod: "April 2026",
    allItemsCpiYoY: 2.8,
    annualAverageCpi2025: 164.2,
    annualAverageChange2025: 2.1,
    source: {
      publisher: "Statistics Canada",
      table: "18-10-0004-01",
      url: "https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes",
    },
    nextExpectedRelease: "2026-06-22",
    note: "Demo endpoint seeded from official CPI portal values. Replace with StatCan Web Data Service ingestion for production.",
  });
}
