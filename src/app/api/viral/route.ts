import { NextResponse } from "next/server";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";
export async function GET() {
  const hub = await getMultiSourceReleaseHub();
  return NextResponse.json({
    status: "live",
    generatedAt: hub.generatedAt,
    promotedRelease: hub.promotedRelease,
    shareableReleases: hub.todayQueue.filter((release) => release.status === "live" && release.chartPayloads.some((chart) => chart.points.length)).slice(0, 8),
    note: "Share content is generated only from normalized release facts; legacy modeled cards are no longer returned.",
  });
}
