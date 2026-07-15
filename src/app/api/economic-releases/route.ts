import { NextResponse } from "next/server";
import {
  economicReleaseSchedule,
  getCanadaReleaseDate,
} from "@/lib/economic-releases";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";
import { getMultiSourceReleaseHub, type NormalizedRelease } from "@/lib/release-hub";
import { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";

function sanitizeRelease(release: NormalizedRelease) {
  return release;
}

export async function GET() {
  const canadaDate = getCanadaReleaseDate();
  const dailyEntries = await fetchStatCanDailyEntries().catch(() => []);
  const rankedEntries = rankDailyEntries(dailyEntries).slice(0, 8);
  const releaseHub = await getMultiSourceReleaseHub();
  const promoted = releaseHub.promotedRelease;

  return NextResponse.json({
    releaseHub: {
      generatedAt: releaseHub.generatedAt,
      promotedRelease: releaseHub.promotedRelease ? sanitizeRelease(releaseHub.promotedRelease) : null,
      housingWatch: sanitizeRelease(releaseHub.housingWatch),
      todayQueue: releaseHub.todayQueue.map(sanitizeRelease),
      provinceImpact: releaseHub.provinceImpact,
      sourceStatuses: releaseHub.sourceStatuses,
    },
    promotedRelease: promoted,
    plainEnglishSummary: promoted?.plainEnglishSummary ?? null,
    readerTakeaway: promoted?.headlineFacts[0] ?? null,
    weeklyPulse: buildLiveWeeklyPulseSummary(releaseHub),
    dailyReleaseFeed: rankedEntries,
    canadaDate,
    isPromotedReleaseToday: promoted?.releaseDate === canadaDate,
    schedule: economicReleaseSchedule,
    coverage: "Official releases, parsed metrics, province breakdowns, source links and the rolling weekly briefing.",
  });
}
