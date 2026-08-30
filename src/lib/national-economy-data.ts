import { buildReleaseIntelligence, type ResearchMetric } from "@/lib/release-intelligence";
import { hasStructuredMetrics, type NormalizedRelease, type ReleaseHubPayload } from "@/lib/release-hub";

export type EconomySection = {
  id: "growth" | "jobs" | "prices" | "spending" | "rates";
  eyebrow: string;
  title: string;
  question: string;
  release: NormalizedRelease;
  metrics: ResearchMetric[];
  lead: ResearchMetric;
};

export type NationalEconomyData = {
  generatedAt: string;
  sections: EconomySection[];
};

const definitions: Array<{
  id: EconomySection["id"];
  eyebrow: string;
  title: string;
  question: string;
  find: (release: NormalizedRelease) => boolean;
}> = [
  {
    id: "growth",
    eyebrow: "Growth",
    title: "Is Canada producing more?",
    question: "GDP shows whether the economy is expanding after inflation is removed.",
    find: (release) => /gross domestic product, income and expenditure/i.test(release.title),
  },
  {
    id: "jobs",
    eyebrow: "Work",
    title: "Is it getting easier to find a job?",
    question: "Employment, unemployment and participation reveal whether opportunity is broadening or tightening.",
    find: (release) => /labour force survey/i.test(release.title),
  },
  {
    id: "prices",
    eyebrow: "Cost of living",
    title: "What is still getting more expensive?",
    question: "Headline inflation can cool while food, rent or other essentials continue to squeeze a paycheque.",
    find: (release) => release.releaseType === "statcan-cpi-watch" || /consumer price index/i.test(release.title),
  },
  {
    id: "spending",
    eyebrow: "Household demand",
    title: "Are Canadians still spending?",
    question: "Retail sales are a near-term read on household demand, but higher sales can also reflect higher prices.",
    find: (release) => /retail trade|retail sales/i.test(release.title),
  },
  {
    id: "rates",
    eyebrow: "Borrowing pressure",
    title: "What does money cost right now?",
    question: "The policy rate and bond yields flow into mortgages, business credit, rents and the Canadian dollar.",
    find: (release) => release.releaseType === "valet-rate-observation",
  },
];

function pickLead(id: EconomySection["id"], metrics: ResearchMetric[]) {
  const patterns: Record<EconomySection["id"], RegExp[]> = {
    growth: [/^gdp$/i, /gross domestic product/i],
    jobs: [/unemployment rate/i, /^employment$/i],
    prices: [/all-items/i, /consumer price|inflation/i],
    spending: [/retail sales/i, /retail trade/i],
    rates: [/policy interest rate|policy rate|overnight rate/i, /government.*5-year|5-year/i],
  };
  for (const pattern of patterns[id]) {
    const metric = metrics.find((item) => pattern.test(item.label));
    if (metric) return metric;
  }
  return metrics[0];
}

export function buildNationalEconomyData(hub: ReleaseHubPayload): NationalEconomyData {
  const live = hub.todayQueue.filter((release) => release.status === "live" && hasStructuredMetrics(release));
  const sections = definitions.flatMap((definition) => {
    const release = live.find(definition.find);
    if (!release) return [];
    const intelligence = buildReleaseIntelligence(release);
    const lead = pickLead(definition.id, intelligence.metrics);
    if (!lead) return [];
    return [{
      id: definition.id,
      eyebrow: definition.eyebrow,
      title: definition.title,
      question: definition.question,
      release,
      metrics: intelligence.metrics.slice(0, definition.id === "growth" ? 7 : 5),
      lead,
    } satisfies EconomySection];
  });

  return { generatedAt: hub.generatedAt, sections };
}
