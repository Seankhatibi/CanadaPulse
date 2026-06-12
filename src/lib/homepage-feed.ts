import type { ReleaseHubPayload, NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";
import { issues, type Issue } from "@/lib/issue-data";
import { livePressureTrackers } from "@/lib/canada-pulse-data";

export type HomepageVisualPoint = {
  label: string;
  value: number;
  display: string;
  note?: string;
  direction?: "up" | "down" | "neutral";
};

export type HomepageTrustStatus = "live" | "source-linked" | "fallback";

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
  trustStatus: HomepageTrustStatus;
  priority: number;
  tone: "red" | "amber" | "blue" | "green" | "white" | "violet" | "cyan";
};

export type HomepageFeed = {
  hero: {
    headline: string;
    dek: string;
    score: number;
    scoreTrend: string;
    href: string;
    signals: HomepageFeedItem[];
  };
  leadStory: HomepageFeedItem;
  debateItems: HomepageFeedItem[];
  provinceRanking: {
    headline: string;
    dek: string;
    source: string;
    period: string;
    href: string;
    issueTitle: string;
    points: HomepageVisualPoint[];
  };
  releases: NormalizedRelease[];
};

function releaseStatusToTrust(status: NormalizedRelease["status"]): HomepageTrustStatus {
  if (status === "live") return "live";
  if (status === "source_linked" || status === "summary_only") return "source-linked";
  return "fallback";
}

function usableReleaseChart(release: NormalizedRelease): ReleaseChartPayload | null {
  return release.chartPayloads.find((chart) => chart.points.length >= 2) ?? null;
}

function isNormalPersonRelease(release: NormalizedRelease) {
  const chart = usableReleaseChart(release);
  const title = release.title.toLowerCase();

  if (release.status !== "live" || !chart) return false;
  if (title.includes("source stack") || title.includes("open data watch")) return false;

  const hasConfusingZeroHook =
    release.affectedAreas.includes("housing") &&
    chart.points.slice(0, 2).some((point) => point.value === 0 || point.display.trim() === "0");

  return !hasConfusingZeroHook;
}

function releaseToStory(release: NormalizedRelease): HomepageFeedItem {
  const chart = usableReleaseChart(release);
  const points =
    chart?.points.slice(0, 5).map((point) => ({
      label: point.label,
      value: point.value,
      display: point.display,
      note: point.plainEnglish,
      direction: point.direction,
    })) ?? [];
  const metricPoint = points[0];
  const area = release.affectedAreas[0] ?? "economy";

  return {
    id: release.id,
    topic: area[0].toUpperCase() + area.slice(1),
    headline: release.title,
    dek: release.plainEnglishSummary,
    metric: metricPoint?.display ?? release.headlineFacts[0]?.split(":").at(-1)?.trim() ?? "New",
    metricLabel: metricPoint?.label ?? "official data release",
    visualType: chart?.kind === "province-rank" ? "rank" : "bar",
    visualPoints: points,
    provincePoints: release.provinceBreakdown.slice(0, 6).map((province) => ({
      label: province.province,
      value: province.score,
      display: province.value,
      note: province.note,
      direction: "neutral",
    })),
    source: release.publisher,
    period: release.referencePeriod,
    href: release.href,
    shareText: release.socialSummary,
    trustStatus: releaseStatusToTrust(release.status),
    priority: release.importanceScore,
    tone: release.affectedAreas.includes("housing")
      ? "red"
      : release.affectedAreas.includes("rates") || release.affectedAreas.includes("fiscal")
        ? "amber"
        : release.affectedAreas.includes("population")
          ? "cyan"
          : release.affectedAreas.includes("labour")
            ? "violet"
            : "blue",
  };
}

function issueToStory(issue: Issue, overrides: Partial<HomepageFeedItem> = {}): HomepageFeedItem {
  return {
    id: issue.slug,
    topic: issue.title,
    headline: issue.question,
    dek: issue.movement,
    metric: issue.nationalValue,
    metricLabel: issue.nationalLabel,
    visualType: "rank",
    visualPoints: issue.components.slice(0, 5).map((component) => ({
      label: component.label,
      value: component.numeric,
      display: component.value,
      note: component.note,
      direction: component.numeric < 0 ? "down" : "up",
    })),
    provincePoints: issue.provinceValues.slice(0, 7).map((province) => ({
      label: province.abbr,
      value: province.numeric,
      display: province.value,
      note: province.province,
      direction: province.numeric < 0 ? "down" : "up",
    })),
    source: issue.source,
    period: "latest available",
    href: `/issue/${issue.slug}`,
    shareText: `${issue.question} ${issue.nationalValue} ${issue.nationalLabel}. Source: ${issue.source}.`,
    trustStatus: issue.source.toLowerCase().includes("model") || issue.source.toLowerCase().includes("ready") ? "fallback" : "source-linked",
    priority: 70,
    tone: "red",
    ...overrides,
  };
}

function findIssue(slug: string) {
  const issue = issues.find((item) => item.slug === slug);
  if (!issue) {
    throw new Error(`Missing homepage issue: ${slug}`);
  }
  return issue;
}

