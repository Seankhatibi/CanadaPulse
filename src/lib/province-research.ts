import { provinces, provinceSymbols } from "@/lib/province-directory";
import { getMultiSourceReleaseHub, hasStructuredMetrics } from "@/lib/release-hub";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";
import type { NormalizedRelease } from "@/lib/release-hub";
import { rankComparableProvinceValues } from "@/lib/province-values";

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

type ProvinceRow = NormalizedRelease["provinceBreakdown"][number];

export function buildProvincePeerRows(rows: ProvinceRow[], selectedProvince: string) {
  const comparableRows = rankComparableProvinceValues(rows);
  const selectedRank = comparableRows.findIndex((row) => row.province === selectedProvince);
  const selectedRow = comparableRows[selectedRank];
  const peerRows = [
    ...comparableRows.slice(0, 4),
    ...(selectedRank >= 4 ? comparableRows.filter((row) => row.province === selectedProvince) : []),
  ].filter((row, index, peers) => peers.findIndex((candidate) => candidate.province === row.province) === index);
  const maxValue = Math.max(...peerRows.map((row) => Math.abs(row.comparableValue)), 1);

  return {
    rank: selectedRow?.comparableRank ?? 0,
    peerCount: comparableRows.length,
    peerRows: peerRows.map((row) => ({
      ...row,
      width: Math.max(8, Math.abs(row.comparableValue) / maxValue * 100),
    })),
  };
}

export async function getProvinceResearchBrief(slug: string, area: ProvinceResearchArea) {
  const province = provinces.find((item) => item.slug === slug);
  if (!province) return null;

  const hub = await getMultiSourceReleaseHub();
  const releases = hub.todayQueue.filter((release) =>
    release.affectedAreas.some((affectedArea) => areaFilters[area].includes(affectedArea)),
  );
  const hasVerifiedProvinceRows = (source: string) => ["statcan", "cmhc", "open-government-ircc"].includes(source);
  const provincialFacts = releases.flatMap((release) => {
    if (!hasVerifiedProvinceRows(release.source) || release.status !== "live") return [];
    const row = release.provinceBreakdown.find((item) => item.province === province.name);
    if (!row) return [];

    const peers = buildProvincePeerRows(release.provinceBreakdown, province.name);
    if (!peers.rank) return [];

    return [{
      ...row,
      release,
      ...peers,
    }];
  }).sort((left, right) =>
    right.release.releaseDate.localeCompare(left.release.releaseDate)
    || right.release.importanceScore - left.release.importanceScore,
  );
  const lead = releases.find((release) => hasVerifiedProvinceRows(release.source) && release.status === "live" && hasStructuredMetrics(release))
    ?? releases.find((release) => release.status === "live" && hasStructuredMetrics(release))
    ?? null;

  return {
    province,
    symbol: provinceSymbols[slug],
    area,
    areaLabel: areaLabels[area],
    provincialFacts,
    liveSources: [...new Set(provincialFacts.map((fact) => fact.release.publisher))],
    newestProvincialPeriod: provincialFacts[0]?.release.referencePeriod ?? null,
    lead: lead ? { release: lead, intelligence: buildReleaseIntelligence(lead) } : null,
    releases: releases.slice(0, 6),
  };
}
