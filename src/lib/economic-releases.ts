export type EconomicReleaseMetric = {
  label: string;
  value: string;
  status: "hot" | "weak" | "mixed" | "stable" | "watch";
  detail: string;
};

export type ReleaseChartPoint = {
  label: string;
  value: number;
  display: string;
  plainEnglish: string;
};

export type EconomicRelease = {
  slug: string;
  title: string;
  releaseDate: string;
  referencePeriod: string;
  source: string;
  sourceUrl: string;
  tableIds: string[];
  importance: "major";
  headline: string;
  scoreImpact: string;
  nextRelease: string;
  plainEnglishSummary: string;
  readerTakeaway: string;
  metrics: EconomicReleaseMetric[];
  breakdown: EconomicReleaseMetric[];
  chartPoints: ReleaseChartPoint[];
  analysis: string[];
};

export function getCanadaReleaseDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isCanadaReleaseToday(releaseDate: string, date = new Date()) {
  return releaseDate === getCanadaReleaseDate(date);
}

export const latestMajorEconomicRelease: EconomicRelease = {
  slug: "gdp-2026-q1-march",
  title: "GDP release: Q1 2026 and March industry GDP",
  releaseDate: "2026-05-29",
  referencePeriod: "Q1 2026 / March 2026",
  source: "Statistics Canada",
  sourceUrl: "https://www150.statcan.gc.ca/n1/daily-quotidien/260529/dq260529a-eng.htm",
  tableIds: ["36-10-0104-01", "36-10-0112-01", "36-10-0434-01"],
  importance: "major",
  headline:
    "Canada's real GDP was unchanged in Q1, while March industry GDP slipped 0.1%. The economy is not collapsing, but it is losing momentum in the places Canadians feel: housing, business investment, and goods-producing industries.",
  scoreImpact: "Canada Pulse pressure: elevated",
  nextRelease: "Monthly GDP by industry for April 2026 is scheduled for 2026-06-30. Q2 income and expenditure GDP is scheduled for 2026-08-28.",
  plainEnglishSummary:
    "Canada's economy did not grow in Q1. That does not mean a crash, but it does mean the country is struggling to build momentum. Consumers kept spending, wages rose, and utilities were strong, while housing investment, construction, goods industries, and business investment weakened.",
  readerTakeaway:
    "The easiest way to read this release: Canadians are still spending, but the parts of the economy that build future growth are soft.",
  metrics: [
    {
      label: "Real GDP by expenditure",
      value: "0.0%",
      status: "weak",
      detail: "Q1 2026 quarterly change after a 0.2% decline in Q4 2025.",
    },
    {
      label: "GDP per capita",
      value: "+0.2%",
      status: "mixed",
      detail: "Per-capita GDP rose because population declined for a second consecutive quarter.",
    },
    {
      label: "March GDP by industry",
      value: "-0.1%",
      status: "weak",
      detail: "March partially offset February's 0.2% increase.",
    },
    {
      label: "April advance estimate",
      value: "+0.4%",
      status: "watch",
      detail: "Preliminary estimate; official April industry GDP is due June 30.",
    },
  ],
  breakdown: [
    {
      label: "Household spending",
      value: "+0.4%",
      status: "stable",
      detail: "Higher spending on financial services and food supported Q1 consumption.",
    },
    {
      label: "Household saving rate",
      value: "3.5%",
      status: "weak",
      detail: "Lowest since Q1 2024 as disposable income lagged nominal consumption.",
    },
    {
      label: "Imports",
      value: "+2.9%",
      status: "watch",
      detail: "Higher goods imports, especially gold-related categories, weighed on GDP.",
    },
    {
      label: "Exports",
      value: "-0.1%",
      status: "mixed",
      detail: "Passenger cars and light trucks fell; crude oil, bitumen, and natural gas offset some weakness.",
    },
    {
      label: "Business capital investment",
      value: "-0.7%",
      status: "weak",
      detail: "Fifth consecutive quarterly decline; engineering structures fell 4.6%.",
    },
    {
      label: "Residential structures",
      value: "-2.0%",
      status: "weak",
      detail: "Weak resale activity drove the housing investment decline.",
    },
    {
      label: "Goods-producing industries",
      value: "-0.8%",
      status: "weak",
      detail: "March decline led by mining, quarrying, oil and gas extraction, and construction.",
    },
    {
      label: "Services-producing industries",
      value: "+0.1%",
      status: "stable",
      detail: "Services tempered the March decline, led by wholesale trade.",
    },
    {
      label: "Construction in Q1",
      value: "-1.3%",
      status: "weak",
      detail: "Largest Q1 detractor by industry; engineering and residential construction declined.",
    },
    {
      label: "Utilities in Q1",
      value: "+1.9%",
      status: "hot",
      detail: "Electric power generation, transmission, and distribution led the increase.",
    },
    {
      label: "Compensation of employees",
      value: "+1.2%",
      status: "stable",
      detail: "Wages and salaries grew, led by professional/personal services and health care.",
    },
    {
      label: "Corporate income",
      value: "+1.6%",
      status: "hot",
      detail: "Energy prices helped non-financial corporate surplus.",
    },
  ],
  chartPoints: [
    {
      label: "Imports",
      value: 2.9,
      display: "+2.9%",
      plainEnglish: "More imports can subtract from GDP because more demand is being met by goods from outside Canada.",
    },
    {
      label: "Residential structures",
      value: -2,
      display: "-2.0%",
      plainEnglish: "Housing investment fell, mostly because resale activity was weak.",
    },
    {
      label: "Construction",
      value: -1.3,
      display: "-1.3%",
      plainEnglish: "Construction was one of the largest drags on the quarter.",
    },
    {
      label: "Goods industries",
      value: -0.8,
      display: "-0.8%",
      plainEnglish: "Goods-producing sectors weakened in March, including mining, oil and gas, and construction.",
    },
    {
      label: "Business investment",
      value: -0.7,
      display: "-0.7%",
      plainEnglish: "Business capital investment fell for a fifth straight quarter.",
    },
    {
      label: "Exports",
      value: -0.1,
      display: "-0.1%",
      plainEnglish: "Exports were slightly lower, with vehicle weakness offset by energy strength.",
    },
    {
      label: "Household spending",
      value: 0.4,
      display: "+0.4%",
      plainEnglish: "Consumers kept spending, especially on services and food.",
    },
    {
      label: "Compensation",
      value: 1.2,
      display: "+1.2%",
      plainEnglish: "Employee compensation rose, helped by services and healthcare.",
    },
    {
      label: "Corporate income",
      value: 1.6,
      display: "+1.6%",
      plainEnglish: "Energy prices helped corporate surplus.",
    },
    {
      label: "Utilities",
      value: 1.9,
      display: "+1.9%",
      plainEnglish: "Electric power generation and transmission were a bright spot.",
    },
  ],
  analysis: [
    "The top-line GDP number is flat, so the emotional read is not a crash; it is stagnation.",
    "Per-capita GDP looks better only because population declined, which should be shown as a caveat.",
    "The weak spots are business investment, residential investment, construction, manufacturing, and March goods output.",
    "The bright spots are household spending, compensation, corporate income, utilities, and the April advance estimate.",
    "For Canada Pulse, this release should raise the stress signal for productivity, housing, business investment, and youth outlook.",
  ],
};

