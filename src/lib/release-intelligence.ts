import { hasQualitativeAnalysis, hasStructuredMetrics, type NormalizedRelease, type ReleaseChartPayload } from "@/lib/release-hub";
import { rankComparableProvinceValues } from "@/lib/province-values";

export type MetricMeaning = "positive" | "negative" | "mixed";

export type ResearchMetric = ReleaseChartPayload["points"][number] & {
  meaning: MetricMeaning;
};

const negativeWhenRising = /unemployment|inflation|price|rent|mortgage|debt|cost|deficit|pressure|risk|gap/i;
const positiveWhenRising = /employment|participation|wage|compensation|productivity|starts|completions|exports|investment|income|access/i;

export function getMetricMeaning(point: ReleaseChartPayload["points"][number], releaseTitle = ""): MetricMeaning {
  if (point.direction === "neutral") return "mixed";
  const gdpValueMetric = /gross domestic product|\bgdp\b/i.test(releaseTitle)
    && /gross domestic product|market prices|output|exports|investment|compensation/i.test(point.label);
  if (gdpValueMetric) return point.direction === "up" ? "positive" : "negative";
  const cpiPressureMetric = /consumer price|inflation/i.test(releaseTitle)
    && /all-items|food|shelter|rent|gasoline|energy/i.test(point.label);
  if (cpiPressureMetric) return point.direction === "up" ? "negative" : "positive";
  if (negativeWhenRising.test(point.label)) return point.direction === "up" ? "negative" : "positive";
  if (positiveWhenRising.test(point.label)) return point.direction === "up" ? "positive" : "negative";
  return "mixed";
}

function uniqueMetrics(release: NormalizedRelease) {
  const metrics = release.chartPayloads
    .filter((chart) => chart.kind !== "qualitative")
    .flatMap((chart) => chart.points);
  const unique = new Map<string, (typeof metrics)[number]>();
  for (const metric of metrics) {
    const key = metric.label.trim().toLowerCase();
    const existing = unique.get(key);
    const existingLooksLikeChangeOnly = existing?.changeDisplay && existing.display === existing.changeDisplay;
    const candidateHasCurrentValue = !metric.changeDisplay || metric.display !== metric.changeDisplay;
    if (!existing || (existingLooksLikeChangeOnly && candidateHasCurrentValue)) unique.set(key, metric);
  }
  return [...unique.values()];
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
  const allMetrics: ResearchMetric[] = uniqueMetrics(release)
    .sort((a, b) => metricPriority(release, a.label) - metricPriority(release, b.label))
    .map((metric) => ({
      ...metric,
      meaning: getMetricMeaning(metric, release.title),
    }));
  const metrics = allMetrics.slice(0, 12);
  const positive = metrics.filter((metric) => metric.meaning === "positive");
  const negative = metrics.filter((metric) => metric.meaning === "negative");
  const mixed = metrics.filter((metric) => metric.meaning === "mixed");
  const provinceRank = rankComparableProvinceValues(release.provinceBreakdown);
  const primaryMovementChart = release.chartPayloads.find((chart) => chart.kind === "bar" && chart.points.some((point) => point.changeDisplay));
  const biggestMover = [...(primaryMovementChart?.points ?? [])]
    .filter((metric) => metric.change !== null && metric.change !== undefined && metric.changeDisplay)
    .sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0))[0];
  const provinceHigh = provinceRank[0];
  const provinceLow = provinceRank.at(-1);
  const standouts = [
    biggestMover ? `Largest loaded movement: ${biggestMover.label} ${biggestMover.changeDisplay}; latest value ${biggestMover.display}.` : null,
    provinceHigh && provinceLow && provinceHigh.province !== provinceLow.province
      ? `Province range: ${provinceHigh.province} is ${provinceHigh.value}, versus ${provinceLow.province} at ${provinceLow.value}.`
      : null,
  ].filter((value): value is string => Boolean(value));
  const metricTakeaways = metrics
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
    standouts,
    takeaways: [...new Set([...standouts, ...metricTakeaways])].slice(0, 5),
    evidenceLevel:
      release.status === "live" && hasStructuredMetrics(release)
        ? "Official values loaded"
        : release.status === "live" && hasQualitativeAnalysis(release)
          ? "Official report analyzed"
        : release.status === "summary_only"
          ? "Official release summary"
          : "Source monitor",
  };
}
