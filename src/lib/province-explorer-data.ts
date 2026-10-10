import { provinces } from "@/lib/province-directory";
import { parseComparableProvinceValue, rankComparableProvinceValues } from "@/lib/province-values";
import type { NormalizedRelease, ReleaseHubPayload } from "@/lib/release-hub";
import type { LifeSeries } from "@/lib/life-series";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";

export type ProvinceExplorerCategoryId = "jobs" | "rent" | "vacancy" | "prices" | "homes" | "newcomers" | "youth-jobs" | "youth-wages" | "primary-care" | "mental-health" | "community-belonging" | "tuition" | "food-insecurity" | "poverty" | "life-satisfaction" | `release:${string}` | `bill:${string}`;
export type MapTheme = "economy" | "housing" | "society" | "immigration" | "government" | "trade" | "energy";

export type ProvinceExplorerValue = {
  province: string;
  slug: string;
  abbr: string;
  value: number;
  display: string;
  note: string;
  rank: number;
  rankOutOf: number;
  intensity: number;
  direction: "up" | "down" | "neutral";
  href: string;
  changeDisplay?: string;
  changePeriod?: string;
};

export type ProvinceExplorerCategory = {
  id: ProvinceExplorerCategoryId;
  label: string;
  question: string;
  context: string;
  source: string;
  period: string;
  releaseDate: string;
  releaseHref: string;
  sourceUrl?: string;
  cohort?: string;
  highMeaning: "pressure" | "positive" | "neutral";
  lowColor: string;
  highColor: string;
  values: ProvinceExplorerValue[];
  theme?: MapTheme;
  measureId?: ProvinceExplorerCategoryId;
  headline?: string;
  whyItMatters?: string;
  cadence?: string;
  canada?: { value: number; display: string; label: string; period: string };
  national?: { display: string; label: string; note: string; href: string; kind: "metric" | "legislation" | "report"; changeDisplay?: string; changePeriod?: string; metrics?: { label: string; display: string; changeDisplay?: string }[] };
};

export type ProvinceExplorerData = {
  generatedAt: string;
  defaultProvince: string;
  categories: ProvinceExplorerCategory[];
  defaultCategory?: ProvinceExplorerCategoryId;
};

type CategoryDefinition = Omit<ProvinceExplorerCategory, "source" | "period" | "releaseDate" | "releaseHref" | "values"> & {
  find: (release: NormalizedRelease) => boolean;
  href: (provinceSlug: string) => string;
  rows?: (release: NormalizedRelease) => NormalizedRelease["provinceBreakdown"];
};

const definitions: CategoryDefinition[] = [
  {
    id: "jobs",
    label: "Jobs",
    question: "Where is finding work hardest?",
    context: "Latest provincial unemployment rate. A higher value signals more labour-market pressure.",
    highMeaning: "pressure",
    lowColor: "#22d3ee",
    highColor: "#ef4444",
    find: (release) => /labour force survey/i.test(release.title),
    href: (slug) => `/province/${slug}`,
  },
  {
    id: "rent",
    label: "Rent",
    question: "Where does rent hit hardest?",
    context: "Average two-bedroom purpose-built rent from CMHC's latest Rental Market Survey.",
    highMeaning: "pressure",
    lowColor: "#34d399",
    highColor: "#f59e0b",
    find: (release) => release.releaseType === "cmhc-rental-market",
    href: (slug) => `/province/${slug}/housing`,
  },
  {
    id: "vacancy",
    label: "Vacancy",
    question: "Where do renters have more choice?",
    context: "Purpose-built rental vacancy rate from CMHC's latest Rental Market Survey. Lower vacancy usually signals a tighter market.",
    highMeaning: "positive",
    lowColor: "#ef4444",
    highColor: "#10b981",
    find: (release) => release.releaseType === "cmhc-rental-market",
    rows: (release) => {
      const chart = release.chartPayloads.find((item) => /vacancy rate by province/i.test(item.title));
      return chart?.points.map((point) => ({
        province: point.label,
        value: point.display,
        note: point.plainEnglish,
        score: Math.round(point.value * 10),
      })) ?? [];
    },
    href: (slug) => `/province/${slug}/housing`,
  },
  {
    id: "prices",
    label: "Inflation",
    question: "Where are prices rising fastest?",
    context: "Latest provincial all-items Consumer Price Index change from Statistics Canada.",
    highMeaning: "pressure",
    lowColor: "#38bdf8",
    highColor: "#f43f5e",
    find: (release) => release.releaseType === "statcan-cpi-watch",
    href: (slug) => `/province/${slug}`,
  },
  {
    id: "homes",
    label: "New homes",
    question: "Where is the housing pipeline moving?",
    context: "Latest quarterly housing starts, an absolute count. Larger provinces may have more starts because they have more people. Starts are not completed homes.",
    highMeaning: "neutral",
    lowColor: "#fb7185",
    highColor: "#10b981",
    find: (release) => release.releaseType === "housing-release-monitor",
    href: (slug) => `/province/${slug}/housing`,
  },
  {
    id: "newcomers",
    label: "Newcomers",
    question: "Where are newcomers settling?",
    context: "Latest monthly permanent-resident admissions. This is a flow count, not total population.",
    highMeaning: "neutral",
    lowColor: "#64748b",
    highColor: "#06b6d4",
    find: (release) => release.source === "open-government-ircc" && release.releaseType === "ircc-monthly-immigration",
    href: (slug) => `/population/${slug}`,
  },
];

