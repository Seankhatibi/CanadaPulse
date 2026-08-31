import { getPrisma } from "../src/lib/prisma";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for production verification.");
  const prisma = getPrisma();
  const [sourceDatasets, releaseEvents, successfulRuns, failedRuns, fallbackValues, latestRelease, latestRun, latestSuccessfulRun] = await Promise.all([
    prisma.sourceDataset.count(),
    prisma.releaseEvent.count(),
    prisma.dataRefreshRun.count({ where: { status: "SUCCESS" } }),
    prisma.dataRefreshRun.count({ where: { status: "FAILED" } }),
    prisma.timeSeriesValue.count({ where: { dataStatus: "FALLBACK" } }),
    prisma.releaseEvent.findFirst({ orderBy: { releaseDate: "desc" } }),
    prisma.dataRefreshRun.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.dataRefreshRun.findFirst({ where: { status: "SUCCESS" }, orderBy: { finishedAt: "desc" } }),
  ]);

  const failures: string[] = [];
  if (sourceDatasets === 0) failures.push("No source datasets are registered.");
  if (releaseEvents === 0) failures.push("No release events are persisted.");
  if (successfulRuns === 0) failures.push("No successful refresh run is recorded.");
  if (fallbackValues > 0) failures.push(`${fallbackValues} fallback time-series values exist in production.`);
  if (!latestRelease?.sourceUrl || !latestRelease.publisher) failures.push("Latest release is missing its official source trail.");
  if (!latestSuccessfulRun?.finishedAt || Date.now() - latestSuccessfulRun.finishedAt.getTime() > 96 * 60 * 60 * 1_000) {
    failures.push("No successful refresh run has completed in the last 96 hours.");
  }

  const result = {
    ok: failures.length === 0,
    checkedAt: new Date().toISOString(),
    sourceDatasets,
    releaseEvents,
    successfulRuns,
    failedRuns,
    fallbackValues,
    latestRelease: latestRelease ? {
      title: latestRelease.title,
      publisher: latestRelease.publisher,
      releaseDate: latestRelease.releaseDate,
      status: latestRelease.status,
      metricCount: latestRelease.metricCount,
    } : null,
    latestRun: latestRun ? {
      jobName: latestRun.jobName,
      status: latestRun.status,
      startedAt: latestRun.startedAt,
      finishedAt: latestRun.finishedAt,
      rowsFetched: latestRun.rowsFetched,
      rowsChanged: latestRun.rowsChanged,
    } : null,
    failures,
  };
  console.log(JSON.stringify(result, null, 2));
  if (failures.length) throw new Error(failures.join(" "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
