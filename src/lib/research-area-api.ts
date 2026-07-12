import { getResearchAreaBrief, type ResearchAreaSlug } from "@/lib/research-area";

export async function getResearchAreaApiPayload(slug: ResearchAreaSlug) {
  const brief = await getResearchAreaBrief(slug);
  return {
    status: "live",
    area: slug,
    title: brief.title,
    description: brief.description,
    generatedAt: new Date().toISOString(),
    leadReleaseId: brief.lead?.release.id ?? null,
    releases: brief.releases.map((release) => ({
      id: release.id,
      title: release.title,
      publisher: release.publisher,
      releaseDate: release.releaseDate,
      referencePeriod: release.referencePeriod,
      status: release.status,
      affectedAreas: release.affectedAreas,
      plainEnglishSummary: release.plainEnglishSummary,
      chartPayloads: release.chartPayloads,
      provinceBreakdown: ["statcan", "cmhc"].includes(release.source) ? release.provinceBreakdown : [],
      href: release.href,
      sourceUrl: release.sourceUrl,
    })),
    sourceStatuses: brief.sourceStatuses,
  };
}
