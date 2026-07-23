import { provinces } from "@/lib/province-directory";
import type { NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";

export type PopulationFlowId = "permanent-residents" | "study-permits" | "tfwp";

export type PopulationProvinceValue = {
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
};

export type PopulationFlowCategory = {
  id: PopulationFlowId;
  label: string;
  mapLabel: string;
  question: string;
  definition: string;
  lowColor: string;
  highColor: string;
  values: PopulationProvinceValue[];
};

export type PopulationExplorerData = {
  generatedAt: string;
  source: string;
  period: string;
  releaseDate: string;
  releaseHref: string;
  defaultProvince: string;
  categories: PopulationFlowCategory[];
};

const definitions: Array<{
  id: PopulationFlowId;
  label: string;
  chart: RegExp;
  question: string;
  definition: string;
  lowColor: string;
  highColor: string;
}> = [
  {
    id: "permanent-residents",
    label: "Permanent residents",
    chart: /permanent residents admitted by province/i,
    question: "Where did new permanent residents land?",
    definition: "Monthly permanent-resident admissions. This is a flow during the month, not the total immigrant population living in a province.",
    lowColor: "#155e75",
    highColor: "#fb7185",
  },
  {
    id: "study-permits",
    label: "Study permits",
    chart: /study permit holders.*by province/i,
    question: "Where did study permits become effective?",
    definition: "People with study permit(s) becoming effective in the month. It is not the stock of all international students currently present.",
    lowColor: "#0f766e",
    highColor: "#fbbf24",
  },
  {
    id: "tfwp",
    label: "TFWP permits",
    chart: /tfwp work permit holders.*by province/i,
    question: "Where did TFWP permits become effective?",
    definition: "Temporary Foreign Worker Program permit holders with permit(s) becoming effective in the month. Counts are source-rounded.",
    lowColor: "#1d4ed8",
    highColor: "#f43f5e",
  },
];

function direction(point: ReleaseChartPayload["points"][number]) {
  return point.direction === "up" ? "up" as const : point.direction === "down" ? "down" as const : "neutral" as const;
}

function buildCategory(
  definition: (typeof definitions)[number],
  chart: ReleaseChartPayload,
): PopulationFlowCategory | null {
  const rows = chart.points.flatMap((point) => {
    const province = provinces.find((item) => item.name === point.label);
    if (!province || !Number.isFinite(point.value)) return [];
    return [{ point, province }];
  });
  if (rows.length < 4) return null;

  const maximum = Math.max(...rows.map(({ point }) => point.value), 1);
  const ranked = rows
    .slice()
    .sort((left, right) => right.point.value - left.point.value)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return {
    id: definition.id,
    label: definition.label,
    mapLabel: definition.label,
    question: definition.question,
    definition: definition.definition,
    lowColor: definition.lowColor,
    highColor: definition.highColor,
    values: ranked.map(({ point, province, rank }) => ({
      province: province.name,
      slug: province.slug,
      abbr: province.abbr,
      value: point.value,
      display: point.display,
      note: point.plainEnglish,
      rank,
      rankOutOf: ranked.length,
      intensity: 0.18 + (point.value / maximum) * 0.82,
      direction: direction(point),
    })),
  };
}

export function buildPopulationExplorerData(
  release: NormalizedRelease,
  generatedAt: string,
): PopulationExplorerData {
  const categories = definitions.flatMap((definition) => {
    const chart = release.chartPayloads.find((candidate) => definition.chart.test(candidate.title));
    const category = chart ? buildCategory(definition, chart) : null;
    return category ? [category] : [];
  });

  return {
    generatedAt,
    source: release.publisher,
    period: release.referencePeriod,
    releaseDate: release.releaseDate,
    releaseHref: release.href,
    defaultProvince: categories.some((category) => category.values.some((value) => value.slug === "ontario"))
      ? "ontario"
      : categories[0]?.values[0]?.slug ?? "ontario",
    categories,
  };
}