export function getWeeklyPulseSummary(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
  }).format(date);

  return {
    title: "This week's Canada Pulse read",
    generatedFor: formatter.format(date),
    publishMode: weekday === "Friday" ? "friday-weekly-summary" : "daily-release-watch",
    headline: latestMajorEconomicRelease.title,
    summary: latestMajorEconomicRelease.plainEnglishSummary,
    highlights: [
      latestMajorEconomicRelease.readerTakeaway,
      "Growing components should be shown beside shrinking components so people can understand the release in one glance.",
      "The homepage should promote any major same-day release first, then keep the weekly pulse available every Friday.",
    ],
    llmPolicy:
      "LLM optional: use it to rewrite source-backed facts into clearer language, never to invent numbers. Deterministic rules choose the release, chart, status, and source links first.",
  };
}

export const economicReleaseSchedule = [
  {
    slug: "monthly-gdp-by-industry",
    name: "Monthly GDP by industry",
    source: "Statistics Canada",
    tableIds: ["36-10-0434-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "2026-06-30",
    expectedReferencePeriod: "April 2026, with advance estimate for May 2026",
    sourceUrl: "https://www150.statcan.gc.ca/n1/en/type/data",
    promoteOnHomepage: true,
  },
  {
    slug: "quarterly-gdp-income-expenditure",
    name: "GDP by income and expenditure",
    source: "Statistics Canada",
    tableIds: ["36-10-0104-01", "36-10-0112-01"],
    releaseCadence: "quarterly",
    nextReleaseDate: "2026-08-28",
    expectedReferencePeriod: "Q2 2026",
    sourceUrl: "https://www150.statcan.gc.ca/n1/en/type/data",
    promoteOnHomepage: true,
  },
  {
    slug: "labour-force-survey",
    name: "Labour Force Survey",
    source: "Statistics Canada",
    tableIds: ["14-10-0287-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "release-calendar",
    expectedReferencePeriod: "latest monthly labour market",
    sourceUrl: "https://www.statcan.gc.ca/en/survey/household/3701",
    promoteOnHomepage: true,
  },
  {
    slug: "consumer-price-index",
    name: "Consumer Price Index",
    source: "Statistics Canada",
    tableIds: ["18-10-0004-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "release-calendar",
    expectedReferencePeriod: "latest monthly CPI",
    sourceUrl: "https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes",
    promoteOnHomepage: true,
  },
];

export function getStatusClass(status: EconomicReleaseMetric["status"]) {
  switch (status) {
    case "hot":
      return "border-emerald-300/20 bg-emerald-500/10 text-emerald-100";
    case "weak":
      return "border-red-300/20 bg-red-500/10 text-red-100";
    case "watch":
      return "border-amber-300/20 bg-amber-500/10 text-amber-100";
    case "stable":
      return "border-sky-300/20 bg-sky-500/10 text-sky-100";
    default:
      return "border-white/10 bg-white/10 text-stone-100";
  }
}
