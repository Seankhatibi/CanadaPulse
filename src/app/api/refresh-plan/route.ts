import { NextResponse } from "next/server";
import { getDbLiveDataPayload, getFallbackLiveDataPayload } from "@/lib/db-live-data";
import { refreshJobs } from "@/lib/source-registry";

export async function GET() {
  const dbPayload = await getDbLiveDataPayload().catch(() => null);
  const payload = dbPayload ?? getFallbackLiveDataPayload();

  return NextResponse.json({
    jobs: refreshJobs,
    liveDataSummary: payload.summary,
    liveConnections: payload.connections,
    latestRuns: payload.latestRuns,
    releaseEvents: payload.releaseEvents,
    automationModel: {
      monthly: "CPI, CMHC, and other monthly release tables should be checked after release dates.",
      quarterly: "Population and temporary resident stock should refresh on quarterly release cycles.",
      annual: "Tax brackets, budgets, and public accounts should refresh after annual government releases.",
      releaseCalendar: "Datasets with announced release dates should use source-specific schedules.",
    },
  });
}
