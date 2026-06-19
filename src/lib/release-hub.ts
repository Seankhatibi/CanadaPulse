import { Building2, Factory, Home, Landmark, TrendingUp, Users } from "lucide-react";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";
import { fetchCmhcHousingConstructionData } from "@/lib/cmhc-housing";
import { fetchBankOfCanadaReportReleases } from "@/lib/bank-of-canada-reports";
import { fetchIrccOpenDataSignals, fetchOfficialReportMonitors, type OfficialReportMonitor } from "@/lib/official-source-monitors";
import {
  fetchStatCanDailyEntries,
  getEntriesForReleaseDate,
  getLatestDailyReleaseDate,
  getReleaseExplainerHref,
  rankDailyEntries,
  type StatCanDailyEntry,
} from "@/lib/statcan-daily";

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
  | "population";

export type ReleaseFactStatus = "live" | "source_linked" | "summary_only" | "error";

export type ReleaseChartPayload = {
  title: string;
  kind: "bar" | "metric-strip" | "province-rank";
  points: Array<{
    label: string;
    value: number;
    display: string;
    direction: "up" | "down" | "neutral";
    plainEnglish: string;
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
  icon: typeof Home;
};

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function sourceHref(source: string, slug: string) {
  return `/pulse-release/${source}/${slug}`;
}

function classifyStatCanAreas(entry: StatCanDailyEntry): ReleaseArea[] {
  const text = `${entry.title} ${entry.summary}`.toLowerCase();
  const areas = new Set<ReleaseArea>();

  if (/housing|rent|construction|building/.test(text)) areas.add("housing");
  if (/retail|wholesale|consumer demand|consumer spending|sales|manufacturing/.test(text)) areas.add("economy");
  if (/price|inflation|consumer price|cpi/.test(text)) areas.add("inflation");
  if (/labour|employment|unemployment|wage|productivity/.test(text)) areas.add("labour");
  if (/population|immigration|temporary resident|student|refugee/.test(text)) areas.add("population");
  if (/trade|export|import/.test(text)) areas.add("trade");
  if (/energy|oil|gas|electricity|natural resources/.test(text)) areas.add("energy");

  return areas.size ? [...areas] : ["population"];
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
  return Math.min(score, 100);
}

async function statCanReleaseFromEntry(entry: StatCanDailyEntry, promotedHref?: string): Promise<NormalizedRelease> {
  const releaseData = await fetchStatCanReleaseData(entry).catch(() => null);
  const areas = classifyStatCanAreas(entry);
  const slug = slugify(entry.title);
  const chartPayloads: ReleaseChartPayload[] = releaseData?.signals.length
    ? [
        {
          title: "Real table breakdown",
          kind: "bar",
          points: releaseData.signals.slice(0, 6).map((signal) => ({
            label: signal.label,
            value: signal.value,
            display: signal.display,
            direction: signal.direction,
            plainEnglish: signal.explanation,
          })),
        },
      ]
    : [];
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
    href: promotedHref ?? getReleaseExplainerHref(entry),
    releaseType: "official-daily-release",
    releaseDate: entry.published.slice(0, 10),
    referencePeriod: entry.published,
    geographyLevel: "mixed",
    affectedAreas: areas,
    headlineFacts: [
      entry.summary || "Official Daily release detected.",
      ...((releaseData?.signals ?? []).slice(0, 4).map((signal) => `${signal.label}: ${signal.display}`)),
    ],
    provinceBreakdown: [],
    chartPayloads,
    sourceLinks: [
      { label: "Official Daily release", url: entry.href },
      ...((releaseData?.wdsDownloads ?? [])
        .filter((download) => download.downloadUrl)
        .map((download) => ({ label: `Official table ${download.productId}`, url: download.downloadUrl as string }))),
    ],
    importanceScore,
    youthImpactScore: areas.some((area) => ["housing", "labour", "inflation"].includes(area)) ? 72 : 42,
    housingImpactScore: areas.includes("housing") ? 88 : 35,
    promoted: importanceScore >= 50,
    status: releaseData?.sourceStatus === "table_data_loaded" ? "live" : "summary_only",
    plainEnglishSummary: entry.summary || "Canada Pulse detected this official release and is preparing the source-backed breakdown.",
    socialSummary: `${entry.title}: ${entry.summary}`.slice(0, 220),
    icon: TrendingUp,
  };
}

