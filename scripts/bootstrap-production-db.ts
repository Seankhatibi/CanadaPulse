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
  console.log(JSON.stringify({
    sourceDatasets: sourceDatasets.length,
    statcanRows: statcan.result.rowsFetched,
    multiSourceRows: multiSource.result.rowsFetched,
  }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
