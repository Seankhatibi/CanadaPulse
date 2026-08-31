import { provinces } from "@/lib/province-directory";
import { parseComparableProvinceValue, rankComparableProvinceValues } from "@/lib/province-values";
import type { NormalizedRelease, ReleaseHubPayload } from "@/lib/release-hub";

export type ProvinceExplorerCategoryId = "jobs" | "rent" | "vacancy" | "prices" | "homes" | "newcomers";

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
  highMeaning: "pressure" | "positive" | "neutral";
  lowColor: string;
  highColor: string;
  values: ProvinceExplorerValue[];
};

export type ProvinceExplorerData = {
  generatedAt: string;
  defaultProvince: string;
  categories: ProvinceExplorerCategory[];
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
    context: "Latest quarterly housing starts. Starts show construction entering the pipeline, not completed homes.",
    highMeaning: "positive",
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

  return {
    id: definition.id,
    label: definition.label,
    question: definition.question,
    context: definition.context,
    source: release.publisher,
    period: release.referencePeriod,
    releaseDate: release.releaseDate,
    releaseHref: release.href,
    highMeaning: definition.highMeaning,
    lowColor: definition.lowColor,
    highColor: definition.highColor,
    values: provinceValues,
  };
}

export function buildProvinceExplorerData(releaseHub: ReleaseHubPayload): ProvinceExplorerData {
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
    categories,
  };
}