function directionFromNote(note: string): ProvinceExplorerValue["direction"] {
  if (/\b(up|rose|increased|higher|grew|gained)\b/i.test(note)) return "up";
  if (/\b(down|fell|decreased|lower|declined|lost)\b/i.test(note)) return "down";
  return "neutral";
}

function buildCategory(definition: CategoryDefinition, release: NormalizedRelease): ProvinceExplorerCategory | null {
  const ranked = rankComparableProvinceValues(definition.rows?.(release) ?? release.provinceBreakdown);
  if (ranked.length < 4) return null;

  const values = ranked.map((row) => row.comparableValue);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(maximum - minimum, 1);

  const provinceValues = ranked.flatMap((row) => {
    const province = provinces.find((item) => item.name === row.province);
    const value = parseComparableProvinceValue(row.value);
    if (!province || value === null) return [];

    return [{
      province: row.province,
      slug: province.slug,
      abbr: province.abbr,
      value,
      display: row.value,
      note: row.note,
      rank: row.comparableRank,
      rankOutOf: ranked.length,
      intensity: 0.18 + ((value - minimum) / range) * 0.82,
      direction: directionFromNote(row.note),
      href: definition.href(province.slug),
    } satisfies ProvinceExplorerValue];
  });

  const nationalPatterns: Partial<Record<ProvinceExplorerCategoryId, RegExp>> = {
    jobs: /^Unemployment rate$/i, rent: /^Average two-bedroom rent$/i,
    vacancy: /^Rental vacancy rate$/i, prices: /^All-items$/i,
    newcomers: /^Permanent residents admitted$/i, homes: /^Housing starts$/i,
  };
  const nationalPattern = nationalPatterns[definition.id];
  const nationalMetric = nationalPattern ? buildReleaseIntelligence(release).metrics.find((metric) => nationalPattern.test(metric.label) && metric.provenance !== "qualitative" && Number.isFinite(metric.value)) : undefined;
  return {
    id: definition.id,
    label: definition.label,
    question: definition.question,
    context: definition.context,
    source: release.publisher,
    period: release.referencePeriod,
    releaseDate: release.releaseDate,
    releaseHref: release.href,
    sourceUrl: release.sourceUrl,
    highMeaning: definition.highMeaning,
    lowColor: definition.lowColor,
    highColor: definition.highColor,
    values: provinceValues,
    canada: nationalMetric ? { value: nationalMetric.value, display: nationalMetric.display, label: "Canada", period: nationalMetric.period ?? release.referencePeriod } : undefined,
  };
}

export function buildProvinceExplorerData(releaseHub: ReleaseHubPayload, series: LifeSeries[] = []): ProvinceExplorerData {
  const liveReleases = releaseHub.todayQueue.filter((release) => release.status === "live");
  const categories = definitions.flatMap((definition) => {
    const release = liveReleases.find(definition.find);
    if (!release) return [];
    const category = buildCategory(definition, release);
    return category ? [category] : [];
  });

  return {
    generatedAt: releaseHub.generatedAt,
    defaultProvince: categories.some((category) => category.values.some((value) => value.slug === "ontario")) ? "ontario" : categories[0]?.values[0]?.slug ?? "ontario",
    categories: [...buildLifeMapCategories(series), ...categories],
  };
}

