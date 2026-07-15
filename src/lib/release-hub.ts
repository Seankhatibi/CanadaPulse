import { unstable_cache } from "next/cache";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";
import { fetchStatCanCpiSnapshot, type CpiChange } from "@/lib/statcan-cpi";
import { fetchCmhcHousingConstructionData } from "@/lib/cmhc-housing";
import { fetchCmhcRentalSnapshot } from "@/lib/cmhc-rental";
import { fetchFinanceCanadaFiscalSnapshot } from "@/lib/finance-canada-fiscal";
import { fetchIrccImmigrationSnapshot } from "@/lib/ircc-immigration";
import { fetchBankOfCanadaReportReleases } from "@/lib/bank-of-canada-reports";
import { fetchOfficialReportMonitors, type OfficialReportMonitor } from "@/lib/official-source-monitors";
import {
  fetchStatCanDailyEntries,
  fetchStatCanDailyEntryFromUrl,
  buildReleaseExplainer,
  getEntriesForReleaseDate,
  getLatestDailyReleaseDate,
  rankDailyEntries,
  type StatCanDailyEntry,
} from "@/lib/statcan-daily";
import { findPersistedRelease } from "@/lib/persisted-releases";

export type ReleaseArea =
  | "economy"
  | "housing"
  | "rates"
  | "inflation"
  | "labour"
  | "immigration"
  | "fiscal"
  | "energy"
  | "trade"
  | "population"
  | "other";

export type ReleaseFactStatus = "live" | "source_linked" | "summary_only" | "error";

export type ReleaseChartPayload = {
  title: string;
  kind: "bar" | "metric-strip" | "province-rank" | "qualitative";
  points: Array<{
    label: string;
    value: number;
    display: string;
    direction: "up" | "down" | "neutral";
    plainEnglish: string;
    previous?: number | null;
    previousDisplay?: string;
    change?: number | null;
    changeDisplay?: string;
    period?: string;
    changePeriod?: string;
  }>;
};

export type NormalizedRelease = {
  id: string;
  slug: string;
  title: string;
  source: string;
  publisher: string;
  sourceUrl: string;
  href: string;
  releaseType: string;
  releaseDate: string;
  referencePeriod: string;
  geographyLevel: "federal" | "province" | "city" | "mixed";
  affectedAreas: ReleaseArea[];
  headlineFacts: string[];
  provinceBreakdown: Array<{ province: string; value: string; note: string; score: number }>;
  chartPayloads: ReleaseChartPayload[];
  sourceLinks: Array<{ label: string; url: string }>;
  importanceScore: number;
  youthImpactScore: number;
  housingImpactScore: number;
  promoted: boolean;
  status: ReleaseFactStatus;
  plainEnglishSummary: string;
  socialSummary: string;
};

export function countStructuredMetrics(release: NormalizedRelease) {
  return release.chartPayloads
    .filter((chart) => chart.kind !== "qualitative")
    .reduce((total, chart) => total + chart.points.length, 0);
}

export function hasStructuredMetrics(release: NormalizedRelease) {
  return countStructuredMetrics(release) > 0;
}

export function hasQualitativeAnalysis(release: NormalizedRelease) {
  return release.chartPayloads.some((chart) => chart.kind === "qualitative" && chart.points.length > 0);
}

export type ReleaseHubPayload = {
  generatedAt: string;
  promotedRelease: NormalizedRelease | null;
  housingWatch: NormalizedRelease;
  todayQueue: NormalizedRelease[];
  provinceImpact: Array<{ province: string; score: number; label: string; source: string }>;
  sourceStatuses: Array<{ source: string; status: ReleaseFactStatus; note: string }>;
};

const canadaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function canadaDate(date = new Date()) {
  return canadaDateFormatter.format(date);
}

export function slugifyReleaseTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

const slugify = slugifyReleaseTitle;

function sourceHref(source: string, slug: string) {
  return `/pulse-release/${source}/${slug}`;
}

function formatProvinceDelta(label: string, value: number) {
  const absolute = Math.abs(value);
  if (/rate|percent/i.test(label)) return `${absolute.toFixed(1)} points`;
  if (absolute >= 1_000_000_000) return `${(absolute / 1_000_000_000).toFixed(1)}B`;
  if (absolute >= 1_000_000) return `${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${(absolute / 1_000).toFixed(1)}k`;
  return absolute.toFixed(1);
}

function classifyStatCanAreas(entry: StatCanDailyEntry): ReleaseArea[] {
  const text = `${entry.title} ${entry.summary}`.toLowerCase();
  const areas = new Set<ReleaseArea>();

  if (/housing|rent|construction|building/.test(text)) areas.add("housing");
  if (/retail|wholesale|consumer demand|consumer spending|sales|manufacturing|gross domestic product|\bgdp\b|productivity/.test(text)) areas.add("economy");
  if (/price|inflation|consumer price|cpi/.test(text)) areas.add("inflation");
  if (/labour|employment|unemployment|wage|productivity|job vacanc/.test(text)) areas.add("labour");
  if (/population|immigration|temporary resident|student|refugee/.test(text)) areas.add("population");
  if (/trade|export|import/.test(text)) areas.add("trade");
  if (/energy|oil|gas|electricity|natural resources/.test(text)) areas.add("energy");

  return areas.size ? [...areas] : ["other"];
}

function isMajorStatCanTitle(title: string) {
  return [
    /^labour force survey\b/i,
    /^consumer price index\b/i,
    /^gross domestic product by industry\b/i,
    /^gross domestic product, income and expenditure\b/i,
    /^retail trade\b/i,
    /^wholesale trade\b/i,
    /^canadian international merchandise trade\b/i,
    /^labour productivity\b/i,
    /^population estimates\b/i,
    /^building permits\b/i,
    /^job vacancies\b/i,
  ].some((pattern) => pattern.test(title));
}

function scoreRelease(areas: ReleaseArea[], text: string) {
  const lower = text.toLowerCase();
  let score = 20;
  if (areas.includes("housing")) score += 35;
  if (areas.includes("economy")) score += 28;
  if (areas.includes("rates")) score += 32;
  if (areas.includes("inflation")) score += 30;
  if (areas.includes("immigration")) score += 28;
  if (areas.includes("fiscal")) score += 24;
  if (areas.includes("labour")) score += 20;
  if (areas.includes("energy")) score += 18;
  if (/gdp|productivity|mortgage|rent|starts|deficit|debt|temporary resident/.test(lower)) score += 14;
  if (/retail trade|retail sales|wholesale trade|consumer spending|consumer demand|manufacturing sales/.test(lower)) score += 28;
  if (/labour force survey/.test(lower)) score += 34;
  if (isMajorStatCanTitle(text)) score += 20;
  if (areas.includes("trade")) score += 18;
  if (areas.includes("population")) score += 18;
  return Math.min(score, 100);
}

