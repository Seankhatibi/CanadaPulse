import { persistMultiSourceReleaseEvents, persistStatCanDailyReleaseEvents } from "@/lib/etl/importers";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function refreshSummary(outcome: PromiseSettledResult<unknown>) {
  if (outcome.status === "rejected") {
    return { status: "failed" as const, persisted: false, error: errorMessage(outcome.reason) };
  }

  const wrapper = record(outcome.value);
  const result = record(wrapper.result);
  return {
    status: "success" as const,
    persisted: wrapper.persisted === true,
    rowsFetched: typeof result.rowsFetched === "number" ? result.rowsFetched : undefined,
    rowsChanged: typeof result.rowsChanged === "number" ? result.rowsChanged : undefined,
    sourceVersion: typeof result.sourceVersion === "string" ? result.sourceVersion : undefined,
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";
  const cronSecret = process.env.CRON_SECRET;

  if (isProduction && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = new Date().toISOString();
  [
    "canada-pulse-release-hub",
    "canada-pulse-statcan",
    "canada-pulse-cmhc",
    "canada-pulse-bank-of-canada",
    "canada-pulse-finance-canada",
    "canada-pulse-ircc",
    "canada-pulse-cihi",
    "canada-pulse-official-monitors",
    "canada-pulse-gaswizard",
  ].forEach((tag) => revalidateTag(tag, { expire: 0 }));
  const [statcanDaily, multiSourceReleaseHub, cihi] = await Promise.allSettled([
    persistStatCanDailyReleaseEvents(),
    persistMultiSourceReleaseEvents(),
    fetchCihiHealthSnapshot(),
  ]);
  const statcanSummary = refreshSummary(statcanDaily);
  const multiSourceSummary = refreshSummary(multiSourceReleaseHub);
  const coreSourcesReady = statcanDaily.status === "fulfilled" && multiSourceReleaseHub.status === "fulfilled";
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const persistenceReady = databaseConfigured && statcanSummary.persisted && multiSourceSummary.persisted;
  const warnings = [
    ...(!databaseConfigured ? ["Durable release history is not configured; official sources were checked and caches refreshed in live-fetch mode."] : []),
    ...(databaseConfigured && !persistenceReady ? ["The source checks ran, but durable release persistence did not complete."] : []),
    ...(cihi.status === "rejected" ? [`CIHI refresh failed: ${errorMessage(cihi.reason)}`] : []),
  ];

  return Response.json({
    ok: coreSourcesReady,
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: persistenceReady ? "source-refresh-and-durable-archive" : "source-refresh-live-fetch",
    archive: {
      configured: databaseConfigured,
      persisted: persistenceReady,
    },
    warnings,
    jobs: {
      statcanDaily: statcanSummary,
      multiSourceReleaseHub: multiSourceSummary,
      statcanWds: "live through Daily article tables, companion Tables pages and compact WDS metadata/series extraction",
      cmhc: "live quarterly construction starts plus annual Rental Market Survey rent, vacancy and turnover imports; current completions/mortgage datasets remain separate",
      bankOfCanada: "live Valet observations plus Bank of Canada report monitor connected",
      financeCanada: "live Fiscal Monitor parser connected for revenue, expenses, deficit and public debt charges",
      openGovernmentIrcc: "live monthly PR, study permit, TFWP, IMP and asylum resource imports with provincial breakdowns",
      cihi: cihi.status === "fulfilled"
        ? { status: cihi.value.status, period: cihi.value.period, metrics: cihi.value.metrics.length, sourceUrl: cihi.value.sourceUrl }
        : { status: "failed", error: errorMessage(cihi.reason) },
      energy: "CER/NRCan source linked in Release Hub",
      pbo: "PBO reports source linked in Release Hub",
    },
  }, { status: coreSourcesReady ? 200 : 503 });
}
