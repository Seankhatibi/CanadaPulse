import { getDbLiveDataPayload } from "@/lib/db-live-data";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";
import { countStructuredMetrics, getMultiSourceReleaseHub, hasQualitativeAnalysis } from "@/lib/release-hub";

function validDate(value: string) {
  const timestamp = Date.parse(value.length === 7 ? `${value}-01T12:00:00Z` : value);
  return Number.isFinite(timestamp) && timestamp > Date.parse("2020-01-01T00:00:00Z") ? timestamp : 0;
}

export async function getSystemHealth() {
  const [hub, database, cihi] = await Promise.all([
    getMultiSourceReleaseHub(),
    getDbLiveDataPayload().catch(() => null),
    fetchCihiHealthSnapshot(),
  ]);
  const releases = hub.todayQueue
    .filter((release) => release.status === "live" && !release.archiveFallback && validDate(release.releaseDate))
    .sort((a, b) => validDate(b.releaseDate) - validDate(a.releaseDate));
  const latestRelease = hub.promotedRelease?.status === "live" ? hub.promotedRelease : releases[0] ?? null;
  const warnings: string[] = [];
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const archiveActive = Boolean(database?.archive.active);

  if (databaseConfigured && database?.archive.stale) warnings.push("The release archive has not completed a successful refresh in more than 96 hours.");
  else if (databaseConfigured && !archiveActive) warnings.push("The database is connected, but the release archive has not completed a successful refresh.");
  if (!process.env.CRON_SECRET) warnings.push("Scheduled source checks are unavailable in this environment.");
  const housingAge = (Date.now() - validDate(hub.housingWatch.releaseDate)) / 86_400_000;
  if (housingAge > 120) warnings.push(`Quarterly housing construction release is ${Math.round(housingAge)} days old.`);

  return {
    generatedAt: new Date().toISOString(),
    persistence: archiveActive ? "database" as const : databaseConfigured ? "degraded" as const : "request-time" as const,
    archive: database?.archive ?? null,
    scheduler: process.env.CRON_SECRET ? "configured" as const : "not-configured" as const,
    latestRelease: latestRelease
      ? {
          title: latestRelease.title,
          publisher: latestRelease.publisher,
          releaseDate: latestRelease.releaseDate,
          referencePeriod: latestRelease.referencePeriod,
          status: latestRelease.status,
          href: latestRelease.href,
          metrics: countStructuredMetrics(latestRelease),
        }
      : null,
    sourceStatuses: [
      ...hub.sourceStatuses,
      { source: "CIHI", status: cihi.status === "live" ? "live" as const : "source_linked" as const, note: `National Health Expenditure Trends ${cihi.period}; ${cihi.metrics.length} parsed values.` },
    ],
    recentReleases: releases.slice(0, 8).map((release) => {
      const metrics = countStructuredMetrics(release);
      return {
        title: release.title,
        publisher: release.publisher,
        releaseDate: release.releaseDate,
        status: release.status,
        href: release.href,
        metrics,
        evidence: metrics ? "structured" as const : hasQualitativeAnalysis(release) ? "narrative" as const : "summary" as const,
      };
    }),
    refreshRuns: database?.latestRuns.slice(0, 8) ?? [],
    warnings,
  };
}
