import { NextResponse } from "next/server";
import { getDbLiveDataPayload, getFallbackLiveDataPayload } from "@/lib/db-live-data";
import { officialDataSources } from "@/lib/source-registry";

export async function GET() {
  const dbPayload = await getDbLiveDataPayload().catch(() => null);
  const payload = dbPayload ?? getFallbackLiveDataPayload();

  return NextResponse.json({
    sources: officialDataSources,
    liveDataSummary: payload.summary,
    liveConnections: payload.connections,
    policy: "Official government sources are preferred for production indicators. Third-party sites may be linked as context but should not replace official source data.",
  });
}
