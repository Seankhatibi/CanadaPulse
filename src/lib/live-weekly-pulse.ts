import { countStructuredMetrics, type NormalizedRelease, type ReleaseHubPayload } from "@/lib/release-hub";

function timestamp(release: NormalizedRelease) {
  const value = release.releaseDate.length === 7 ? `${release.releaseDate}-01T12:00:00Z` : `${release.releaseDate.slice(0, 10)}T12:00:00Z`;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueFacts(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}

export function buildLiveWeeklyPulseSummary(releaseHub: ReleaseHubPayload, date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "long" }).format(date);
  const weekStart = date.getTime() - 7 * 86_400_000;
  const releases = releaseHub.todayQueue
    .filter((release) => release.status === "live" && timestamp(release) >= weekStart)
    .sort((a, b) => timestamp(b) - timestamp(a) || b.importanceScore - a.importanceScore);
  const lead = releaseHub.promotedRelease ?? releases[0] ?? null;
  const rateWatch = releases.find((release) => release.releaseType === "valet-rate-observation");
  const tradeWatch = releases.find((release) => /merchandise trade/i.test(release.title));
  const housingWatch = releaseHub.housingWatch.status === "live" ? releaseHub.housingWatch : null;
  const highlights = uniqueFacts([
    ...(lead?.headlineFacts.slice(0, 3) ?? []),
    housingWatch?.headlineFacts[0],
    rateWatch?.headlineFacts[0],
    tradeWatch?.headlineFacts[0],
  ]).slice(0, 5);

  return {
    title: "Canada in 60 Seconds",
    generatedFor: formatter.format(date),
    publishMode: weekday === "Friday" ? "friday-weekly-summary" as const : "rolling-weekly-brief" as const,
    headline: lead?.title ?? "Waiting for the next official data release",
    summary: lead?.plainEnglishSummary ?? "Canada Pulse is monitoring official Canadian sources for the next update.",
    highlights,
    releases: releases.slice(0, 8),
    releaseCount: releases.length,
    structuredReleaseCount: releases.filter((release) => countStructuredMetrics(release) > 0).length,
    liveSourceCount: releaseHub.sourceStatuses.filter((source) => source.status === "live").length,
  };
}
