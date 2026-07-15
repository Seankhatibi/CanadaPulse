import { countStructuredMetrics, getMultiSourceReleaseHub, hasQualitativeAnalysis, type NormalizedRelease } from "@/lib/release-hub";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";
import { unstable_cache } from "next/cache";
import { getPersistedReleases } from "@/lib/persisted-releases";

export type ArchiveRelease = {
  id: string;
  title: string;
  publisher: string;
  releaseDate: string;
  summary: string;
  status: "structured" | "narrative-report" | "summary" | "source-linked";
  metricCount: number;
  areas: string[];
  href: string;
  sourceUrl: string;
};

function timestamp(value: string) {
  const parsed = Date.parse(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function evidenceStatus(release: NormalizedRelease): ArchiveRelease["status"] {
  if (release.status === "source_linked") return "source-linked";
  if (release.status !== "live") return "summary";
  if (countStructuredMetrics(release)) return "structured";
  return hasQualitativeAnalysis(release) ? "narrative-report" : "summary";
}

async function buildReleaseArchive() {
  const [hub, daily, persisted] = await Promise.all([
    getMultiSourceReleaseHub(),
    fetchStatCanDailyEntries().then(rankDailyEntries).catch(() => []),
    getPersistedReleases().catch(() => []),
  ]);

  const hubItems: ArchiveRelease[] = hub.todayQueue.map((release) => ({
    id: release.id,
    title: release.title,
    publisher: release.publisher,
    releaseDate: release.releaseDate,
    summary: release.plainEnglishSummary,
    status: evidenceStatus(release),
    metricCount: countStructuredMetrics(release),
    areas: release.affectedAreas,
    href: release.href,
    sourceUrl: release.sourceUrl,
  }));
  const knownUrls = new Set(hubItems.map((release) => release.sourceUrl));
  const dailyItems: ArchiveRelease[] = daily.filter((entry) => !knownUrls.has(entry.href)).map((entry, index) => ({
    id: `statcan-daily-${index}-${entry.published.slice(0, 10)}`,
    title: entry.title,
    publisher: "Statistics Canada",
    releaseDate: entry.published.slice(0, 10),
    summary: entry.summary || "Official Statistics Canada Daily release.",
    status: "summary",
    metricCount: 0,
    areas: [],
    href: `/release?url=${encodeURIComponent(entry.href)}`,
    sourceUrl: entry.href,
  }));

  const requestTimeItems = [...hubItems, ...dailyItems];
  const knownReleaseKeys = new Set(requestTimeItems.map((release) => `${release.sourceUrl}|${release.releaseDate}`));
  const persistedItems: ArchiveRelease[] = persisted
    .filter((release) => !knownReleaseKeys.has(`${release.sourceUrl}|${release.releaseDate}`))
    .map((release) => ({
      id: `persisted-${release.id}`,
      title: release.title,
      publisher: release.publisher,
      releaseDate: release.releaseDate,
      summary: release.plainEnglishSummary,
      status: evidenceStatus(release),
      metricCount: countStructuredMetrics(release),
      areas: release.affectedAreas,
      href: release.href,
      sourceUrl: release.sourceUrl,
    }));

  return [...requestTimeItems, ...persistedItems].sort((a, b) => timestamp(b.releaseDate) - timestamp(a.releaseDate) || a.title.localeCompare(b.title));
}

export const getReleaseArchive = unstable_cache(
  buildReleaseArchive,
  ["canada-pulse-release-archive-v2"],
  { revalidate: 5 * 60, tags: ["canada-pulse-release-hub"] },
);

export function filterReleaseArchive(releases: ArchiveRelease[], query?: string, publisher?: string, status?: string) {
  const normalized = query?.trim().toLowerCase();
  return releases.filter((release) => {
    const matchesQuery = !normalized || `${release.title} ${release.summary} ${release.publisher} ${release.areas.join(" ")}`.toLowerCase().includes(normalized);
    const matchesPublisher = !publisher || publisher === "all" || release.publisher === publisher;
    const matchesStatus = !status || status === "all" || release.status === status;
    return matchesQuery && matchesPublisher && matchesStatus;
  });
}
