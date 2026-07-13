import { NextResponse } from "next/server";
import {
  economicReleaseSchedule,
  getCanadaReleaseDate,
  getWeeklyPulseSummary,
  isCanadaReleaseToday,
  latestMajorEconomicRelease,
} from "@/lib/economic-releases";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";
import type { NormalizedRelease } from "@/lib/release-hub";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

function sanitizeRelease(release: NormalizedRelease) {
  return release;
}

export async function GET() {
  const canadaDate = getCanadaReleaseDate();
  const dailyEntries = await fetchStatCanDailyEntries().catch(() => []);
  const rankedEntries = rankDailyEntries(dailyEntries).slice(0, 8);
  const releaseHub = await getMultiSourceReleaseHub();

  return NextResponse.json({
    releaseHub: {
      generatedAt: releaseHub.generatedAt,
      promotedRelease: releaseHub.promotedRelease ? sanitizeRelease(releaseHub.promotedRelease) : null,
      housingWatch: sanitizeRelease(releaseHub.housingWatch),
      todayQueue: releaseHub.todayQueue.map(sanitizeRelease),
      provinceImpact: releaseHub.provinceImpact,
      sourceStatuses: releaseHub.sourceStatuses,
    },
    promotedRelease: latestMajorEconomicRelease,
    plainEnglishSummary: latestMajorEconomicRelease.plainEnglishSummary,
    readerTakeaway: latestMajorEconomicRelease.readerTakeaway,
    weeklyPulse: getWeeklyPulseSummary(),
    dailyReleaseFeed: rankedEntries,
    canadaDate,
    isPromotedReleaseToday: isCanadaReleaseToday(latestMajorEconomicRelease.releaseDate),
    schedule: economicReleaseSchedule,
    automationPlan: {
      detect: "Poll the Statistics Canada release calendar and known The Daily source URLs on scheduled release mornings.",
      fetch: "Fetch official release pages and StatCan tables for configured table IDs.",
      analyze:
        "Run deterministic rules first: headline number, direction, surprise/momentum, household impact, sector winners/losers, next release date.",
      promote:
        "If importance is major and releaseDate matches today, show the release module above the homepage score. On Fridays, publish the weekly summary module.",
      llmOptional:
        "An LLM API is useful for richer plain-English summaries and social-card copy, but core fetching, ranking, source links, charts, and promotion should work without it.",
    },
  });
}
