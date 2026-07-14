import { persistMultiSourceReleaseEvents, persistStatCanDailyReleaseEvents } from "@/lib/etl/importers";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";
  const cronSecret = process.env.CRON_SECRET;

  if (isProduction && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = new Date().toISOString();
  revalidateTag("canada-pulse-release-hub", { expire: 0 });
  const [statcanDaily, multiSourceReleaseHub, cihi] = await Promise.all([
    persistStatCanDailyReleaseEvents(),
    persistMultiSourceReleaseEvents(),
    fetchCihiHealthSnapshot(),
  ]);

  return Response.json({
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    jobs: {
      statcanDaily,
      multiSourceReleaseHub,
      persistence: {
        configured: Boolean(process.env.DATABASE_URL),
        statcanPersisted: statcanDaily.persisted,
        multiSourcePersisted: multiSourceReleaseHub.persisted,
      },
      statcanWds: "live through Daily article tables, companion Tables pages and compact WDS metadata/series extraction",
      cmhc: "live quarterly construction starts plus annual Rental Market Survey rent, vacancy and turnover imports; current completions/mortgage datasets remain separate",
      bankOfCanada: "live Valet observations plus Bank of Canada report monitor connected",
      financeCanada: "live Fiscal Monitor parser connected for revenue, expenses, deficit and public debt charges",
      openGovernmentIrcc: "live monthly PR, study permit, TFWP, IMP and asylum resource imports with provincial breakdowns",
      cihi: { status: cihi.status, period: cihi.period, metrics: cihi.metrics.length, sourceUrl: cihi.sourceUrl },
      energy: "CER/NRCan source linked in Release Hub",
      pbo: "PBO reports source linked in Release Hub",
    },
  });
}
