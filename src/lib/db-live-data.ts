import { getPrisma } from "@/lib/prisma";
import { getLiveDataSummary, liveDataConnections } from "@/lib/live-data-registry";

export async function getDbLiveDataPayload() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const prisma = getPrisma();
  const sourceDatasets = await prisma.sourceDataset.findMany({
    orderBy: [{ updateStatus: "asc" }, { label: "asc" }],
    include: { indicatorMaps: { include: { indicator: true } } },
  });
  const latestRuns = await prisma.dataRefreshRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 12,
    include: { sourceDataset: true },
  });
  const releaseEvents = await prisma.releaseEvent.findMany({
    orderBy: { releaseDate: "desc" },
    take: 8,
    include: { sourceDataset: true },
  });

  const live = sourceDatasets.filter((source) => source.updateStatus === "LIVE").length;
  const linked = sourceDatasets.filter((source) => source.updateStatus === "SOURCE_LINKED").length;
  const pending = sourceDatasets.filter((source) =>
    ["IMPORT_PENDING", "NEEDS_SOURCE", "LICENSED_SOURCE_NEEDED"].includes(source.updateStatus),
  ).length;

  return {
    source: "database",
    summary: {
      live,
      linked,
      pending,
      total: sourceDatasets.length,
      read:
        "Database-backed source registry is active. Dashboards should read live TimeSeriesValue rows first and visibly label fallback data.",
    },
    connections: sourceDatasets.map((source) => ({
      slug: source.slug,
      label: source.label,
      appArea: source.indicatorMaps.map((map) => map.indicator.categoryId).join(", "),
      publisher: source.publisher,
      sourceUrl: source.officialUrl,
      refreshCadence: source.cadence,
      status: source.updateStatus,
      latestKnownPeriod: source.latestKnownPeriod,
      implementation: `${source.indicatorMaps.length} indicator map(s) configured.`,
      indicatorMaps: source.indicatorMaps.map((map) => ({
        indicatorSlug: map.indicator.slug,
        indicatorName: map.indicator.name,
        importStatus: map.importStatus,
        productId: map.productId,
        vectorId: map.vectorId,
        fieldPath: map.fieldPath,
      })),
    })),
    latestRuns,
    releaseEvents,
  };
}

export function getFallbackLiveDataPayload() {
  return {
    source: "fallback-registry",
    summary: getLiveDataSummary(),
    connections: liveDataConnections,
    latestRuns: [],
    releaseEvents: [],
  };
}