async function fetchStatCanReleaseDataReliably(entry: StatCanDailyEntry) {
  let latest: Awaited<ReturnType<typeof fetchStatCanReleaseData>> | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      latest = await fetchStatCanReleaseData(entry);
      if (latest.sourceStatus === "table_data_loaded" || (!latest.tableLinks.length && !latest.tableIds.length)) return latest;
    } catch {
      latest = null;
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return latest;
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function normalizeStatCanDailyRelease(entry: StatCanDailyEntry, promotedHref?: string): Promise<NormalizedRelease> {
  const releaseData = await fetchStatCanReleaseDataReliably(entry);
  const summarySignals = buildReleaseExplainer(entry).signals.filter((signal) => signal.label !== "Release detected");
  const releaseSignals = releaseData?.signals.length ? releaseData.signals : summarySignals;
  const areas = classifyStatCanAreas(entry);
  const slug = slugify(entry.title);
  const chartPayloads: ReleaseChartPayload[] = releaseSignals.length
    ? [
        {
          title: releaseData?.signals.length ? "Official table breakdown" : "Official release summary",
          kind: "metric-strip",
          points: releaseSignals.slice(0, 8).map((signal) => ({
            label: signal.label,
            value: signal.value,
            display: signal.display,
            direction: signal.direction,
            plainEnglish: signal.explanation,
            previous: signal.previous,
            previousDisplay: signal.previousDisplay,
            change: signal.change,
            changeDisplay: signal.changeDisplay,
            period: signal.period,
            changePeriod: signal.changePeriod,
          })),
        },
      ]
    : [];
  const provinceTable = releaseData?.tables.find((table) => /by province/i.test(table.title));
  const provinceRows = provinceTable?.rows.filter((row) => row.group && row.group !== "Canada" && row.latest !== null) ?? [];
  const provincePreviousPeriod = provinceTable?.previousPeriod ?? "the previous period";
  const preferredProvinceLabel = /labour force survey/i.test(entry.title)
    ? provinceRows.find((row) => /unemployment rate/i.test(row.label))?.label
    : [...new Map(provinceRows.map((row) => [row.label, provinceRows.filter((candidate) => candidate.label === row.label).length])).entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0];
  const provinceBreakdown = provinceRows
    .filter((row) => row.label === preferredProvinceLabel)
    .map((row) => ({
      province: row.group as string,
      value: row.display ?? (/rate/i.test(row.label) ? `${row.latest?.toFixed(1)}%` : row.latest?.toLocaleString("en-CA") ?? "n/a"),
      note: row.change === null
        ? `No change is available from ${provincePreviousPeriod}.`
        : `${row.change > 0 ? "up" : row.change < 0 ? "down" : "unchanged"} ${formatProvinceDelta(row.label, row.change)} from ${provincePreviousPeriod}.`,
      score: Math.min(100, Math.round(Math.abs(row.change ?? 0) * 10 + 25)),
    }));
  const isSameDayRelease = entry.published.slice(0, 10) === canadaDate();
  const baseScore = scoreRelease(areas, `${entry.title} ${entry.summary}`);
  const importanceScore = Math.min(100, baseScore + (isSameDayRelease ? 28 : 0));

  return {
    id: `statcan-${slug}`,
    slug,
    title: entry.title,
    source: "statcan",
    publisher: "Statistics Canada",
    sourceUrl: entry.href,
    href: promotedHref ?? sourceHref("statcan", slug),
    releaseType: "official-daily-release",
    releaseDate: entry.published.slice(0, 10),
    referencePeriod: releaseData?.tables[0]?.latestPeriod ?? entry.published,
    geographyLevel: "mixed",
    affectedAreas: areas,
    headlineFacts: [
      entry.summary || "Official Daily release detected.",
      ...releaseSignals.slice(0, 4).map((signal) => `${signal.label}: ${signal.display}${signal.changeDisplay ? ` (${signal.changeDisplay})` : ""}`),
    ],
    provinceBreakdown,
    chartPayloads,
    sourceLinks: [
      { label: "Official Daily release", url: entry.href },
      ...[...new Map((releaseData?.wdsDownloads ?? [])
        .filter((download) => download.downloadUrl)
        .map((download) => [download.productId, download])).values()]
        .map((download) => ({ label: `Official table ${download.productId}`, url: download.downloadUrl as string })),
    ],
    importanceScore,
    youthImpactScore: areas.some((area) => ["housing", "labour", "inflation"].includes(area)) ? 72 : 42,
    housingImpactScore: areas.includes("housing") ? 88 : 35,
    promoted: importanceScore >= 50,
    status: releaseData?.sourceStatus === "table_data_loaded" ? "live" : "summary_only",
    plainEnglishSummary: entry.summary || "Canada Pulse detected this official release and is preparing the source-backed breakdown.",
    socialSummary: `${entry.title}: ${entry.summary}`.slice(0, 220),
  };
}

async function fetchValetObservation(series: string) {
  const response = await fetch(`https://www.bankofcanada.ca/valet/observations/${series}/json?recent=1`, {
    next: { revalidate: 60 * 60, tags: ["canada-pulse-bank-of-canada"] },
  });

  if (!response.ok) {
    throw new Error(`Bank of Canada Valet fetch failed for ${series}: ${response.status}`);
  }

  const json = (await response.json()) as {
    observations?: Array<Record<string, { v?: string } | string>>;
    seriesDetail?: Record<string, { label?: string; description?: string }>;
  };
  const latest = json.observations?.at(-1);

  return {
    series,
    label: json.seriesDetail?.[series]?.label ?? series,
    description: json.seriesDetail?.[series]?.description ?? series,
    date: typeof latest?.d === "string" ? latest.d : canadaDate(),
    value: Number((latest?.[series] as { v?: string } | undefined)?.v ?? 0),
  };
}

function cpiDirection(metric: CpiChange): "up" | "down" | "neutral" {
  return metric.momentumChangePctPoints === null || metric.momentumChangePctPoints === 0
    ? "neutral"
    : metric.momentumChangePctPoints > 0 ? "up" : "down";
}

function cpiPoint(metric: CpiChange) {
  const change = metric.momentumChangePctPoints;
  return {
    label: metric.product,
    value: metric.yearOverYearPct,
    display: `${metric.yearOverYearPct.toFixed(1)}%`,
    direction: cpiDirection(metric),
    plainEnglish: change === null
      ? `${metric.product} prices changed ${metric.yearOverYearPct.toFixed(1)}% from a year earlier.`
      : `${metric.product} inflation ${change > 0 ? "accelerated" : change < 0 ? "cooled" : "held steady"} ${Math.abs(change).toFixed(1)} points from the previous month's year-over-year rate.`,
    previous: metric.previousMonthYoYPct,
    previousDisplay: metric.previousMonthYoYPct === null ? undefined : `${metric.previousMonthYoYPct.toFixed(1)}%`,
    change,
    changeDisplay: change === null ? undefined : `${change > 0 ? "+" : ""}${change.toFixed(1)} pts`,
  };
}

async function getStatCanCpiWatch(): Promise<NormalizedRelease> {
  const data = await fetchStatCanCpiSnapshot();
  const slug = "consumer-price-index-watch";
  const rent = data.components.find((component) => component.product === "Rent");
  const gasoline = data.components.find((component) => component.product === "Gasoline");
  const highestHeadline = [...data.provinces].sort((a, b) => b.allItems.yearOverYearPct - a.allItems.yearOverYearPct)[0];
  const highestFood = [...data.provinces].sort((a, b) => b.food.yearOverYearPct - a.food.yearOverYearPct)[0];
  const provinceHeadline = [...data.provinces].sort((a, b) => b.allItems.yearOverYearPct - a.allItems.yearOverYearPct);
  const provinceFood = [...data.provinces].sort((a, b) => b.food.yearOverYearPct - a.food.yearOverYearPct);
  const components = [...data.components].sort((a, b) => b.yearOverYearPct - a.yearOverYearPct);

  return {
    id: "statcan-cpi-watch",
    slug,
    title: `Consumer Price Index, ${data.referencePeriod}`,
    source: "statcan",
    publisher: "Statistics Canada",
    sourceUrl: data.sourceUrl,
    href: sourceHref("statcan", slug),
    releaseType: "statcan-cpi-watch",
    releaseDate: data.releaseDate,
    referencePeriod: data.referencePeriod,
    geographyLevel: "province",
    affectedAreas: ["inflation", "housing", "energy"],
    headlineFacts: [
      `Headline inflation was ${data.canada.allItems.yearOverYearPct.toFixed(1)}% in ${data.referencePeriod}; food inflation was ${data.canada.food.yearOverYearPct.toFixed(1)}%.`,
      `${highestHeadline.province} had the highest provincial headline rate at ${highestHeadline.allItems.yearOverYearPct.toFixed(1)}%.`,
      `${highestFood.province} had the highest provincial food inflation at ${highestFood.food.yearOverYearPct.toFixed(1)}%.`,
      rent ? `Rent inflation was ${rent.yearOverYearPct.toFixed(1)}%.` : "",
      gasoline ? `Gasoline prices were ${gasoline.yearOverYearPct.toFixed(1)}% above a year earlier.` : "",
    ].filter(Boolean),
    provinceBreakdown: provinceHeadline.map((province) => ({
      province: province.province,
      value: `${province.allItems.yearOverYearPct.toFixed(1)}%`,
      note: `${province.food.yearOverYearPct.toFixed(1)}% food inflation; headline momentum ${province.allItems.momentumChangePctPoints === null ? "unavailable" : `${province.allItems.momentumChangePctPoints > 0 ? "+" : ""}${province.allItems.momentumChangePctPoints.toFixed(1)} points`}.`,
      score: Math.max(0, Math.min(100, Math.round(province.allItems.yearOverYearPct * 15))),
    })),
    chartPayloads: [
      {
        title: "Canada inflation at a glance",
        kind: "metric-strip",
        points: [data.canada.allItems, data.canada.food, rent, gasoline].filter((metric): metric is CpiChange => Boolean(metric)).map((metric) => ({
          ...cpiPoint(metric),
          period: data.referencePeriod,
          changePeriod: `change in year-over-year rate from the previous month`,
        })),
      },
      {
        title: "Headline inflation by province",
        kind: "province-rank",
        points: provinceHeadline.map((province) => ({ ...cpiPoint(province.allItems), label: province.province, period: data.referencePeriod })),
      },
      {
        title: "Food inflation by province",
        kind: "province-rank",
        points: provinceFood.map((province) => ({ ...cpiPoint(province.food), label: province.province, period: data.referencePeriod })),
      },
      {
        title: "What is getting more expensive fastest?",
        kind: "bar",
        points: components.map((component) => ({ ...cpiPoint(component), period: data.referencePeriod })),
      },
      {
        title: "Headline inflation over the past year",
        kind: "bar",
        points: data.history.map((period, index, history) => {
          const previous = history[index - 1]?.allItemsYoY;
          const change = previous === undefined ? null : Number((period.allItemsYoY - previous).toFixed(1));
          return {
            label: period.period,
            value: period.allItemsYoY,
            display: `${period.allItemsYoY.toFixed(1)}%`,
            direction: change === null || change === 0 ? "neutral" as const : change > 0 ? "up" as const : "down" as const,
            plainEnglish: `Food inflation was ${period.foodYoY.toFixed(1)}% in the same month.`,
            previous,
            previousDisplay: previous === undefined ? undefined : `${previous.toFixed(1)}%`,
            change,
            changeDisplay: change === null ? undefined : `${change > 0 ? "+" : ""}${change.toFixed(1)} pts`,
            period: period.period,
          };
        }),
      },
    ],
    sourceLinks: [{ label: `Statistics Canada table ${data.tableId}`, url: data.sourceUrl }],
    importanceScore: 99,
    youthImpactScore: 100,
    housingImpactScore: 94,
    promoted: true,
    status: "live",
    plainEnglishSummary: `Prices were ${data.canada.allItems.yearOverYearPct.toFixed(1)}% higher than a year earlier in ${data.referencePeriod}. Food rose ${data.canada.food.yearOverYearPct.toFixed(1)}%, and the province charts show where household pressure was strongest.`,
    socialSummary: `Canada CPI, ${data.referencePeriod}: headline ${data.canada.allItems.yearOverYearPct.toFixed(1)}%, food ${data.canada.food.yearOverYearPct.toFixed(1)}%. Highest provincial headline: ${highestHeadline.province} at ${highestHeadline.allItems.yearOverYearPct.toFixed(1)}%.`,
  };
}

async function getBankOfCanadaRelease(): Promise<NormalizedRelease> {
  const [policyRate, usdCad, fiveYearYield] = await Promise.all([
    fetchValetObservation("V39079"),
    fetchValetObservation("FXUSDCAD"),
    fetchValetObservation("BD.CDN.5YR.DQ.YLD"),
  ]);
  const releaseDate = [policyRate.date, usdCad.date, fiveYearYield.date].sort().at(-1) ?? canadaDate();
  const slug = "bank-of-canada-rate-watch";

  return {
    id: "bank-of-canada-valet-rate-watch",
    slug,
    title: "Mortgage pressure changed: Bank of Canada rate watch",
    source: "bank-of-canada",
    publisher: "Bank of Canada",
    sourceUrl: "https://www.bankofcanada.ca/valet/observations/V39079/json?recent=1",
    href: sourceHref("bank-of-canada", slug),
    releaseType: "valet-rate-observation",
    releaseDate,
    referencePeriod: releaseDate,
    geographyLevel: "federal",
    affectedAreas: ["rates", "housing"],
    headlineFacts: [
      `Target overnight rate: ${policyRate.value.toFixed(2)}% as of ${policyRate.date}.`,
      `USD/CAD: ${usdCad.value.toFixed(4)} as of ${usdCad.date}.`,
      `5-year Government of Canada benchmark yield: ${fiveYearYield.value.toFixed(2)}% as of ${fiveYearYield.date}.`,
      "Together these explain mortgage renewal pressure, import-price sensitivity, and financial stress.",
    ],
    provinceBreakdown: [
      { province: "Ontario", value: "High", note: "Large mortgage and rent exposure.", score: 86 },
      { province: "British Columbia", value: "High", note: "High home prices make rate moves hit harder.", score: 88 },
      { province: "Alberta", value: "Moderate", note: "Lower average home-price burden than Ontario/BC.", score: 64 },
    ],
    chartPayloads: [
      {
        title: "Rate pressure translation",
        kind: "metric-strip",
        points: [
          {
            label: "Policy rate",
            value: policyRate.value,
            display: `${policyRate.value.toFixed(2)}%`,
            direction: "neutral",
            plainEnglish: "This is the anchor rate markets use to price borrowing conditions.",
          },
          {
            label: "5-year yield",
            value: fiveYearYield.value,
            display: `${fiveYearYield.value.toFixed(2)}%`,
            direction: "neutral",
            plainEnglish: "The 5-year benchmark yield is a key signal for fixed-rate mortgage pricing.",
          },
          {
            label: "USD/CAD",
            value: usdCad.value,
            display: usdCad.value.toFixed(4),
            direction: "neutral",
            plainEnglish: "A weaker Canadian dollar can make imported goods and travel feel more expensive.",
          },
          {
            label: "Mortgage pressure",
            value: Math.min(100, policyRate.value * 28 + fiveYearYield.value * 10),
            display: "High",
            direction: "up",
            plainEnglish: "Higher borrowing costs flow into renewals, new mortgages, and landlord financing.",
          },
        ],
      },
    ],
    sourceLinks: [
      { label: "Policy rate series V39079", url: "https://www.bankofcanada.ca/valet/observations/V39079/json?recent=1" },
      { label: "USD/CAD series FXUSDCAD", url: "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1" },
      { label: "5-year yield series", url: "https://www.bankofcanada.ca/valet/observations/BD.CDN.5YR.DQ.YLD/json?recent=1" },
      { label: "Bank of Canada rate data", url: "https://www.bankofcanada.ca/valet/docs" },
    ],
    importanceScore: 86,
    youthImpactScore: 82,
    housingImpactScore: 90,
    promoted: true,
    status: "live",
    plainEnglishSummary:
      `Canada Pulse is watching Bank of Canada rate data because interest rates are one of the fastest ways financial stress shows up in housing, rent, debt, and the dollar. The policy rate is ${policyRate.value.toFixed(2)}%, the 5-year yield is ${fiveYearYield.value.toFixed(2)}%, and USD/CAD is ${usdCad.value.toFixed(4)}.`,
    socialSummary: `Bank of Canada watch: policy rate ${policyRate.value.toFixed(2)}%, 5-year yield ${fiveYearYield.value.toFixed(2)}%, USD/CAD ${usdCad.value.toFixed(4)}.`,
  };
}

async function getCmhcHousingWatch(): Promise<NormalizedRelease> {
  const data = await fetchCmhcHousingConstructionData();
  const slug = "cmhc-housing-watch";
  const changeDisplay =
    data.canadaChangePct === null
      ? "change pending"
      : `${data.canadaChangePct > 0 ? "+" : ""}${data.canadaChangePct}% vs ${data.previousPeriodLabel}`;

  return {
    id: "cmhc-housing-watch",
    slug,
    title: "Canada's latest official housing construction numbers",
    source: "cmhc",
    publisher: "CMHC",
    sourceUrl: data.sourceUrl,
    href: sourceHref("cmhc", slug),
    releaseType: "housing-release-monitor",
    releaseDate: data.releaseDate,
    referencePeriod: `Latest official quarter: ${data.latestPeriodLabel}`,
    geographyLevel: "mixed",
    affectedAreas: ["housing"],
    headlineFacts: [
      `Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} housing starts in ${data.latestPeriodLabel}.`,
      data.canadaCompletions === null
        ? "The connected starts table does not publish current completions; Canada Pulse does not infer or replace missing completions with zero."
        : `Canada recorded ${data.canadaCompletions.toLocaleString("en-CA")} completions in the same period.`,
      `National starts are ${changeDisplay}.`,
      `${data.unitMix[0]?.label ?? "Apartments/other"} accounted for ${data.unitMix[0]?.sharePct ?? 0}% of starts.`,
      "Starts are not completions: treat this as a supply pipeline signal, not homes ready to move into.",
    ],
    provinceBreakdown: data.provinces.map((province) => ({
      province: province.province,
      value: province.starts.toLocaleString("en-CA"),
      note:
        province.changePct === null
          ? `${province.sharePct}% of Canada's latest starts.`
          : `${province.sharePct}% of Canada's latest starts; ${province.changePct > 0 ? "up" : "down"} ${Math.abs(province.changePct)}% vs ${data.previousPeriodLabel}.`,
      score: Math.min(100, Math.round(province.sharePct * 4 + Math.max(0, province.changePct ?? 0))),
    })),
    chartPayloads: [
      {
        title: "Housing starts pipeline",
        kind: "bar",
        points: [
          {
            label: "Housing starts",
            value: data.canadaStarts,
            display: data.canadaStarts.toLocaleString("en-CA"),
            direction: "up",
            plainEnglish: "Starts show the construction pipeline: homes beginning construction, not move-in ready supply.",
          },
          ...(data.canadaChangePct === null
            ? []
            : [{
                label: "Starts change",
                value: data.canadaChangePct,
                display: `${data.canadaChangePct > 0 ? "+" : ""}${data.canadaChangePct}%`,
                direction: data.canadaChangePct > 0 ? "up" as const : data.canadaChangePct < 0 ? "down" as const : "neutral" as const,
                plainEnglish: `Housing starts changed ${Math.abs(data.canadaChangePct)}% from ${data.previousPeriodLabel}.`,
                change: data.canadaChangePct,
                changeDisplay: `${data.canadaChangePct > 0 ? "+" : ""}${data.canadaChangePct}%`,
                period: data.latestPeriodLabel,
                changePeriod: `${data.previousPeriodLabel} to ${data.latestPeriodLabel}`,
              }]),
        ],
      },
      {
        title: "Latest housing starts by province",
        kind: "province-rank",
        points: data.provinces.slice(0, 8).map((province) => ({
          label: province.province,
          value: province.starts,
          display: province.starts.toLocaleString("en-CA"),
          direction: province.changePct === null ? "neutral" : province.changePct >= 0 ? "up" : "down",
          plainEnglish: `${province.province} represented ${province.sharePct}% of Canada's housing starts in ${data.latestPeriodLabel}.`,
        })),
      },
      {
        title: "Canada starts by unit type",
        kind: "bar",
        points: data.unitMix.map((unit) => ({
          label: unit.label,
          value: unit.value,
          display: `${unit.sharePct}%`,
          direction: "neutral",
          plainEnglish: `${unit.value.toLocaleString("en-CA")} starts, or ${unit.sharePct}% of national starts.`,
        })),
      },
    ],
    sourceLinks: [
      { label: `Official table ${data.tableId}`, url: data.sourceUrl },
      { label: `CSV ZIP ${data.productId}`, url: data.downloadUrl },
      { label: "CMHC housing data", url: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data" },
      { label: "CMHC reports calendar", url: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/news-releases-reports-calendar" },
    ],
    importanceScore: 95,
    youthImpactScore: 96,
    housingImpactScore: 100,
    promoted: true,
    status: "live",
    plainEnglishSummary:
      `Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} housing starts in ${data.latestPeriodLabel}, ${changeDisplay}. Starts measure the construction pipeline, not move-in-ready supply. Current completions are not available in this connected table and are not estimated.`,
    socialSummary: `CMHC Housing Watch: Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} starts in ${data.latestPeriodLabel}, ${changeDisplay}.`,
  };
}

async function getCmhcRentalWatch(): Promise<NormalizedRelease> {
  const data = await fetchCmhcRentalSnapshot();
  const slug = "cmhc-rental-market-watch";
  const currency = (value: number) => `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-CA")}`;
  const signed = (value: number, suffix = "") => `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value).toFixed(1)}${suffix}`;
  const provinceRent = [...data.provinces].sort((a, b) => b.averageTwoBedroomRent - a.averageTwoBedroomRent);
  const provinceVacancy = [...data.provinces].sort((a, b) => a.vacancyRate - b.vacancyRate);
  const metroRent = [...data.metros].sort((a, b) => b.averageTwoBedroomRent - a.averageTwoBedroomRent);
  const metroVacancy = [...data.metros].sort((a, b) => a.vacancyRate - b.vacancyRate);
  const vacancySentence = data.canada.vacancyChange === 0
    ? `The vacancy rate held steady at ${data.canada.vacancyRate.toFixed(1)}%.`
    : `The vacancy rate ${data.canada.vacancyChange > 0 ? "rose" : "fell"} ${Math.abs(data.canada.vacancyChange).toFixed(1)} points to ${data.canada.vacancyRate.toFixed(1)}%.`;

  return {
    id: "cmhc-rental-market-watch",
    slug,
    title: `CMHC Rental Market Survey, ${data.referencePeriod}`,
    source: "cmhc",
    publisher: "CMHC",
    sourceUrl: data.sourceUrl,
    href: sourceHref("cmhc", slug),
    releaseType: "cmhc-rental-market",
    releaseDate: data.releaseDate,
    referencePeriod: data.referencePeriod,
    geographyLevel: "mixed",
    affectedAreas: ["housing", "inflation"],
    headlineFacts: [
      `The surveyed national average two-bedroom rent was ${currency(data.canada.averageTwoBedroomRent)}, ${currency(data.canada.rentChangeAmount)} above ${data.previousPeriod}.`,
      `Fixed-sample two-bedroom rent growth was ${data.canada.rentGrowthPct?.toFixed(1) ?? "not available"}%.`,
      vacancySentence,
      "This is CMHC's primary rental universe, not an asking-rent index and not every rental dwelling in Canada.",
    ],
    provinceBreakdown: provinceRent.map((province) => ({
      province: province.geography,
      value: currency(province.averageTwoBedroomRent),
      note: `${province.vacancyRate.toFixed(1)}% vacancy; ${province.rentGrowthPct === null ? "fixed-sample rent change suppressed or not significant" : `${province.rentGrowthPct.toFixed(1)}% fixed-sample rent growth`}.`,
      score: Math.min(100, Math.round(province.averageTwoBedroomRent / 25)),
    })),
    chartPayloads: [
      {
        title: "Canada rental-market headline",
        kind: "metric-strip",
        points: [
          {
            label: "Average two-bedroom rent",
            value: data.canada.averageTwoBedroomRent,
            display: currency(data.canada.averageTwoBedroomRent),
            direction: data.canada.rentChangeAmount > 0 ? "up" : data.canada.rentChangeAmount < 0 ? "down" : "neutral",
            plainEnglish: `${currency(data.canada.averageTwoBedroomRent)} across surveyed new and existing structures, ${data.canada.rentChangeAmount >= 0 ? "up" : "down"} ${currency(Math.abs(data.canada.rentChangeAmount))} from ${data.previousPeriod}.`,
            previous: data.canada.previousAverageTwoBedroomRent,
            previousDisplay: currency(data.canada.previousAverageTwoBedroomRent),
            change: data.canada.rentChangeAmount,
            changeDisplay: `${data.canada.rentChangeAmount > 0 ? "+" : ""}${currency(data.canada.rentChangeAmount)}`,
            period: data.referencePeriod,
            changePeriod: `${data.previousPeriod} to ${data.referencePeriod}`,
          },
          {
            label: "Fixed-sample rent growth",
            value: data.canada.rentGrowthPct ?? 0,
            display: data.canada.rentGrowthPct === null ? "Suppressed" : `${data.canada.rentGrowthPct.toFixed(1)}%`,
            direction: data.canada.rentGrowthPct === null || data.canada.rentGrowthPct === 0 ? "neutral" : data.canada.rentGrowthPct > 0 ? "up" : "down",
            plainEnglish: "Fixed-sample growth follows existing structures and is more comparable year to year than the change in the raw average.",
            period: data.referencePeriod,
          },
          {
            label: "Rental vacancy rate",
            value: data.canada.vacancyRate,
            display: `${data.canada.vacancyRate.toFixed(1)}%`,
            direction: data.canada.vacancyChange > 0 ? "up" : data.canada.vacancyChange < 0 ? "down" : "neutral",
            plainEnglish: `Vacancy increased ${signed(data.canada.vacancyChange, " points")} from ${data.previousPeriod}.`,
            previous: data.canada.previousVacancyRate,
            previousDisplay: `${data.canada.previousVacancyRate.toFixed(1)}%`,
            change: data.canada.vacancyChange,
            changeDisplay: signed(data.canada.vacancyChange, " pts"),
            period: data.referencePeriod,
            changePeriod: `${data.previousPeriod} to ${data.referencePeriod}`,
          },
          {
            label: "Turnover rate",
            value: data.canada.turnoverRate ?? 0,
            display: data.canada.turnoverRate === null ? "Unavailable" : `${data.canada.turnoverRate.toFixed(1)}%`,
            direction: "neutral",
            plainEnglish: "Share of units where tenancy changed during the survey period.",
            period: data.referencePeriod,
          },
        ],
      },
      {
        title: "Average two-bedroom rent by province",
        kind: "province-rank",
        points: provinceRent.map((province) => ({
          label: province.geography,
          value: province.averageTwoBedroomRent,
          display: currency(province.averageTwoBedroomRent),
          direction: province.rentChangeAmount > 0 ? "up" : province.rentChangeAmount < 0 ? "down" : "neutral",
          plainEnglish: `${province.rentChangeAmount > 0 ? "+" : ""}${currency(province.rentChangeAmount)} change in the surveyed average; ${province.rentGrowthPct === null ? "fixed-sample change unavailable" : `${province.rentGrowthPct.toFixed(1)}% fixed-sample growth`}.`,
        })),
      },
      {
        title: "Vacancy rate by province (lower means tighter)",
        kind: "province-rank",
        points: provinceVacancy.map((province) => ({
          label: province.geography,
          value: province.vacancyRate,
          display: `${province.vacancyRate.toFixed(1)}%`,
          direction: province.vacancyChange > 0 ? "up" : province.vacancyChange < 0 ? "down" : "neutral",
          plainEnglish: `${signed(province.vacancyChange, " points")} from ${data.previousPeriod}.`,
        })),
      },
      {
        title: "Most expensive major rental markets",
        kind: "bar",
        points: metroRent.slice(0, 12).map((metro) => ({
          label: metro.geography,
          value: metro.averageTwoBedroomRent,
          display: currency(metro.averageTwoBedroomRent),
          direction: metro.rentChangeAmount > 0 ? "up" : metro.rentChangeAmount < 0 ? "down" : "neutral",
          plainEnglish: `${metro.vacancyRate.toFixed(1)}% vacancy; ${metro.rentGrowthPct === null ? "fixed-sample change unavailable" : `${metro.rentGrowthPct.toFixed(1)}% fixed-sample rent growth`}.`,
        })),
      },
      {
        title: "Tightest major rental markets",
        kind: "bar",
        points: metroVacancy.slice(0, 12).map((metro) => ({
          label: metro.geography,
          value: metro.vacancyRate,
          display: `${metro.vacancyRate.toFixed(1)}%`,
          direction: metro.vacancyChange > 0 ? "up" : metro.vacancyChange < 0 ? "down" : "neutral",
          plainEnglish: `${currency(metro.averageTwoBedroomRent)} average two-bedroom rent; ${signed(metro.vacancyChange, " points")} vacancy change.`,
        })),
      },
    ],
    sourceLinks: [
      { label: "CMHC Rental Market Survey data tables", url: data.sourceUrl },
      { label: "Official 2025 workbook", url: data.workbookUrl },
    ],
    importanceScore: 98,
    youthImpactScore: 100,
    housingImpactScore: 100,
    promoted: true,
    status: "live",
    plainEnglishSummary: `CMHC's surveyed national two-bedroom average reached ${currency(data.canada.averageTwoBedroomRent)} in ${data.referencePeriod}, while vacancy rose to ${data.canada.vacancyRate.toFixed(1)}%. ${data.definition}`,
    socialSummary: `CMHC ${data.referencePeriod}: national two-bedroom rent ${currency(data.canada.averageTwoBedroomRent)}, fixed-sample growth ${data.canada.rentGrowthPct?.toFixed(1) ?? "n/a"}%, vacancy ${data.canada.vacancyRate.toFixed(1)}%.`,
  };
}

async function getFinanceCanadaRelease(): Promise<NormalizedRelease> {
  const data = await fetchFinanceCanadaFiscalSnapshot();
  const slug = "finance-canada-fiscal-monitor";
  const deficit = data.metrics.find((metric) => metric.label === "Fiscal-year deficit");
  const debtCharges = data.metrics.find((metric) => metric.label === "Public debt charges");

  return {
    id: "finance-canada-fiscal-monitor",
    slug,
    title: data.title,
    source: "finance-canada",
    publisher: "Finance Canada",
    sourceUrl: data.sourceUrl,
    href: sourceHref("finance-canada", slug),
    releaseType: "finance-canada-fiscal-monitor",
    releaseDate: data.releaseDate,
    referencePeriod: data.referencePeriod,
    geographyLevel: "federal",
    affectedAreas: ["fiscal", "economy"],
    headlineFacts: [
      data.summary,
      deficit ? `The deficit changed ${deficit.changeDisplay} from the comparable prior fiscal year.` : "",
      debtCharges ? `Public debt charges reached ${debtCharges.display}.` : "",
    ].filter(Boolean),
    provinceBreakdown: [],
    chartPayloads: [{
      title: "Federal money flow",
      kind: "metric-strip",
      points: data.metrics.map((metric) => ({
        label: metric.label,
        value: metric.value,
        display: metric.display,
        direction: metric.direction,
        plainEnglish: metric.explanation,
        previous: metric.previous,
        previousDisplay: metric.previousDisplay,
        change: metric.change,
        changeDisplay: metric.changeDisplay,
        period: data.referencePeriod,
        changePeriod: "Comparable prior fiscal year",
      })),
    }],
    sourceLinks: [
      { label: "Official Fiscal Monitor", url: data.sourceUrl },
      { label: "Finance Canada publications", url: "https://www.canada.ca/en/department-finance/services/publications.html" },
    ],
    importanceScore: 93,
    youthImpactScore: 76,
    housingImpactScore: 52,
    promoted: true,
    status: "live",
    plainEnglishSummary: `${data.summary} These are federal results; provincial budgets and tax systems are separate.`,
    socialSummary: `Finance Canada: the federal deficit was ${deficit?.display ?? "updated"}; debt charges reached ${debtCharges?.display ?? "a new official value"}.`,
  };
}

async function getOpenGovIrccRelease(): Promise<NormalizedRelease> {
  const data = await fetchIrccImmigrationSnapshot();
  const slug = "ircc-open-data-population-pressure";
  const sourceUrl = data.sourceLinks[0]?.url ?? "https://open.canada.ca/data/en/organization/ircc";
  const metric = (key: string) => data.metrics.find((item) => item.key === key);
  const permanentResidents = metric("permanentResidents");
  const studyPermits = metric("studyPermits");
  const tfwp = metric("tfwp");
  const imp = metric("imp");
  const asylum = metric("asylum");
  const provinceMetrics = [permanentResidents, tfwp, studyPermits].filter(
    (item): item is (typeof data.metrics)[number] => Boolean(item),
  );
  const periodLabel = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${data.referencePeriod}-01T12:00:00Z`));
  const display = (value: number | undefined) => `~${(value ?? 0).toLocaleString("en-CA")}`;
  const point = (item: typeof data.metrics[number]) => ({
    label: item.label,
    value: item.value,
    display: display(item.value),
    direction: item.change === null || item.change === 0 ? "neutral" as const : item.change > 0 ? "up" as const : "down" as const,
    plainEnglish: `${display(item.value)} in ${periodLabel}; source-rounded change of ${item.change === null ? "n/a" : `${item.change > 0 ? "+" : ""}${item.change.toLocaleString("en-CA")}`} from the prior month.`,
    previous: item.previous,
    previousDisplay: item.previous === null ? undefined : display(item.previous),
    change: item.change,
    changeDisplay: item.change === null ? undefined : `${item.change > 0 ? "+" : ""}${item.change.toLocaleString("en-CA")}`,
    period: periodLabel,
    changePeriod: "Previous month to latest month",
  });

  return {
    id: "open-government-ircc-population-pressure",
    slug,
    title: `IRCC monthly immigration flows, ${periodLabel}`,
    source: "open-government-ircc",
    publisher: "Open Government Canada / IRCC",
    sourceUrl,
    href: sourceHref("open-government-ircc", slug),
    releaseType: "ircc-monthly-immigration",
    releaseDate: data.releaseDate,
    referencePeriod: `${periodLabel}; source-rounded monthly counts`,
    geographyLevel: "mixed",
    affectedAreas: ["immigration", "population", "housing", "labour"],
    headlineFacts: [
      `${display(permanentResidents?.value)} permanent residents were admitted in the latest month.`,
      `${display(tfwp?.value)} TFWP and ${display(imp?.value)} IMP work permit holders had permit(s) become effective.`,
      `${display(studyPermits?.value)} study permit holders had permit(s) become effective, while ${display(asylum?.value)} asylum claimants were recorded.`,
      "IRCC rounds these public CSV counts; categories describe different flows and are not summed into a unique-person population total.",
    ],
    provinceBreakdown: permanentResidents?.provinceValues.map((province) => ({
      province: province.province,
      value: display(province.value),
      note: `${((province.value / permanentResidents.value) * 100).toFixed(1)}% of permanent-resident admissions; ${province.change === null ? "prior month unavailable" : `${province.change > 0 ? "+" : ""}${province.change.toLocaleString("en-CA")} from the prior month`} (rounded).`,
      score: Math.min(100, Math.round((province.value / permanentResidents.value) * 200)),
    })) ?? [],
    chartPayloads: [
      {
        title: "Latest monthly immigration and permit flows",
        kind: "metric-strip",
        points: data.metrics.map(point),
      },
      {
        title: "Permanent-resident admissions by category",
        kind: "bar",
        points: data.permanentResidentCategories.map((category) => ({
          label: category.label,
          value: category.value,
          display: display(category.value),
          direction: category.change === null || category.change === 0 ? "neutral" : category.change > 0 ? "up" : "down",
          plainEnglish: `${display(category.value)} in ${periodLabel}; ${category.change === null ? "prior month unavailable" : `${category.change > 0 ? "+" : ""}${category.change.toLocaleString("en-CA")} from the prior month`} (rounded).`,
          previous: category.previous,
          previousDisplay: category.previous === null ? undefined : display(category.previous),
          change: category.change,
          changeDisplay: category.change === null ? undefined : `${category.change > 0 ? "+" : ""}${category.change.toLocaleString("en-CA")}`,
          period: periodLabel,
          changePeriod: "Previous month to latest month",
        })),
      },
      ...provinceMetrics.map((item) => ({
        title: `${item.label} by province`,
        kind: "province-rank" as const,
        points: item.provinceValues.slice(0, 10).map((province) => ({
          label: province.province,
          value: province.value,
          display: display(province.value),
          direction: province.change === null || province.change === 0 ? "neutral" as const : province.change > 0 ? "up" as const : "down" as const,
          plainEnglish: `${display(province.value)} in ${periodLabel}; ${province.change === null ? "prior month unavailable" : `${province.change > 0 ? "+" : ""}${province.change.toLocaleString("en-CA")} from the prior month`} (rounded).`,
        })),
      })),
    ],
    sourceLinks: [
      ...data.sourceLinks,
      { label: "IRCC open data catalogue", url: "https://open.canada.ca/data/en/organization/ircc" },
    ],
    importanceScore: 84,
    youthImpactScore: 82,
    housingImpactScore: 88,
    promoted: true,
    status: "live",
    plainEnglishSummary:
      `IRCC's latest source-rounded monthly files report ${display(permanentResidents?.value)} permanent-resident admissions, ${display(studyPermits?.value)} study permit holders, ${display(tfwp?.value)} TFWP work permit holders, ${display(imp?.value)} IMP work permit holders and ${display(asylum?.value)} asylum claimants. For permit holders, the reference month is when permit(s) became effective. These are different flows, not a single stock of temporary residents, and should not be added together as unique people.`,
    socialSummary: `IRCC ${periodLabel}: ${display(permanentResidents?.value)} permanent residents, ${display(studyPermits?.value)} study permit holders, ${display(tfwp?.value)} TFWP holders, ${display(imp?.value)} IMP holders and ${display(asylum?.value)} asylum claimants (source-rounded).`,
  };
}

function officialMonitorToRelease(monitor: OfficialReportMonitor): NormalizedRelease {
  const slug = slugify(monitor.title);

  return {
    id: monitor.id,
    slug,
    title: monitor.title,
    source: monitor.source,
    publisher: monitor.publisher,
    sourceUrl: monitor.sourceUrl,
    href: sourceHref(monitor.source, slug),
    releaseType: monitor.releaseType,
    releaseDate: monitor.releaseDate,
    referencePeriod: monitor.referencePeriod,
    geographyLevel: "mixed",
    affectedAreas: monitor.affectedAreas,
    headlineFacts: monitor.headlineFacts,
    provinceBreakdown: [],
    chartPayloads: monitor.chartPayloads,
    sourceLinks: monitor.sourceLinks,
    importanceScore: monitor.importanceScore,
    youthImpactScore: monitor.youthImpactScore,
    housingImpactScore: monitor.housingImpactScore,
    promoted: monitor.confirmedRelease && monitor.importanceScore >= 70,
    status: monitor.confirmedRelease ? "live" : "source_linked",
    plainEnglishSummary: monitor.plainEnglishSummary,
    socialSummary: monitor.socialSummary,
  };
}

function sourceLinkedRelease(input: {
  id: string;
  source: string;
  publisher: string;
  title: string;
  sourceUrl: string;
  releaseType: string;
  affectedAreas: ReleaseArea[];
  summary: string;
  score: number;
}): NormalizedRelease {
  const slug = slugify(input.title);
  return {
    id: input.id,
    slug,
    title: input.title,
    source: input.source,
    publisher: input.publisher,
    sourceUrl: input.sourceUrl,
    href: sourceHref(input.source, slug),
    releaseType: input.releaseType,
    releaseDate: canadaDate(),
    referencePeriod: "Latest source monitor",
    geographyLevel: "mixed",
    affectedAreas: input.affectedAreas,
    headlineFacts: [input.summary],
    provinceBreakdown: [],
    chartPayloads: [],
    sourceLinks: [{ label: input.publisher, url: input.sourceUrl }],
    importanceScore: input.score,
    youthImpactScore: input.affectedAreas.includes("housing") ? 82 : 58,
    housingImpactScore: input.affectedAreas.includes("housing") ? 82 : 35,
    promoted: input.score >= 70,
    status: "source_linked",
    plainEnglishSummary: input.summary,
    socialSummary: input.summary,
  };
}

async function getSourceLinkedReleases() {
  return [
    sourceLinkedRelease({
      id: "cer-nrcan-energy-watch",
      source: "cer-nrcan",
      publisher: "Canada Energy Regulator / NRCan",
      title: "Energy cost changed: CER and NRCan watch",
      sourceUrl: "https://www.cer-rec.gc.ca/en/data-analysis/",
      releaseType: "energy-monitor",
      affectedAreas: ["energy", "trade"],
      summary:
        "Energy releases show oil, gas, electricity mix, electricity prices, emissions, pipelines and export pressure.",
      score: 70,
    }),
    sourceLinkedRelease({
      id: "pbo-fiscal-reports",
      source: "pbo",
      publisher: "Parliamentary Budget Officer",
      title: "Budget watchdog changed the fiscal story",
      sourceUrl: "https://www.pbo-dpb.ca/en/",
      releaseType: "fiscal-report-monitor",
      affectedAreas: ["fiscal", "housing"],
      summary:
        "PBO reports translate fiscal outlooks, infrastructure spending, program costing and debt sustainability into plain English.",
      score: 72,
    }),
  ];
}

async function buildMultiSourceReleaseHub(): Promise<ReleaseHubPayload> {
  const statCanEntriesPromise = fetchStatCanDailyEntries().catch(() => []);
  const cpiWatchPromise = getStatCanCpiWatch().catch(() =>
    sourceLinkedRelease({
      id: "statcan-cpi-watch",
      source: "statcan",
      publisher: "Statistics Canada",
      title: "Consumer Price Index watch",
      sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401",
      releaseType: "statcan-cpi-watch",
      affectedAreas: ["inflation", "housing", "energy"],
      summary: "The CPI table tracks headline, food, shelter, rent, gasoline and provincial inflation.",
      score: 99,
    }),
  );
  const housingWatchPromise = getCmhcHousingWatch().catch(() =>
    sourceLinkedRelease({
      id: "cmhc-housing-watch",
      source: "cmhc",
      publisher: "CMHC",
      title: "Canadians just got new housing numbers",
      sourceUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data",
      releaseType: "housing-release-monitor",
      affectedAreas: ["housing"],
      summary: "CMHC housing data tracks starts, completions, rent, vacancy, mortgage and debt pressure.",
      score: 95,
    }),
  );
  const rentalWatchPromise = getCmhcRentalWatch().catch(() =>
    sourceLinkedRelease({
      id: "cmhc-rental-market-watch",
      source: "cmhc",
      publisher: "CMHC",
      title: "CMHC Rental Market Survey",
      sourceUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables",
      releaseType: "cmhc-rental-market",
      affectedAreas: ["housing", "inflation"],
      summary: "CMHC's Rental Market Survey reports vacancy, turnover and average rents for its primary rental universe.",
      score: 98,
    }),
  );
  const bankOfCanadaPromise = getBankOfCanadaRelease().catch(() =>
    sourceLinkedRelease({
      id: "bank-of-canada-valet-rate-watch",
      source: "bank-of-canada",
      publisher: "Bank of Canada",
      title: "Mortgage pressure changed: Bank of Canada rate watch",
      sourceUrl: "https://www.bankofcanada.ca/rates/",
      releaseType: "rate-monitor",
      affectedAreas: ["rates", "housing"],
      summary: "Bank of Canada rate and yield data translates into mortgage, rent, debt and CAD pressure.",
      score: 84,
    }),
  );
  const bankOfCanadaReportsPromise = fetchBankOfCanadaReportReleases().catch(() => []);
  const financeCanadaPromise = getFinanceCanadaRelease().catch(() =>
    sourceLinkedRelease({
      id: "finance-canada-fiscal-monitor",
      source: "finance-canada",
      publisher: "Finance Canada",
      title: "Finance Canada's latest Fiscal Monitor",
      sourceUrl: "https://www.canada.ca/en/department-finance/services/publications/fiscal-monitor.html",
      releaseType: "finance-canada-fiscal-monitor",
      affectedAreas: ["fiscal", "economy"],
      summary: "The Fiscal Monitor reports federal revenue, program expenses, debt charges and the budget balance.",
      score: 93,
    }),
  );
  const irccPromise = getOpenGovIrccRelease().catch(() =>
    sourceLinkedRelease({
      id: "open-government-ircc-population-pressure",
      source: "open-government-ircc",
      publisher: "Open Government Canada / IRCC",
      title: "Population pressure changed: IRCC open data watch",
      sourceUrl: "https://search.open.canada.ca/opendata/?owner_org=cic",
      releaseType: "open-data-monitor",
      affectedAreas: ["immigration", "population", "housing"],
      summary: "IRCC open data tracks PR, TFW, student, refugee and asylum pressure.",
      score: 84,
    }),
  );
  const officialMonitorsPromise = fetchOfficialReportMonitors()
    .then((monitors) => monitors.map(officialMonitorToRelease))
    .catch(() => getSourceLinkedReleases());
  const statCanEntries = await statCanEntriesPromise;
  const latestStatCanDate = getLatestDailyReleaseDate(statCanEntries);
  const statCanToday = getEntriesForReleaseDate(statCanEntries, latestStatCanDate);
  const rollingMajorStatCan = statCanEntries
    .filter((entry) => isMajorStatCanTitle(entry.title))
    .sort((a, b) => b.published.localeCompare(a.published));
  const rankedStatCan = [...new Map(
    [...rollingMajorStatCan.slice(0, 5), ...rankDailyEntries(statCanToday).slice(0, 5)]
      .map((entry) => [entry.href, entry]),
  ).values()].slice(0, 9);
  const statCanReleases = await mapWithConcurrency(rankedStatCan, 3, normalizeStatCanDailyRelease);
  const [cpiWatch, housingWatch, rentalWatch, bankOfCanada, bankOfCanadaReports, financeCanada, ircc, officialMonitors] = await Promise.all([
    cpiWatchPromise,
    housingWatchPromise,
    rentalWatchPromise,
    bankOfCanadaPromise,
    bankOfCanadaReportsPromise,
    financeCanadaPromise,
    irccPromise,
    officialMonitorsPromise,
  ]);
  const releaseTimestamp = (release: NormalizedRelease) => {
    const timestamp = Date.parse(release.releaseDate.length === 7 ? `${release.releaseDate}-01T12:00:00Z` : release.releaseDate);
    return Number.isFinite(timestamp) ? timestamp : 0;
  };
  const promotionScore = (release: NormalizedRelease) => {
    const ageDays = Math.max(0, (Date.now() - releaseTimestamp(release)) / 86_400_000);
    const freshness = ageDays <= 1 ? 45 : ageDays <= 4 ? 30 : ageDays <= 14 ? 15 : ageDays <= 45 ? 0 : -35;
    const evidence = release.status === "live" && hasStructuredMetrics(release) ? 18 : -20;
    return release.importanceScore + freshness + evidence;
  };
  const todayQueue = [cpiWatch, housingWatch, rentalWatch, bankOfCanada, ...bankOfCanadaReports, financeCanada, ircc, ...officialMonitors, ...statCanReleases].sort(
    (a, b) => promotionScore(b) - promotionScore(a) || releaseTimestamp(b) - releaseTimestamp(a),
  );
  const isEditorialRelease = (release: NormalizedRelease) =>
    (release.releaseType === "official-daily-release" && isMajorStatCanTitle(release.title)) ||
    release.releaseType.startsWith("bank-of-canada-") ||
    release.releaseType === "statcan-cpi-watch" ||
    release.releaseType === "housing-release-monitor" ||
    release.releaseType === "cmhc-rental-market";
  const promotedRelease = todayQueue.find(
    (release) =>
      release.promoted &&
      release.status === "live" &&
      hasStructuredMetrics(release) &&
      isEditorialRelease(release) &&
      release.releaseType !== "valet-rate-observation",
  ) ?? todayQueue.find((release) => release.status === "live" && hasStructuredMetrics(release)) ?? null;

  return {
    generatedAt: new Date().toISOString(),
    promotedRelease,
    housingWatch,
    todayQueue,
    provinceImpact: housingWatch.provinceBreakdown.map((item) => ({
      province: item.province,
      score: item.score,
      label: item.note,
      source: "CMHC Housing Watch",
    })),
    sourceStatuses: [
      {
        source: "Statistics Canada",
        status: cpiWatch.status === "live" || statCanReleases.some((release) => release.status === "live") ? "live" : "summary_only",
        note: "Daily releases plus direct CPI WDS vectors and rolling Daily URL probes connected.",
      },
      { source: "CMHC", status: housingWatch.status === "live" && rentalWatch.status === "live" ? "live" : "source_linked", note: "Quarterly construction starts and annual Rental Market Survey rent, vacancy and turnover tables connected." },
      {
        source: "Bank of Canada",
        status: bankOfCanadaReports.length ? "live" : bankOfCanada.status,
        note: bankOfCanadaReports.length
          ? `${bankOfCanadaReports.length} report families monitored plus Valet rate observations.`
          : "Valet rate observations are live; no current report page was confirmed in this check.",
      },
      { source: "Open Government / IRCC", status: ircc.status, note: "Monthly PR, study permit, TFWP, IMP and asylum resources imported with provincial breakdowns." },
      { source: "Finance Canada", status: financeCanada.status, note: "Latest Fiscal Monitor revenue, expense, deficit and debt-charge tables connected." },
      {
        source: "CER / NRCan",
        status: officialMonitors.some((release) => release.source === "cer-nrcan" && release.status === "live") ? "live" : "source_linked",
        note: "Energy official page monitor connected.",
      },
      {
        source: "PBO",
        status: officialMonitors.some((release) => release.source === "pbo" && release.status === "live") ? "live" : "source_linked",
        note: "Fiscal report page monitor connected.",
      },
    ],
  };
}

export const getMultiSourceReleaseHub = unstable_cache(
  buildMultiSourceReleaseHub,
  ["canada-pulse-release-hub-v1"],
  { revalidate: 5 * 60, tags: ["canada-pulse-release-hub"] },
);

export async function findHubRelease(source: string, slug: string, releaseDate?: string, sourceUrl?: string) {
  const hub = await getMultiSourceReleaseHub();
  const current = hub.todayQueue.find((release) =>
    release.source === source && release.slug === slug && (!releaseDate || release.releaseDate === releaseDate),
  );
  if (current) return current;
  const persisted = await findPersistedRelease(source, slug, releaseDate).catch(() => null);
  if (source !== "statcan") return persisted;
  if (persisted?.status === "live" && hasStructuredMetrics(persisted)) return persisted;

  const entries = await fetchStatCanDailyEntries().catch(() => []);
  const entry = entries.find((item) => slugifyReleaseTitle(item.title) === slug)
    ?? (sourceUrl || persisted?.sourceUrl
      ? await fetchStatCanDailyEntryFromUrl(sourceUrl ?? persisted?.sourceUrl ?? "").catch(() => null)
      : null);
  return entry ? normalizeStatCanDailyRelease(entry) : persisted;
}
