import { getLifeSeries } from "@/lib/life-series";
export const dynamic = "force-dynamic";
export async function GET() { const series = await getLifeSeries(); const loaded = series.filter((item) => item.status === "loaded").length; return Response.json({ checkedAt: new Date().toISOString(), loaded, total: series.length, warnings: series.filter((item) => item.status === "unavailable").map((item) => `${item.title}: official series unavailable`), series }, { status: loaded ? 200 : 503 }); }
