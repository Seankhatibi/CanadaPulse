import { getPrisma } from "@/lib/prisma";
import { refreshStatCanDailyReleaseFacts } from "@/lib/etl/statcan-adapter";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";
import { getMultiSourceReleaseHub, type NormalizedRelease } from "@/lib/release-hub";

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
  run: () => Promise<T & { rowsFetched?: number; rowsChanged?: number; metadata?: unknown }>;
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
        metadata: result.metadata === undefined ? undefined : JSON.parse(JSON.stringify(result.metadata)),
      },
    });

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

      for (const entry of result.entries) {
        const score = getReleaseScore(entry);
        const releaseData = await fetchStatCanReleaseData(entry).catch(() => null);
        const facts = {
          feed: entry.feed,
          summary: entry.summary,
          score,
          sourceStatus: releaseData?.sourceStatus ?? "summary_only",
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

        await prisma.releaseEvent.upsert({
          where: {
            sourceUrl_releaseDate: {
              sourceUrl: entry.href,
              releaseDate: new Date(entry.published),
            },
          },
          update: {
            title: entry.title,
            referencePeriod: entry.published,
            facts,
            plainEnglishSummary: entry.summary,
            summaryStatus: "GENERATED",
            promoted: Boolean(score && score > 0),
            sourceDatasetId: sourceDataset?.id,
          },
          create: {
            title: entry.title,
            sourceUrl: entry.href,
            releaseDate: new Date(entry.published),
            referencePeriod: entry.published,
            affectedIndicators: [],
            facts,
            plainEnglishSummary: entry.summary,
            summaryStatus: "GENERATED",
            promoted: Boolean(score && score > 0),
            sourceDatasetId: sourceDataset?.id,
          },
        });
      }

      return result;
    },
  });
}

function sourceDatasetSlugForRelease(release: NormalizedRelease) {
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

      if (!process.env.DATABASE_URL) {
        return {
          rowsFetched: hub.todayQueue.length,
          rowsChanged: hub.todayQueue.length,
          metadata: {
            adapter: "MultiSourceReleaseHub",
            promotedRelease: hub.promotedRelease?.title ?? null,
            sources: hub.sourceStatuses,
          },
          hub,
        };
      }

      const prisma = getPrisma();

      for (const release of hub.todayQueue) {
        const sourceDatasetSlug = sourceDatasetSlugForRelease(release);
        const sourceDataset = sourceDatasetSlug
          ? await prisma.sourceDataset.findUnique({ where: { slug: sourceDatasetSlug } })
          : null;
        const facts = {
          source: release.source,
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

        await prisma.releaseEvent.upsert({
          where: {
            sourceUrl_releaseDate: {
              sourceUrl: release.sourceUrl,
              releaseDate: new Date(release.releaseDate),
            },
          },
          update: {
            title: release.title,
            referencePeriod: release.referencePeriod,
            affectedIndicators: release.affectedAreas,
            facts,
            plainEnglishSummary: release.plainEnglishSummary,
            socialSummary: release.socialSummary,
            summaryStatus: "GENERATED",
            promoted: release.promoted,
            sourceDatasetId: sourceDataset?.id,
          },
          create: {
            title: release.title,
            sourceUrl: release.sourceUrl,
            releaseDate: new Date(release.releaseDate),
            referencePeriod: release.referencePeriod,
            affectedIndicators: release.affectedAreas,
            facts,
            plainEnglishSummary: release.plainEnglishSummary,
            socialSummary: release.socialSummary,
            summaryStatus: "GENERATED",
            promoted: release.promoted,
            sourceDatasetId: sourceDataset?.id,
          },
        });
      }

      return {
        rowsFetched: hub.todayQueue.length,
        rowsChanged: hub.todayQueue.length,
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
