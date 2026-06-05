import { NextResponse } from "next/server";
import {
  mythRealityItems,
  shareCards,
  timelineReplay,
  weeklyPulseItems,
} from "@/lib/viral-data";
import { getWeeklyPulseSummary, latestMajorEconomicRelease } from "@/lib/economic-releases";

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    status: "source-ready-demo",
    promotedEconomicRelease: {
      title: latestMajorEconomicRelease.title,
      releaseDate: latestMajorEconomicRelease.releaseDate,
      referencePeriod: latestMajorEconomicRelease.referencePeriod,
      plainEnglishSummary: latestMajorEconomicRelease.plainEnglishSummary,
      readerTakeaway: latestMajorEconomicRelease.readerTakeaway,
      sourceUrl: latestMajorEconomicRelease.sourceUrl,
      chartPoints: latestMajorEconomicRelease.chartPoints,
    },
    weeklyPulseSummary: getWeeklyPulseSummary(),
    shareCards,
    weeklyPulseItems,
    mythRealityItems,
    timelineReplay,
    aiSummaryReadiness: {
      enabled: false,
      llmRequiredNow: false,
      note: "This endpoint returns deterministic editorial summaries today. A future LLM job can rewrite weekly briefs, chart explanations, and share-card copy after each official release lands.",
      suggestedJobs: [
        "Generate weekly Canada in 60 seconds brief",
        "Explain newest GDP, CPI, labour, housing, population, health, and trade releases",
        "Create neutral myth-vs-reality cards from official-source deltas",
        "Produce short social captions for share cards",
      ],
    },
  });
}
