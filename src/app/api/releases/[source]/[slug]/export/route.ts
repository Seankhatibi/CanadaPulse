import { findHubRelease } from "@/lib/release-hub";
import { buildReleaseExportPayload, releaseRowsToCsv } from "@/lib/release-export";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string; slug: string }> },
) {
  const { source, slug } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const release = await findHubRelease(source, slug, url.searchParams.get("date") ?? undefined, url.searchParams.get("url") ?? undefined);

  if (!release) return Response.json({ error: "Release not found" }, { status: 404 });

  const payload = buildReleaseExportPayload(release);
  const filename = `canada-pulse-${release.slug}.${format}`;
  const headers = {
    "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "X-Canada-Pulse-Source": release.publisher,
    "X-Canada-Pulse-Reference-Period": release.referencePeriod,
  };

  if (format === "json") {
    return Response.json(payload, { headers });
  }

  return new Response(releaseRowsToCsv(payload.rows), {
    headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
  });
}
