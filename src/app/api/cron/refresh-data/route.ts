import { persistMultiSourceReleaseEvents, persistStatCanDailyReleaseEvents } from "@/lib/etl/importers";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const statcanDaily = await persistStatCanDailyReleaseEvents();
  const multiSourceReleaseHub = await persistMultiSourceReleaseEvents();

  return Response.json({
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    jobs: {
      statcanDaily,
      multiSourceReleaseHub,
      statcanWds: "live through Daily selected-table extraction where releases expose source tables; WDS adapter ready for mapped tables",
      cmhc: "live housing starts table import connected; rental/completions/mortgage datasets remain next detailed imports",
      bankOfCanada: "live Valet observations plus Bank of Canada report monitor connected",
      openGovernmentIrcc: "live CKAN metadata monitor connected; detailed PR/TFW/student/refugee resource import next",
      cihi: "source-linked; XLSX import implementation pending",
      energy: "CER/NRCan source linked in Release Hub",
      pbo: "PBO reports source linked in Release Hub",
    },
  });
}