async function fetchValetObservation(series: string) {
  const response = await fetch(`https://www.bankofcanada.ca/valet/observations/${series}/json?recent=1`, {
    next: { revalidate: 60 * 60 },
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
    icon: Landmark,
  };
}

async function getCmhcHousingWatch(): Promise<NormalizedRelease> {
  const data = await fetchCmhcHousingConstructionData();
  const slug = "cmhc-housing-watch";
  const changeDisplay =
    data.canadaChangePct === null ? "change pending" : `${data.canadaChangePct > 0 ? "+" : ""}${data.canadaChangePct}% vs ${data.previousPeriod}`;

  return {
    id: "cmhc-housing-watch",
    slug,
    title: "Canadians just got new housing numbers",
    source: "cmhc",
    publisher: "CMHC",
    sourceUrl: data.sourceUrl,
    href: sourceHref("cmhc", slug),
    releaseType: "housing-release-monitor",
    releaseDate: data.latestPeriod,
    referencePeriod: `Latest official table period: ${data.latestPeriod}`,
    geographyLevel: "mixed",
    affectedAreas: ["housing"],
    headlineFacts: [
      `Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} housing starts in ${data.latestPeriod}.`,
      `Canada recorded ${data.canadaCompletions.toLocaleString("en-CA")} completions in the same period, a starts-minus-completions gap of ${data.canadaStartsCompletionsGap.toLocaleString("en-CA")}.`,
      `National starts are ${changeDisplay}.`,
      `${data.unitMix[0]?.label ?? "Apartments/other"} accounted for ${data.unitMix[0]?.sharePct ?? 0}% of starts.`,
      "Starts are not completions: treat this as a supply pipeline signal, not homes ready to move into.",
    ],
    provinceBreakdown: data.provinces.map((province) => ({
      province: province.province,
      value: province.starts.toLocaleString("en-CA"),
      note:
        province.changePct === null
          ? `${province.sharePct}% of Canada's latest starts; ${province.completions.toLocaleString("en-CA")} completions.`
          : `${province.sharePct}% of Canada's latest starts; ${province.changePct > 0 ? "up" : "down"} ${Math.abs(province.changePct)}% vs ${data.previousPeriod}; ${province.completions.toLocaleString("en-CA")} completions.`,
      score: Math.min(100, Math.round(province.sharePct * 4 + Math.max(0, province.changePct ?? 0) + Math.max(0, province.startsCompletionsGap / 1000))),
    })),
    chartPayloads: [
      {
        title: "Starts versus completions",
        kind: "bar",
        points: [
          {
            label: "Housing starts",
            value: data.canadaStarts,
            display: data.canadaStarts.toLocaleString("en-CA"),
            direction: "up",
            plainEnglish: "Starts show the construction pipeline: homes beginning construction, not move-in ready supply.",
          },
          {
            label: "Housing completions",
            value: data.canadaCompletions,
            display: data.canadaCompletions.toLocaleString("en-CA"),
            direction: data.canadaCompletions >= data.canadaStarts ? "up" : "neutral",
            plainEnglish: "Completions are the closer signal for homes becoming available to households.",
          },
          {
            label: "Starts-completions gap",
            value: data.canadaStartsCompletionsGap,
            display: data.canadaStartsCompletionsGap.toLocaleString("en-CA"),
            direction: data.canadaStartsCompletionsGap >= 0 ? "up" : "down",
            plainEnglish: "A positive gap means starts exceeded completions this period; it is a pipeline signal, not immediate supply relief.",
          },
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
          plainEnglish: `${province.province} represented ${province.sharePct}% of Canada's housing starts in ${data.latestPeriod}.`,
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
      `CMHC housing construction data is now live in Canada Pulse. Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} starts and ${data.canadaCompletions.toLocaleString("en-CA")} completions in ${data.latestPeriod}; starts show the pipeline, while completions are closer to homes becoming available.`,
    socialSummary: `CMHC Housing Watch: Canada recorded ${data.canadaStarts.toLocaleString("en-CA")} starts and ${data.canadaCompletions.toLocaleString("en-CA")} completions in ${data.latestPeriod}.`,
    icon: Home,
  };
}

async function getOpenGovIrccRelease(): Promise<NormalizedRelease> {
  const signals = await fetchIrccOpenDataSignals();
  const slug = "ircc-open-data-population-pressure";
  const sourceUrl = "https://search.open.canada.ca/opendata/?owner_org=cic";
  const totalDatasets = signals.reduce((sum, signal) => sum + signal.datasetCount, 0);
  const totalResources = signals.reduce((sum, signal) => sum + signal.resourceCount, 0);
  const latestModified = signals.map((signal) => signal.lastModified).sort().at(-1) ?? canadaDate();

  return {
    id: "open-government-ircc-population-pressure",
    slug,
    title: "Population pressure changed: IRCC open data watch",
    source: "open-government-ircc",
    publisher: "Open Government Canada / IRCC",
    sourceUrl,
    href: sourceHref("open-government-ircc", slug),
    releaseType: "open-data-resource-check",
    releaseDate: latestModified,
    referencePeriod: "Latest Open Government resource check",
    geographyLevel: "mixed",
    affectedAreas: ["immigration", "population", "housing", "labour"],
    headlineFacts: [
      `${totalDatasets.toLocaleString("en-CA")} matching Open Government datasets found across PR, TFW, student, refugee and asylum searches.`,
      `${totalResources.toLocaleString("en-CA")} source resources are attached to the top matching official datasets.`,
      "Canada Pulse now checks dataset resources and datastore availability, not just the catalogue page.",
      ...signals.slice(0, 2).map((signal) => `${signal.topic}: ${signal.packageTitle}`),
    ],
    provinceBreakdown: [],
    chartPayloads: [
      {
        title: "Population pressure source stack",
        kind: "metric-strip",
        points: signals.map((signal) => ({
          label: signal.topic,
          value: signal.datastoreRecords ?? signal.resourceCount,
          display:
            signal.datastoreRecords === null
              ? `${signal.resourceCount} resources`
              : `${signal.datastoreRecords.toLocaleString("en-CA")} rows`,
          direction: "up",
          plainEnglish: `${signal.packageTitle}. ${signal.datasetCount.toLocaleString("en-CA")} matching datasets found; last modified ${signal.lastModified}.`,
        })),
      },
    ],
    sourceLinks: [
      { label: "Open Government IRCC search", url: "https://search.open.canada.ca/opendata/?owner_org=cic" },
      ...signals.map((signal) => ({ label: signal.topic, url: signal.packageUrl })),
    ],
    importanceScore: 84,
    youthImpactScore: 82,
    housingImpactScore: 88,
    promoted: true,
    status: "live",
    plainEnglishSummary:
      `Canada Pulse is watching IRCC Open Data because population growth only becomes understandable when temporary residents, students, workers, refugees, jobs, homes and healthcare capacity are shown together. The app found ${totalDatasets.toLocaleString("en-CA")} matching official datasets and ${totalResources.toLocaleString("en-CA")} attached resources across the population-pressure stack.`,
    socialSummary: `IRCC Open Data watch: ${totalDatasets.toLocaleString("en-CA")} matching datasets and ${totalResources.toLocaleString("en-CA")} resources across PR, TFW, student, refugee and asylum topics.`,
    icon: Users,
  };
}

function officialMonitorToRelease(monitor: OfficialReportMonitor): NormalizedRelease {
  const slug = slugify(monitor.title);
  const icon = monitor.source === "pbo" ? Building2 : Factory;

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
    promoted: monitor.importanceScore >= 70,
    status: "live",
    plainEnglishSummary: monitor.plainEnglishSummary,
    socialSummary: monitor.socialSummary,
    icon,
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
  icon: typeof Home;
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
    icon: input.icon,
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
      icon: Factory,
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
      icon: Building2,
      score: 72,
    }),
  ];
}

export async function getMultiSourceReleaseHub(): Promise<ReleaseHubPayload> {
  const statCanEntries = await fetchStatCanDailyEntries().catch(() => []);
  const latestStatCanDate = getLatestDailyReleaseDate(statCanEntries);
  const statCanToday = getEntriesForReleaseDate(statCanEntries, latestStatCanDate);
  const rankedStatCan = rankDailyEntries(statCanToday.length ? statCanToday : statCanEntries).slice(0, 5);
  const statCanReleases = await Promise.all(rankedStatCan.map((entry) => statCanReleaseFromEntry(entry)));
  const housingWatch = await getCmhcHousingWatch().catch(() =>
    sourceLinkedRelease({
      id: "cmhc-housing-watch",
      source: "cmhc",
      publisher: "CMHC",
      title: "Canadians just got new housing numbers",
      sourceUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data",
      releaseType: "housing-release-monitor",
      affectedAreas: ["housing"],
      summary: "CMHC housing data tracks starts, completions, rent, vacancy, mortgage and debt pressure.",
      icon: Home,
      score: 95,
    }),
  );
  const bankOfCanada = await getBankOfCanadaRelease().catch(() =>
    sourceLinkedRelease({
      id: "bank-of-canada-valet-rate-watch",
      source: "bank-of-canada",
      publisher: "Bank of Canada",
      title: "Mortgage pressure changed: Bank of Canada rate watch",
      sourceUrl: "https://www.bankofcanada.ca/rates/",
      releaseType: "rate-monitor",
      affectedAreas: ["rates", "housing"],
      summary: "Bank of Canada rate and yield data translates into mortgage, rent, debt and CAD pressure.",
      icon: Landmark,
      score: 84,
    }),
  );
  const bankOfCanadaReports = await fetchBankOfCanadaReportReleases().catch(() => []);
  const ircc = await getOpenGovIrccRelease().catch(() =>
    sourceLinkedRelease({
      id: "open-government-ircc-population-pressure",
      source: "open-government-ircc",
      publisher: "Open Government Canada / IRCC",
      title: "Population pressure changed: IRCC open data watch",
      sourceUrl: "https://search.open.canada.ca/opendata/?owner_org=cic",
      releaseType: "open-data-monitor",
      affectedAreas: ["immigration", "population", "housing"],
      summary: "IRCC open data tracks PR, TFW, student, refugee and asylum pressure.",
      icon: Users,
      score: 84,
    }),
  );
  const officialMonitors = await fetchOfficialReportMonitors()
    .then((monitors) => monitors.map(officialMonitorToRelease))
    .catch(() => getSourceLinkedReleases());
  const todayQueue = [housingWatch, bankOfCanada, ...bankOfCanadaReports, ircc, ...officialMonitors, ...statCanReleases].sort(
    (a, b) => b.importanceScore - a.importanceScore,
  );
  const promotedRelease = todayQueue.find((release) => release.promoted) ?? todayQueue.at(0) ?? null;

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
        status: statCanReleases.some((release) => release.status === "live") ? "live" : "summary_only",
        note: "Daily feeds plus rolling direct Daily URL probes monitored.",
      },
      { source: "CMHC", status: housingWatch.status, note: "Housing starts table connected; completions/rental imports next." },
      {
        source: "Bank of Canada",
        status: bankOfCanadaReports.length ? "live" : bankOfCanada.status,
        note: bankOfCanadaReports.length
          ? `${bankOfCanadaReports.length} report families monitored plus Valet rate observations.`
          : "Valet rate observation connected; report monitor fallback active.",
      },
      { source: "Open Government / IRCC", status: ircc.status, note: "Dataset resource and datastore monitor connected." },
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

export async function findHubRelease(source: string, slug: string) {
  const hub = await getMultiSourceReleaseHub();
  return hub.todayQueue.find((release) => release.source === source && release.slug === slug) ?? null;
}
