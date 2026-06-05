import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";

const statCanWdsRestBase = "https://www150.statcan.gc.ca/t1/wds/rest";

export type StatCanRefreshResult = {
  rowsFetched: number;
  rowsChanged: number;
  metadata: Record<string, unknown>;
};

export async function fetchStatCanFullTableDownloadCsv(productId: string) {
  const response = await fetch(`${statCanWdsRestBase}/getFullTableDownloadCSV/${productId}/en`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`StatCan WDS CSV URL request failed for ${productId}: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function fetchStatCanLatestVectorData(vectorIds: string[], periods = 12) {
  const response = await fetch(`${statCanWdsRestBase}/getDataFromVectorsAndLatestNPeriods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vectorIds.map((vectorId) => ({ vectorId: Number(vectorId), latestN: periods }))),
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`StatCan WDS vector request failed: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function refreshStatCanDailyReleaseFacts(): Promise<StatCanRefreshResult & { entries: Awaited<ReturnType<typeof fetchStatCanDailyEntries>> }> {
  const entries = rankDailyEntries(await fetchStatCanDailyEntries());

  return {
    rowsFetched: entries.length,
    rowsChanged: entries.length,
    entries,
    metadata: {
      adapter: "StatCanAdapter",
      mode: "daily-release-feed",
      topRelease: entries[0]?.title ?? null,
    },
  };
}
