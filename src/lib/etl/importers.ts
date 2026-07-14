import { getPrisma } from "@/lib/prisma";
import { refreshStatCanDailyReleaseFacts } from "@/lib/etl/statcan-adapter";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";
import { getMultiSourceReleaseHub, type NormalizedRelease } from "@/lib/release-hub";
import { getLatestDailyReleaseDate, rankDailyEntries } from "@/lib/statcan-daily";

function releaseSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function inferReleaseAreas(value: string) {
  const text = value.toLowerCase();
  const areas = new Set<string>();
  if (/housing|rent|construction|building/.test(text)) areas.add("housing");
  if (/retail|wholesale|sales|manufacturing|gdp|productivity/.test(text)) areas.add("economy");
  if (/price|inflation|consumer price|cpi/.test(text)) areas.add("inflation");
  if (/labour|employment|unemployment|wage/.test(text)) areas.add("labour");
  if (/population|immigration|temporary resident|student|refugee/.test(text)) areas.add("population");
  if (/trade|export|import/.test(text)) areas.add("trade");
  if (/energy|oil|gas|electricity|natural resources/.test(text)) areas.add("energy");
  return [...areas];
}

function stableJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

async function upsertReleaseEventIfChanged({
  sourceUrl,
  releaseDate,
  data,
}: {
  sourceUrl: string;
  releaseDate: Date;
  data: Record<string, unknown>;
}) {
  const prisma = getPrisma();
  const where = { sourceUrl_releaseDate: { sourceUrl, releaseDate } };
  const existing = await prisma.releaseEvent.findUnique({ where });

  if (!existing) {
    await prisma.releaseEvent.create({
      data: { ...data, sourceUrl, releaseDate } as never,
    });
    return true;
  }

  const comparableKeys = [
    "sourceDatasetId",
    "source",
    "slug",
    "publisher",
    "releaseType",
    "geographyLevel",
    "status",
    "metricCount",
    "title",
    "referencePeriod",
    "affectedIndicators",
    "facts",
    "plainEnglishSummary",
    "socialSummary",
    "summaryStatus",
    "promoted",
  ] as const;
  const changed = comparableKeys.some((key) =>
    stableJson(existing[key as keyof typeof existing]) !== stableJson(data[key]),
  );

  if (!changed) return false;

  await prisma.releaseEvent.update({ where, data: data as never });
  return true;
}

function getReleaseScore(entry: unknown) {
  if (typeof entry !== "object" || entry === null || !("score" in entry)) {
    return null;
  }

  const score = (entry as { score?: unknown }).score;
  return typeof score === "number" ? score : null;
}

export async function runWithRefreshLog<T>({
  jobName,
  sourceDatasetSlug,
  run,
}: {
  jobName: string;
  sourceDatasetSlug?: string;
  run: () => Promise<T & { rowsFetched?: number; rowsChanged?: number; sourceVersion?: string; metadata?: unknown }>;
}) {
  if (!process.env.DATABASE_URL) {
    const result = await run();
    return { persisted: false, result };
  }

  const prisma = getPrisma();
  const sourceDataset = sourceDatasetSlug
    ? await prisma.sourceDataset.findUnique({ where: { slug: sourceDatasetSlug } })
    : null;
  const refreshRun = await prisma.dataRefreshRun.create({
    data: {
      jobName,
      sourceDatasetId: sourceDataset?.id,
      status: "RUNNING",
    },
  });

  try {
    const result = await run();

    await prisma.dataRefreshRun.update({
      where: { id: refreshRun.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        rowsFetched: result.rowsFetched ?? 0,
        rowsChanged: result.rowsChanged ?? 0,
        sourceVersion: result.sourceVersion,
        metadata: result.metadata === undefined ? undefined : JSON.parse(JSON.stringify(result.metadata)),
      },
    });
    if (sourceDataset) {
      await prisma.sourceDataset.update({
        where: { id: sourceDataset.id },
        data: { lastCheckedAt: new Date() },
      });
    }

    return { persisted: true, result };
  } catch (error) {
    await prisma.dataRefreshRun.update({
      where: { id: refreshRun.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorPayload: {
          message: error instanceof Error ? error.message : String(error),
        },
      },
    });
    if (sourceDataset) {
      await prisma.sourceDataset.update({
        where: { id: sourceDataset.id },
        data: { lastCheckedAt: new Date() },
      });
    }
    throw error;
  }
}

