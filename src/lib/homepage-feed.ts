import { hasStructuredMetrics, type NormalizedRelease, type ReleaseHubPayload } from "@/lib/release-hub";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";

export type HomepageVisualPoint = {
  label: string;
  value: number;
  display: string;
  rank?: number;
  note?: string;
  direction?: "up" | "down" | "neutral";
  meaning?: "good" | "bad" | "mixed";
};

export type HomepageFeedItem = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  metric: string;
  metricLabel: string;
  visualType: "bar" | "rank" | "split" | "meter";
  visualPoints: HomepageVisualPoint[];
  provincePoints: HomepageVisualPoint[];
  source: string;
  period: string;
  href: string;
  shareText: string;
  trustStatus: "live" | "source-linked" | "fallback";
  priority: number;
  tone: "red" | "amber" | "blue" | "green" | "white" | "violet" | "cyan";
  whyItMatters?: string;
  severity?: number;
};

export type HomepageFeed = {
  debateItems: HomepageFeedItem[];
  releases: NormalizedRelease[];
};

function pointMeaning(label: string, direction?: "up" | "down" | "neutral") {
  if (!direction || direction === "neutral") return "mixed" as const;
  const negativeWhenRising = /unemployment|inflation|consumer price|home price|rent|mortgage|debt|cost|deficit|pressure|risk|gap/i.test(label);
  const positiveWhenRising = /employment|participation|wage|productivity|starts|completions|exports|investment|income|access/i.test(label);
  if (negativeWhenRising) return direction === "up" ? "bad" as const : "good" as const;
  if (positiveWhenRising) return direction === "up" ? "good" as const : "bad" as const;
  return "mixed" as const;
}

function releaseToStory(release: NormalizedRelease, topic: string, headline: string, tone: HomepageFeedItem["tone"]): HomepageFeedItem {
  const intelligence = buildReleaseIntelligence(release);
  const metrics = intelligence.metrics.slice(0, 5);
  const main = metrics[0];
  const hasOfficialProvinceRows = ["statcan", "cmhc", "open-government-ircc"].includes(release.source);

  return {
    id: `${topic.toLowerCase().replace(/\s+/g, "-")}-${release.id}`,
    topic,
    headline,
    dek: release.plainEnglishSummary,
    metric: main?.display ?? "New",
    metricLabel: main?.label ?? "official release",
    visualType: hasOfficialProvinceRows && release.provinceBreakdown.length >= 4 ? "rank" : "bar",
    visualPoints: metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      display: metric.display,
      note: metric.plainEnglish,
      direction: metric.direction,
      meaning: pointMeaning(metric.label, metric.direction),
    })),
    provincePoints: hasOfficialProvinceRows ? intelligence.provinceRank.slice(0, 6).map((province) => ({
      label: province.province,
      value: province.comparableValue,
      display: province.value,
      rank: province.comparableRank,
      note: province.note,
      direction: "neutral",
      meaning: "mixed",
    })) : [],
    source: release.publisher,
    period: release.releaseDate,
    href: release.href,
    shareText: release.socialSummary,
    trustStatus: release.status === "live" && !release.archiveFallback ? "live" : "source-linked",
    priority: release.importanceScore,
    tone,
    whyItMatters: intelligence.verdict,
    severity: Math.max(release.importanceScore, release.youthImpactScore, release.housingImpactScore),
  };
}

function findRelease(releases: NormalizedRelease[], predicate: (release: NormalizedRelease) => boolean) {
  return releases.find((release) => release.status === "live" && hasStructuredMetrics(release) && predicate(release));
}

export function buildHomepageFeed({ releaseHub }: { releaseHub: ReleaseHubPayload; gasMetric?: string; gasNote?: string }): HomepageFeed {
  const releases = releaseHub.todayQueue;
  const candidates = [
    { topic: "Jobs", headline: "Is Canada's labour market getting stronger or weaker?", tone: "violet" as const, release: findRelease(releases, (item) => /labour force survey/i.test(item.title)) },
    { topic: "Housing", headline: "What happened to rent and rental vacancy?", tone: "red" as const, release: findRelease(releases, (item) => item.releaseType === "cmhc-rental-market") },
    { topic: "Rates", headline: "What are borrowing conditions doing to households?", tone: "amber" as const, release: findRelease(releases, (item) => item.releaseType === "valet-rate-observation") },
    { topic: "Population", headline: "Which official population datasets changed?", tone: "cyan" as const, release: findRelease(releases, (item) => item.source === "open-government-ircc") },
    { topic: "Prices", headline: "What is getting more expensive fastest?", tone: "amber" as const, release: findRelease(releases, (item) => item.releaseType === "statcan-cpi-watch") },
    { topic: "Trade", headline: "Are Canadian exports strengthening or weakening?", tone: "blue" as const, release: findRelease(releases, (item) => /international merchandise trade|merchandise trade/i.test(item.title)) },
    {
      topic: "Energy",
      headline: "What changed in Canada's energy system?",
      tone: "green" as const,
      release: findRelease(releases, (item) => item.source === "cer-nrcan" && item.chartPayloads.some((chart) => chart.points.some((point) => /production|generation|electricity|price|export|emission|capacity/i.test(point.label)))),
    },
    { topic: "Government money", headline: "How much is Ottawa collecting, spending and borrowing?", tone: "blue" as const, release: findRelease(releases, (item) => item.source === "finance-canada") },
  ];

  return {
    debateItems: candidates.flatMap((candidate) => candidate.release ? [releaseToStory(candidate.release, candidate.topic, candidate.headline, candidate.tone)] : []),
    releases,
  };
}