function trackerStory(label: string, overrides: Partial<HomepageFeedItem>): HomepageFeedItem {
  const tracker = livePressureTrackers.find((item) => item.label === label);
  if (!tracker) {
    return issueToStory(findIssue("productivity"), overrides);
  }

  return {
    id: tracker.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    topic: tracker.label,
    headline: tracker.question,
    dek: `${tracker.change} | ${tracker.cadence}`,
    metric: tracker.value,
    metricLabel: tracker.label,
    visualType: "meter",
    visualPoints: [
      { label: tracker.label, value: 72, display: tracker.value, note: tracker.change, direction: "up" },
      { label: tracker.cadence, value: 44, display: tracker.source, note: "source watch", direction: "neutral" },
    ],
    provincePoints: [],
    source: tracker.source,
    period: tracker.cadence,
    href: tracker.href,
    shareText: `${tracker.question} Canada Pulse is tracking ${tracker.value} from ${tracker.source}.`,
    trustStatus: "source-linked",
    priority: 60,
    tone: "amber",
    ...overrides,
  };
}

function buildDebateItems(releaseHub: ReleaseHubPayload, gasMetric?: string, gasNote?: string) {
  const bankRelease = releaseHub.todayQueue.find((release) => release.source === "bank-of-canada");
  const bankStory = bankRelease ? releaseToStory(bankRelease) : trackerStory("Mortgage stress", {});

  return [
    issueToStory(findIssue("population-vs-housing"), {
      id: "housing-capacity",
      topic: "Housing",
      headline: "Are Canadians adding people faster than homes?",
      tone: "red",
      href: "/population",
      priority: 96,
    }),
    issueToStory(findIssue("food-inflation"), {
      topic: "Food",
      headline: "What is still pushing up the grocery cart?",
      tone: "amber",
      priority: 92,
    }),
    issueToStory(findIssue("youth-jobs"), {
      topic: "Jobs",
      headline: "Can young Canadians still get a foothold?",
      tone: "violet",
      priority: 90,
    }),
    issueToStory(findIssue("tax-receipt"), {
      topic: "Taxes",
      headline: "Same salary, different province. Who keeps more?",
      tone: "green",
      priority: 88,
      href: "/tax-dollar",
    }),
    {
      ...bankStory,
      id: "rates-watch",
      topic: "Rates",
      headline: "What do rates mean for mortgage pressure?",
      tone: "amber" as const,
      priority: 86,
    },
    trackerStory("Gas and energy", {
      id: "energy-cost",
      topic: "Energy",
      headline: "Where are driving and power costs biting hardest?",
      metric: gasMetric ?? "Watching",
      metricLabel: gasNote ?? "gas and energy pulse",
      tone: "green",
      priority: 82,
      href: "/energy",
    }),
    issueToStory(findIssue("equalization-epp"), {
      topic: "Government money",
      headline: "Who receives the biggest federal transfer pool?",
      tone: "blue",
      priority: 80,
    }),
    trackerStory("Healthcare access", {
      id: "healthcare-capacity",
      topic: "Health",
      headline: "Can healthcare absorb population and aging pressure?",
      tone: "red",
      priority: 74,
      href: "/health",
    }),
  ];
}

export function buildHomepageFeed({
  releaseHub,
  gasMetric,
  gasNote,
}: {
  releaseHub: ReleaseHubPayload;
  gasMetric?: string;
  gasNote?: string;
}): HomepageFeed {
  const releases = Array.from(
    new Map(
      [releaseHub.promotedRelease, ...releaseHub.todayQueue]
    .filter((release): release is NormalizedRelease => Boolean(release))
        .map((release) => [release.id, release]),
    ).values(),
  ).sort((a, b) => b.importanceScore - a.importanceScore);
  const releaseLead = releases.find(isNormalPersonRelease);
  const curatedLead = issueToStory(findIssue("population-vs-housing"), {
    id: "lead-population-vs-housing",
    topic: "Housing",
    headline: "Canada's biggest argument is really a capacity question.",
    dek: "Population, housing completions, jobs, healthcare and infrastructure have to be read together. One number alone will mislead you.",
    metric: "People vs homes",
    metricLabel: "capacity pressure",
    href: "/population",
    tone: "red",
    priority: 100,
  });
  const leadStory = releaseLead ? releaseToStory(releaseLead) : curatedLead;
  const debateItems = buildDebateItems(releaseHub, gasMetric, gasNote);
  const topSignals = [
    debateItems.find((item) => item.topic === "Housing"),
    debateItems.find((item) => item.topic === "Food"),
    debateItems.find((item) => item.topic === "Rates"),
  ].filter((item): item is HomepageFeedItem => Boolean(item));
  const rankingIssue = findIssue("rent-burden");

  return {
    hero: {
      headline: "Canada's data pulse today",
      dek: "The numbers behind what Canadians are arguing about right now.",
      score: 61,
      scoreTrend: "Declining: housing, youth affordability and healthcare are dragging the signal.",
      href: leadStory.href,
      signals: topSignals,
    },
    leadStory,
    debateItems,
    provinceRanking: {
      headline: "Who is hit hardest?",
      dek: "Default view: rent burden. Switch into the topic pages or compare tool for deeper province battles.",
      source: rankingIssue.source,
      period: "latest available",
      href: "/compare",
      issueTitle: rankingIssue.title,
      points: rankingIssue.provinceValues.slice(0, 8).map((province) => ({
        label: province.province,
        value: province.numeric,
        display: province.value,
        note: province.note,
        direction: "up",
      })),
    },
    releases,
  };
}