export function buildLifeMapCategories(series: LifeSeries[]): ProvinceExplorerCategory[] {
  const layers = [
    { id: "youth-jobs" as const, label: "Youth jobs", question: "Where is entering work harder?", highMeaning: "pressure" as const, lowColor: "#22d3ee", highColor: "#fb7185", href: "/work" },
    { id: "youth-wages" as const, label: "Youth pay", question: "What do young employees earn per hour?", highMeaning: "neutral" as const, lowColor: "#38bdf8", highColor: "#a78bfa", href: "/work" },
    { id: "primary-care" as const, label: "Care access", question: "Do young adults have a regular healthcare provider?", highMeaning: "positive" as const, lowColor: "#f59e0b", highColor: "#2dd4bf", href: "/quality-of-life" },
    { id: "mental-health" as const, label: "Mental health", question: "How are young adults feeling?", highMeaning: "positive" as const, lowColor: "#c084fc", highColor: "#2dd4bf", href: "/quality-of-life" },
    { id: "community-belonging" as const, label: "Belonging", question: "Do young adults feel connected to their community?", highMeaning: "positive" as const, lowColor: "#fbbf24", highColor: "#34d399", href: "/quality-of-life" },
    { id: "tuition" as const, label: "Tuition", question: "What does university tuition cost?", highMeaning: "pressure" as const, lowColor: "#67e8f9", highColor: "#fb923c", href: "/work" },
    { id: "food-insecurity" as const, label: "Food access", question: "Who is struggling to afford food?", highMeaning: "pressure" as const, lowColor: "#2dd4bf", highColor: "#fb7185", href: "/quality-of-life" },
    { id: "poverty" as const, label: "Poverty", question: "Who is below the essential-cost threshold?", highMeaning: "pressure" as const, lowColor: "#67e8f9", highColor: "#f472b6", href: "/quality-of-life" },
    { id: "life-satisfaction" as const, label: "Life satisfaction", question: "How do Canadians rate their lives?", highMeaning: "positive" as const, lowColor: "#a78bfa", highColor: "#34d399", href: "/quality-of-life" },
  ];
  return layers.flatMap((layer) => {
    const dataset = series.find((item) => item.id === layer.id && item.status === "loaded");
    const national = dataset?.rows.find((row) => /^Canada/.test(row.geography));
    const period = national?.points.at(-1)?.period;
    if (!dataset || !period) return [];
    const rows = dataset.rows.flatMap((row) => {
      const province = provinces.find((item) => item.name === row.geography);
      const point = row.points.find((item) => item.period === period);
      if (!province || !point || !Number.isFinite(point.value)) return [];
      const previousDate = new Date(period);
      const months = dataset.cadence === "Monthly" ? 1 : dataset.cadence === "Quarterly" ? 3 : dataset.cadence === "Annual" ? 12 : 0;
      previousDate.setUTCMonth(previousDate.getUTCMonth() - months);
      const previousPeriod = previousDate.toISOString().slice(0, 10);
      const previous = months ? row.points.find((item) => item.period === previousPeriod) : undefined;
      const difference = previous ? point.value - previous.value : undefined;
      const changeDisplay = difference === undefined ? undefined : `${difference > 0 ? "+" : ""}${difference.toFixed(dataset.unit === "$/hour" ? 2 : dataset.unit === "$" ? 0 : 1)}${dataset.unit === "%" ? " percentage points" : dataset.unit === "$/hour" ? " CAD/hr" : dataset.unit === "$" ? " CAD" : " points"}`;
      return [{ province, value: point.value, changeDisplay, changePeriod: previous ? previousPeriod : undefined }];
    }).sort((a, b) => b.value - a.value);
    if (rows.length < 4) return [];
    const minimum = Math.min(...rows.map((row) => row.value));
    const maximum = Math.max(...rows.map((row) => row.value));
    const range = maximum - minimum;
    const nationalPoint = national?.points.find((point) => point.period === period);
    const format = (value: number) => dataset.unit === "$/hour" ? `$${value.toFixed(2)}/hr` : dataset.unit === "$" ? `$${Math.round(value).toLocaleString("en-CA")}` : `${value.toFixed(1)}${dataset.unit}`;
    return [{
      ...layer, context: `${dataset.title} · ${dataset.cohort}. ${dataset.implication} ${dataset.limitation}`,
      source: "Statistics Canada", sourceUrl: dataset.sourceUrl, cohort: dataset.cohort,
      whyItMatters: dataset.implication, cadence: dataset.cadence,
      theme: dataset.topic === "community" ? "society" : "economy",
      period: new Intl.DateTimeFormat("en-CA", { month: ["Monthly", "Quarterly"].includes(dataset.cadence) ? "long" : undefined, year: "numeric", timeZone: "UTC" }).format(new Date(period)),
      releaseDate: "", releaseHref: layer.href,
      canada: nationalPoint && Number.isFinite(nationalPoint.value) ? { value: nationalPoint.value, display: format(nationalPoint.value), label: national!.geography, period } : undefined,
      values: rows.map((row) => ({
        province: row.province.name, slug: row.province.slug, abbr: row.province.abbr, value: row.value,
        display: dataset.unit === "$/hour" ? `$${row.value.toFixed(2)}/hr` : dataset.unit === "$" ? `$${Math.round(row.value).toLocaleString("en-CA")}` : `${row.value.toFixed(1)}${dataset.unit}`,
        changeDisplay: row.changeDisplay, changePeriod: row.changePeriod,
        note: `${dataset.cohort}. Same observation period across provinces; highest-to-lowest rank is not a personal outcome.`,
        rank: 1 + rows.filter((other) => other.value > row.value).length, rankOutOf: rows.length,
        intensity: range > 0 ? (row.value - minimum) / range : .5, direction: "neutral" as const, href: layer.href,
      })),
    }];
  });
}
