import { provinces, provinceSymbols } from "@/lib/province-directory";
import { getMultiSourceReleaseHub, hasStructuredMetrics } from "@/lib/release-hub";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";

export type ProvinceResearchArea = "overview" | "housing" | "population" | "government" | "trade" | "energy";

const areaFilters: Record<ProvinceResearchArea, string[]> = {
  overview: ["labour", "housing", "population", "immigration", "trade", "energy", "inflation", "rates", "fiscal"],
  housing: ["housing", "rates"],
  population: ["population", "immigration", "housing", "labour"],
  government: ["fiscal", "rates"],
  trade: ["trade", "energy"],
  energy: ["energy", "trade", "inflation"],
};

const areaLabels: Record<ProvinceResearchArea, string> = {
  overview: "economic pulse",
  housing: "housing and affordability",
  population: "population and capacity",
  government: "government money",
  trade: "trade and industry",
  energy: "energy and resources",
};

export async function getProvinceResearchBrief(slug: string, area: ProvinceResearchArea) {
  const province = provinces.find((item) => item.slug === slug);
  if (!province) return null;

  const hub = await getMultiSourceReleaseHub();
  const releases = hub.todayQueue.filter((release) =>
    release.affectedAreas.some((affectedArea) => areaFilters[area].includes(affectedArea)),
  );
  const hasVerifiedProvinceRows = (source: string) => ["statcan", "cmhc", "open-government-ircc"].includes(source);
  const provincialFacts = releases.flatMap((release) => {
    if (!hasVerifiedProvinceRows(release.source)) return [];
    const row = release.provinceBreakdown.find((item) => item.province === province.name);
    return row ? [{ ...row, release }] : [];
  });
  const lead = releases.find((release) => hasVerifiedProvinceRows(release.source) && release.status === "live" && hasStructuredMetrics(release))
    ?? releases.find((release) => release.status === "live" && hasStructuredMetrics(release))
    ?? null;

  return {
    province,
    symbol: provinceSymbols[slug],
    area,
    areaLabel: areaLabels[area],
    provincialFacts,
    lead: lead ? { release: lead, intelligence: buildReleaseIntelligence(lead) } : null,
    releases: releases.slice(0, 6),
  };
}