export async function persistStatCanDailyReleaseEvents() {
  return runWithRefreshLog({
    jobName: "refresh-statcan-daily-release-events",
    sourceDatasetSlug: "statcan-daily-economic-releases",
    run: async () => {
      const result = await refreshStatCanDailyReleaseFacts();

      if (!process.env.DATABASE_URL) {
        return result;
      }

      const prisma = getPrisma();
      const sourceDataset = await prisma.sourceDataset.findUnique({
        where: { slug: "statcan-daily-economic-releases" },
      });
      const latestDate = getLatestDailyReleaseDate(result.entries);
      let rowsChanged = 0;
      const entriesToEnrich = new Set(
        rankDailyEntries(result.entries.filter((entry) => entry.published.startsWith(latestDate)))
          .slice(0, 12)
          .map((entry) => entry.href),
      );
      if (sourceDataset) {
        await prisma.sourceDataset.update({
          where: { id: sourceDataset.id },
          data: { latestKnownPeriod: latestDate },
        });
      }

      for (const entry of result.entries) {
        const score = getReleaseScore(entry);
        const affectedAreas = inferReleaseAreas(`${entry.title} ${entry.summary}`);
        const releaseData = entriesToEnrich.has(entry.href) ? await fetchStatCanReleaseData(entry).catch(() => null) : null;
        const facts = {
          source: "statcan",
          publisher: "Statistics Canada",
          slug: releaseSlug(entry.title),
          releaseType: "official-daily-release",
          feed: entry.feed,
          summary: entry.summary,
          score,
          sourceStatus: releaseData?.sourceStatus ?? "summary_only",
          enrichmentStatus: entriesToEnrich.has(entry.href) ? "latest-release-enrichment" : "archive-summary",
          tableIds: releaseData?.tableIds ?? [],
          tableLinks: releaseData?.tableLinks ?? [],
          wdsDownloads: releaseData?.wdsDownloads ?? [],
          signals: releaseData?.signals ?? [],
          tables: releaseData?.tables.map((table) => ({
            title: table.title,
            sourceTableIds: table.sourceTableIds,
            periods: table.periods,
            rows: table.rows,
          })) ?? [],
        };

        const changed = await upsertReleaseEventIfChanged({
          sourceUrl: entry.href,
          releaseDate: new Date(entry.published),
          data: {
            sourceDatasetId: sourceDataset?.id,
            source: "statcan",
            slug: releaseSlug(entry.title),
            publisher: "Statistics Canada",
            releaseType: "official-daily-release",
            geographyLevel: "mixed",
            status: releaseData?.sourceStatus === "table_data_loaded" ? "live" : "summary_only",
            metricCount: releaseData?.signals.length ?? 0,
            title: entry.title,
            referencePeriod: releaseData?.tables[0]?.latestPeriod ?? entry.published,
            affectedIndicators: affectedAreas,
            facts,
            plainEnglishSummary: entry.summary,
            socialSummary: entry.summary,
            summaryStatus: "GENERATED",
            promoted: Boolean(score && score > 0),
          },
        });
        if (changed) rowsChanged += 1;
      }

      return { ...result, rowsChanged, sourceVersion: latestDate };
    },
  });
}

