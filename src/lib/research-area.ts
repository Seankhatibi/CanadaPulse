import { getMultiSourceReleaseHub, type NormalizedRelease } from "@/lib/release-hub";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";

export type ResearchAreaSlug = "economy" | "housing" | "population" | "youth" | "government" | "trade" | "energy";

const areaConfig = {
  economy: {
    eyebrow: "Canadian economy",
    title: "The economic releases shaping Canada right now",
    description: "Jobs, inflation, rates, growth, trade and household pressure, translated from official releases into comparable facts.",
    areas: ["labour", "inflation", "rates", "trade", "fiscal", "economy", "gdp", "productivity"],
    questions: [
      ["What changed in the latest jobs report?", "/pulse-release/statcan/labour-force-survey-june-2026"],
      ["How are rates reaching households?", "/pulse-release/bank-of-canada/bank-of-canada-rate-watch"],
      ["Which province offers the stronger outcome?", "/compare"],
    ],
  },
  housing: {
    eyebrow: "Housing and affordability",
    title: "Homes, supply and mortgage pressure without the guesswork",
    description: "CMHC construction data, StatCan building releases and Bank of Canada rate signals shown with their actual period and source coverage.",
    areas: ["housing", "rates"],
    questions: [
      ["What is happening to housing supply?", "/pulse-release/cmhc/cmhc-housing-watch"],
      ["How are rates changing mortgage pressure?", "/pulse-release/bank-of-canada/bank-of-canada-rate-watch"],
      ["What does the same income buy by province?", "/compare"],
    ],
  },
  population: {
    eyebrow: "Population and capacity",
    title: "Is population growth outrunning homes, jobs and services?",
    description: "Official population and immigration releases placed beside housing and labour evidence, with neutral definitions and visible source limitations.",
    areas: ["population", "immigration", "housing", "labour"],
    questions: [
      ["What official immigration datasets changed?", "/pulse-release/open-government-ircc/ircc-open-data-population-pressure"],
      ["Is labour demand absorbing growth?", "/pulse-release/statcan/labour-force-survey-june-2026"],
      ["How does housing supply compare?", "/housing"],
    ],
  },
  youth: {
    eyebrow: "Youth economic future",
    title: "Can young Canadians still build a life here?",
    description: "The latest labour, housing, inflation and rate evidence most relevant to younger workers, renters and first-time buyers.",
    areas: ["labour", "housing", "inflation", "rates"],
    questions: [
      ["Are young workers gaining ground?", "/pulse-release/statcan/labour-force-survey-june-2026"],
      ["Where does a salary go further?", "/compare"],
      ["Where does your tax money go?", "/tax-dollar"],
    ],
  },
  government: {
    eyebrow: "Government money",
    title: "Follow the public money, not the talking points",
    description: "Fiscal reports, debt signals, transfers and public-finance evidence, with source status visible wherever detailed tables are not yet loaded.",
    areas: ["fiscal", "rates"],
    questions: [
      ["What changed in the federal books?", "/pulse-release/finance-canada/finance-canada-fiscal-monitor"],
      ["What does your income generate in tax?", "/tax-dollar"],
      ["What is the Bank of Canada seeing in financial stability?", "/pulse-release/bank-of-canada/financial-stability-report-2026"],
    ],
  },
  trade: {
    eyebrow: "Trade and industry",
    title: "What Canada sells, where it goes and what is changing",
    description: "Official trade, business-outlook and energy-export releases organized around the industries and provinces most exposed to each shift.",
    areas: ["trade", "energy"],
    questions: [
      ["What are businesses expecting next?", "/pulse-release/bank-of-canada/business-outlook-survey-second-quarter-of-2026"],
      ["What changed in Canadian energy exports?", "/energy"],
      ["Compare provincial economic outcomes", "/compare"],
    ],
  },
  energy: {
    eyebrow: "Energy and resources",
    title: "The production, pipeline and price signals powering Canada",
    description: "CER, NRCan, StatCan and Bank of Canada evidence on energy production, exports, prices and the pressure transmitted to households.",
    areas: ["energy", "trade", "inflation"],
    questions: [
      ["What changed in pipeline utilization?", "/pulse-release/cer-nrcan/canada-energy-regulator-nrcan-market-snapshot-oil-pipeline-throughputs-remained-high-in-20"],
      ["How is energy affecting inflation expectations?", "/pulse-release/bank-of-canada/canadian-survey-of-consumer-expectations-second-quarter-of-2026"],
      ["What is the wider trade impact?", "/trade"],
    ],
  },
} as const;

const preferredLead: Record<ResearchAreaSlug, (release: NormalizedRelease) => boolean> = {
  economy: (release) => /labour force survey/i.test(release.title),
  housing: (release) => release.source === "cmhc",
  population: (release) => release.source === "open-government-ircc",
  youth: (release) => /labour force survey/i.test(release.title),
  government: (release) => release.source === "finance-canada",
  trade: (release) => /business outlook survey/i.test(release.title),
  energy: (release) => release.source === "cer-nrcan",
};

function releaseTimestamp(release: NormalizedRelease) {
  const value = release.releaseDate.length === 7 ? `${release.releaseDate}-01T12:00:00Z` : `${release.releaseDate.slice(0, 10)}T12:00:00Z`;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export async function getResearchAreaBrief(slug: ResearchAreaSlug) {
  const config = areaConfig[slug];
  const hub = await getMultiSourceReleaseHub();
  const releases = hub.todayQueue
    .filter((release) => release.affectedAreas.some((area) => config.areas.includes(area as never)))
    .sort((a, b) => {
      const statusDifference = Number(b.status === "live") - Number(a.status === "live");
      return statusDifference || releaseTimestamp(b) - releaseTimestamp(a) || b.importanceScore - a.importanceScore;
    });
  const hasValues = (release: NormalizedRelease) => release.status === "live" && release.chartPayloads.some((chart) => chart.points.length);
  const lead = releases.find((release) => hasValues(release) && preferredLead[slug](release)) ?? releases.find(hasValues) ?? releases[0] ?? null;

  return {
    ...config,
    slug,
    lead: lead ? { release: lead, intelligence: buildReleaseIntelligence(lead) } : null,
    releases: releases.slice(0, 8),
    sourceStatuses: hub.sourceStatuses.filter((source) =>
      releases.some((release) => release.publisher.includes(source.source) || source.source.includes(release.publisher)),
    ),
  };
}
