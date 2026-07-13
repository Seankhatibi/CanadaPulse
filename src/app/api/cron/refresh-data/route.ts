import { persistMultiSourceReleaseEvents, persistStatCanDailyReleaseEvents } from "@/lib/etl/importers";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";
import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      statcanWds: "live through Daily article tables, companion Tables pages and compact WDS metadata/series extraction",
      cmhc: "live quarterly housing starts import connected; rental/completions/mortgage datasets remain separate detailed imports",
      bankOfCanada: "live Valet observations plus Bank of Canada report monitor connected",
      openGovernmentIrcc: "live CKAN metadata monitor connected; detailed PR/TFW/student/refugee resource import next",
      cihi: { status: cihi.status, period: cihi.period, metrics: cihi.metrics.length, sourceUrl: cihi.sourceUrl },
      energy: "CER/NRCan source linked in Release Hub",
      pbo: "PBO reports source linked in Release Hub",
    },
  });
}
