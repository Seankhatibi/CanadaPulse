import { getPrisma } from "../src/lib/prisma";
import { sourceDatasets } from "../src/lib/source-datasets";
import { persistMultiSourceReleaseEvents, persistStatCanDailyReleaseEvents } from "../src/lib/etl/importers";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for production bootstrap.");
  const prisma = getPrisma();

  for (const source of sourceDatasets) {
    await prisma.sourceDataset.upsert({
      where: { slug: source.slug },
      update: {
        label: source.label,
        publisher: source.publisher,
        officialUrl: source.officialUrl,
        apiType: source.apiType,
        cadence: source.cadence,
        licenseNote: source.licenseNote,
        updateStatus: source.updateStatus,
        latestKnownPeriod: source.latestKnownPeriod,
      },
      create: source,
    });
  }

  const [statcan, multiSource] = await Promise.all([
    persistStatCanDailyReleaseEvents(),
    persistMultiSourceReleaseEvents(),
  ]);
  if (!statcan.persisted || !multiSource.persisted) {
    throw new Error("Production bootstrap fetched releases but did not persist them.");
  }
  const [releaseEvents, successfulRuns, fallbackValues] = await Promise.all([
    prisma.releaseEvent.count(),
    prisma.dataRefreshRun.count({ where: { status: "SUCCESS" } }),
    prisma.timeSeriesValue.count({ where: { dataStatus: "FALLBACK" } }),
  ]);
  if (releaseEvents === 0 || successfulRuns < 2) {
    throw new Error("Production bootstrap did not create the expected release history and refresh audit records.");
  }
  if (fallbackValues > 0) {
    throw new Error("Production bootstrap found fallback time-series values. Remove them before launch.");
  }
  console.log(JSON.stringify({
    sourceDatasets: sourceDatasets.length,
    statcanRows: statcan.result.rowsFetched,
    statcanRowsChanged: statcan.result.rowsChanged,
    multiSourceRows: multiSource.result.rowsFetched,
    multiSourceRowsChanged: multiSource.result.rowsChanged,
    releaseEvents,
    successfulRuns,
    fallbackValues,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
