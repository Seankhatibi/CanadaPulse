import type { NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";

export type MetricMeaning = "positive" | "negative" | "mixed";

export type ResearchMetric = ReleaseChartPayload["points"][number] & {
  meaning: MetricMeaning;
};

const negativeWhenRising = /unemployment|inflation|price|rent|mortgage|debt|cost|deficit|pressure|risk|gap/i;
const positiveWhenRising = /employment|participation|wage|compensation|productivity|starts|completions|exports|investment|income|access/i;

export function getMetricMeaning(point: ReleaseChartPayload["points"][number]): MetricMeaning {
  if (point.direction === "neutral") return "mixed";
  if (negativeWhenRising.test(point.label)) return point.direction === "up" ? "negative" : "positive";
  if (positiveWhenRising.test(point.label)) return point.direction === "up" ? "positive" : "negative";
  return "mixed";
}

function uniqueMetrics(release: NormalizedRelease) {
  const metrics = release.chartPayloads
    .filter((chart) => chart.kind !== "qualitative")
    .flatMap((chart) => chart.points);
  return [...new Map(metrics.map((metric) => [`${metric.label}-${metric.display}`, metric])).values()];
}

function metricPriority(release: NormalizedRelease, label: string) {
  const title = release.title.toLowerCase();
  const priorities = /labour force survey/.test(title)
    ? [/^employment$/i, /unemployment rate/i, /participation rate/i, /full-time employment/i, /unemployment$/i, /part-time/i, /labour force/i, /population/i]
    : /retail/.test(title)
      ? [/retail sales/i, /volume/i, /motor vehicle/i, /food|grocery/i]
      : /consumer price|inflation/.test(title)
        ? [/all-items|headline|consumer price|inflation/i, /food/i, /shelter|rent/i, /energy|gasoline/i]
        : /gross domestic product|gdp/.test(title)
          ? [/gross domestic product|^gdp$/i, /per capita/i, /household/i, /business investment/i, /exports/i, /imports/i]
          : [];
  const index = priorities.findIndex((pattern) => pattern.test(label));
  return index === -1 ? priorities.length + 1 : index;
}

function releaseVerdict(release: NormalizedRelease, metrics: ResearchMetric[]) {
  const lower = release.title.toLowerCase();
  const find = (pattern: RegExp) => metrics.find((metric) => pattern.test(metric.label));

  if (/labour force survey/.test(lower)) {
    const employment = find(/^employment$/i);
    const unemploymentRate = find(/unemployment rate/i);
    if (employment && unemploymentRate) {
      return `Employment is ${employment.display}; unemployment is ${unemploymentRate.display}.`;
    }
  }

  if (/retail/.test(lower)) {
    const sales = find(/retail sales/i);
    return sales ? `Retail demand is running at ${sales.display}.` : "Consumer spending is the central signal in this release.";
  }

  if (/consumer price|inflation/.test(lower)) {
    const inflation = find(/inflation|consumer price/i);
    return inflation ? `Headline price pressure is ${inflation.display}.` : "The release updates Canada's inflation picture.";
  }

  if (/gross domestic product|gdp/.test(lower)) {
    const gdp = find(/gdp|gross domestic product/i);
    return gdp ? `The latest GDP signal is ${gdp.display}.` : "The release updates Canada's growth momentum.";
  }

  return release.headlineFacts[0] ?? release.plainEnglishSummary;
}

export function buildReleaseIntelligence(release: NormalizedRelease) {
  const metrics: ResearchMetric[] = uniqueMetrics(release)
    .sort((a, b) => metricPriority(release, a.label) - metricPriority(release, b.label))
    .slice(0, 12)
    .map((metric) => ({
      ...metric,
      meaning: getMetricMeaning(metric),
    }));
  const positive = metrics.filter((metric) => metric.meaning === "positive");
  const negative = metrics.filter((metric) => metric.meaning === "negative");
  const mixed = metrics.filter((metric) => metric.meaning === "mixed");
  const provinceRank = [...release.provinceBreakdown].sort((a, b) => b.score - a.score);
  const takeaways = metrics
    .filter((metric) => metric.changeDisplay || metric.plainEnglish)
    .slice(0, 5)
    .map((metric) =>
      metric.changeDisplay
        ? `${metric.label} is ${metric.display}, ${metric.changeDisplay} over ${metric.changePeriod ?? "the previous period"}.`
        : metric.plainEnglish,
    );

  return {
    verdict: releaseVerdict(release, metrics),
    metrics,
    positive,
    negative,
    mixed,
    provinceRank,
    takeaways: [...new Set(takeaways)],
    evidenceLevel:
      release.status === "live" && release.chartPayloads.some((chart) => chart.kind !== "qualitative" && chart.points.length)
        ? "Official values loaded"
        : release.status === "live" && release.chartPayloads.some((chart) => chart.kind === "qualitative" && chart.points.length)
          ? "Official report analyzed"
        : release.status === "summary_only"
          ? "Official release summary"
          : "Source monitor",
  };
}