function sourceDatasetSlugForRelease(release: NormalizedRelease) {
  if (release.source === "statcan" && release.releaseType === "statcan-cpi-watch") return "statcan-wds-cpi";
  if (release.source === "cmhc" && release.releaseType === "cmhc-rental-market") return "cmhc-rental-market";
  if (release.source === "cmhc") return "cmhc-housing-starts";
  if (release.source === "bank-of-canada" && release.releaseType.startsWith("bank-of-canada-")) return "bank-of-canada-reports";
  if (release.source === "bank-of-canada") return "bank-of-canada-valet";
  if (release.source === "open-government-ircc") return "open-government-ircc";
  if (release.source === "finance-canada") return "finance-canada-fiscal-monitor";
  if (release.source === "cer-nrcan") return "cer-nrcan-energy";
  if (release.source === "pbo") return "pbo-fiscal-reports";
  if (release.source === "statcan") return "statcan-daily-economic-releases";
  return undefined;
}

export async function persistMultiSourceReleaseEvents() {
  return runWithRefreshLog({
    jobName: "refresh-multi-source-release-hub",
    run: async () => {
      const hub = await getMultiSourceReleaseHub();
      const releasesToPersist = hub.todayQueue.filter(
        (release) => !(release.source === "statcan" && release.releaseType === "official-daily-release"),
      );

      if (!process.env.DATABASE_URL) {
        return {
          rowsFetched: releasesToPersist.length,
          rowsChanged: 0,
          metadata: {
            adapter: "MultiSourceReleaseHub",
            promotedRelease: hub.promotedRelease?.title ?? null,
            sources: hub.sourceStatuses,
          },
          hub,
        };
      }

      const prisma = getPrisma();
      let rowsChanged = 0;

      for (const release of releasesToPersist) {
        const sourceDatasetSlug = sourceDatasetSlugForRelease(release);
        const sourceDataset = sourceDatasetSlug
          ? await prisma.sourceDataset.findUnique({ where: { slug: sourceDatasetSlug } })
          : null;
        const facts = {
          source: release.source,
          slug: release.slug,
          publisher: release.publisher,
          releaseType: release.releaseType,
          releaseDate: release.releaseDate,
          referencePeriod: release.referencePeriod,
          geographyLevel: release.geographyLevel,
          affectedAreas: release.affectedAreas,
          headlineFacts: release.headlineFacts,
          provinceBreakdown: release.provinceBreakdown,
          chartPayloads: release.chartPayloads,
          sourceLinks: release.sourceLinks,
          importanceScore: release.importanceScore,
          youthImpactScore: release.youthImpactScore,
          housingImpactScore: release.housingImpactScore,
          promoted: release.promoted,
          status: release.status,
          internalHref: release.href,
        };

        const changed = await upsertReleaseEventIfChanged({
          sourceUrl: release.sourceUrl,
          releaseDate: new Date(release.releaseDate),
          data: {
            sourceDatasetId: sourceDataset?.id,
            source: release.source,
            slug: release.slug,
            publisher: release.publisher,
            releaseType: release.releaseType,
            geographyLevel: release.geographyLevel,
            status: release.status,
            metricCount: release.chartPayloads.reduce((total, chart) => total + chart.points.length, 0),
            title: release.title,
            referencePeriod: release.referencePeriod,
            affectedIndicators: release.affectedAreas,
            facts,
            plainEnglishSummary: release.plainEnglishSummary,
            socialSummary: release.socialSummary,
            summaryStatus: "GENERATED",
            promoted: release.promoted,
          },
        });
        if (changed) rowsChanged += 1;
        if (sourceDataset) {
          await prisma.sourceDataset.update({
            where: { id: sourceDataset.id },
            data: {
              lastCheckedAt: new Date(),
              latestKnownPeriod: release.status === "live" ? release.referencePeriod : sourceDataset.latestKnownPeriod,
            },
          });
        }
      }

      return {
        rowsFetched: releasesToPersist.length,
        rowsChanged,
        sourceVersion: hub.generatedAt,
        metadata: {
          adapter: "MultiSourceReleaseHub",
          promotedRelease: hub.promotedRelease?.title ?? null,
          sources: hub.sourceStatuses,
        },
        hub,
      };
    },
  });
}
