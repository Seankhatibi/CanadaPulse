import { buildReleaseIntelligence, getMetricMeaning } from "@/lib/release-intelligence";
import type { NormalizedRelease } from "@/lib/release-hub";

export type ReleaseStoryPoint = {
  label: string;
  value: number;
  display: string;
  direction: "up" | "down" | "neutral";
  meaning: "positive" | "negative" | "mixed";
  note: string;
};

function metric(release: NormalizedRelease, pattern: RegExp) {
  return buildReleaseIntelligence(release).metrics.find((item) => pattern.test(item.label));
}

function movementWord(direction: "up" | "down" | "neutral", up: string, down: string) {
  return direction === "up" ? up : direction === "down" ? down : "held at";
}

function editorialHeadline(release: NormalizedRelease) {
  const lower = release.title.toLowerCase();
  const intelligence = buildReleaseIntelligence(release);
  const main = intelligence.metrics[0];

  if (/labour force survey/.test(lower)) {
    const jobs = metric(release, /^employment$/i);
    const unemployment = metric(release, /unemployment rate/i);
    if (jobs && unemployment) return `Canada has ${jobs.display} people working. Unemployment is ${unemployment.display}.`;
  }
  if (/gross domestic product|\bgdp\b/.test(lower) && main) {
    return `Canada's economy ${movementWord(main.direction, "grew", "shrank")} ${main.display}. Here's what carried it.`;
  }
  if (/consumer price|inflation/.test(lower) && main) {
    return `Prices are up ${main.display}. See what is squeezing Canadian budgets.`;
  }
  if (/retail trade|retail sales/.test(lower) && main) {
    return `Canadians spent ${main.display} at retailers. See where demand moved.`;
  }
  if (release.releaseType === "cmhc-rental-market") {
    const rent = metric(release, /average two-bedroom rent/i);
    const vacancy = metric(release, /vacancy/i);
    if (rent && vacancy) return `Average two-bedroom rent is ${rent.display}. Vacancy is ${vacancy.display}.`;
  }
  if (release.releaseType === "valet-rate-observation") {
    const policy = metric(release, /policy rate/i);
    const yieldRate = metric(release, /5-year/i);
    if (policy && yieldRate) return `The policy rate is ${policy.display}. The five-year yield is ${yieldRate.display}.`;
  }
  if (release.source === "finance-canada") {
    const deficit = metric(release, /deficit/i);
    if (deficit) return `Ottawa's latest fiscal balance is ${deficit.display}. Follow the money underneath it.`;
  }
  if (release.source === "open-government-ircc") {
    const residents = metric(release, /permanent residents/i);
    if (residents) return `Canada admitted ${residents.display} permanent residents in the latest month.`;
  }
  return main ? `${main.label} is ${main.display}. See what changed underneath.` : release.title;
}

function visualPoints(release: NormalizedRelease): ReleaseStoryPoint[] {
  const movement = release.chartPayloads.find((chart) => chart.kind === "bar" && chart.points.length >= 2);
  const source = movement?.points ?? buildReleaseIntelligence(release).metrics;
  return source.slice(0, 6).map((point) => ({
    label: point.label,
    value: point.change ?? point.value,
    display: point.changeDisplay ?? point.display,
    direction: point.direction,
    meaning: getMetricMeaning(point, release.title),
    note: point.plainEnglish,
  }));
}

export function buildReleaseStory(release: NormalizedRelease) {
  const intelligence = buildReleaseIntelligence(release);
  const main = intelligence.metrics[0];
  const points = visualPoints(release);
  const pressure = points.find((point) => point.meaning === "negative");
  const relief = points.find((point) => point.meaning === "positive");

  return {
    headline: editorialHeadline(release),
    officialTitle: release.title,
    mainMetric: main?.display ?? "New",
    mainLabel: main?.label ?? "official release",
    mainChange: main?.changeDisplay,
    mainDirection: main?.direction ?? "neutral",
    mainMeaning: main?.meaning ?? "mixed",
    summary: release.plainEnglishSummary,
    verdict: intelligence.verdict,
    points,
    read: [
      pressure ? `Pressure: ${pressure.label} ${pressure.display}.` : null,
      relief ? `Relief: ${relief.label} ${relief.display}.` : null,
      ...intelligence.takeaways,
    ].filter((value): value is string => Boolean(value)).slice(0, 3),
  };
}
