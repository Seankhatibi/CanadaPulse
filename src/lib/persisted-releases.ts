import { getPrisma } from "@/lib/prisma";
import type { NormalizedRelease, ReleaseArea, ReleaseChartPayload, ReleaseFactStatus } from "@/lib/release-hub";

const releaseAreas = new Set<ReleaseArea>([
  "economy",
  "housing",
  "rates",
  "inflation",
  "labour",
  "immigration",
  "fiscal",
  "energy",
  "trade",
  "population",
  "other",
]);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function validStatus(value: unknown): ReleaseFactStatus {
  return value === "live" || value === "source_linked" || value === "summary_only" || value === "error"
    ? value
    : "summary_only";
}

function validCharts(value: unknown): ReleaseChartPayload[] {
  if (!Array.isArray(value)) return [];
  return value.filter((chart): chart is ReleaseChartPayload => {
    const candidate = record(chart);
    return typeof candidate.title === "string" && Array.isArray(candidate.points);
  });
}

function chartsFromStatCanSignals(facts: Record<string, unknown>): ReleaseChartPayload[] {
  if (!Array.isArray(facts.signals)) return [];
  const points = facts.signals.flatMap((value) => {
    const signal = record(value);
    const numeric = numberValue(signal.value, Number.NaN);
    if (!Number.isFinite(numeric) || typeof signal.label !== "string") return [];
    const direction: "up" | "down" | "neutral" = signal.direction === "up" || signal.direction === "down" ? signal.direction : "neutral";
    return [{
      label: signal.label,
      value: numeric,
      display: stringValue(signal.display, numeric.toLocaleString("en-CA")),
      direction,
      plainEnglish: stringValue(signal.explanation, `${signal.label}: ${stringValue(signal.display)}`),
      previous: typeof signal.previous === "number" ? signal.previous : null,
      previousDisplay: stringValue(signal.previousDisplay) || undefined,
      change: typeof signal.change === "number" ? signal.change : null,
      changeDisplay: stringValue(signal.changeDisplay) || undefined,
      period: stringValue(signal.period) || undefined,
      changePeriod: stringValue(signal.changePeriod) || undefined,
    }];
  });
  return points.length ? [{ title: "Official table breakdown", kind: "metric-strip", points }] : [];
}

type StoredRelease = Awaited<ReturnType<ReturnType<typeof getPrisma>["releaseEvent"]["findFirst"]>>;

export function normalizePersistedRelease(event: NonNullable<StoredRelease>): NormalizedRelease | null {
  const facts = record(event.facts);
  const source = event.source ?? stringValue(facts.source);
  const slug = event.slug ?? stringValue(facts.slug);
  if (!source || !slug) return null;

  const charts = validCharts(facts.chartPayloads);
  const chartPayloads = charts.length ? charts : chartsFromStatCanSignals(facts);
  const areas = stringArray(event.affectedIndicators ?? facts.affectedAreas)
    .filter((area): area is ReleaseArea => releaseAreas.has(area as ReleaseArea));
  const provinceBreakdown = Array.isArray(facts.provinceBreakdown)
    ? facts.provinceBreakdown.flatMap((value) => {
        const item = record(value);
        if (typeof item.province !== "string") return [];
        return [{
          province: item.province,
          value: stringValue(item.value, "n/a"),
          note: stringValue(item.note),
          score: numberValue(item.score),
        }];
      })
    : [];
  const sourceLinks = Array.isArray(facts.sourceLinks)
    ? facts.sourceLinks.flatMap((value) => {
        const item = record(value);
        return typeof item.url === "string"
          ? [{ label: stringValue(item.label, "Official source"), url: item.url }]
          : [];
      })
    : [{ label: "Official release", url: event.sourceUrl }];
  const summary = event.plainEnglishSummary ?? stringValue(facts.summary, "Official release captured by Canada Pulse.");
  const releaseDate = event.releaseDate.toISOString().slice(0, 10);

  return {
    id: event.id,
    slug,
    title: event.title,
    source,
    publisher: event.publisher ?? stringValue(facts.publisher, event.sourceDatasetId ? "Official source" : source),
    sourceUrl: event.sourceUrl,
    href: `/pulse-release/${source}/${slug}?date=${releaseDate}`,
    releaseType: event.releaseType ?? stringValue(facts.releaseType, "official-release"),
    releaseDate,
    referencePeriod: event.referencePeriod ?? stringValue(facts.referencePeriod, releaseDate),
    geographyLevel: event.geographyLevel === "federal" || event.geographyLevel === "province" || event.geographyLevel === "city"
      ? event.geographyLevel
      : "mixed",
    affectedAreas: areas,
    headlineFacts: stringArray(facts.headlineFacts).length ? stringArray(facts.headlineFacts) : [summary],
    provinceBreakdown,
    chartPayloads,
    sourceLinks,
    importanceScore: numberValue(facts.importanceScore, event.promoted ? 70 : 30),
    youthImpactScore: numberValue(facts.youthImpactScore),
    housingImpactScore: numberValue(facts.housingImpactScore),
    promoted: event.promoted,
    status: validStatus(event.status ?? facts.status ?? facts.sourceStatus),
    plainEnglishSummary: summary,
    socialSummary: event.socialSummary ?? summary,
  };
}

export async function findPersistedRelease(source: string, slug: string, releaseDate?: string) {
  if (!process.env.DATABASE_URL) return null;
  const prisma = getPrisma();
  const validReleaseDate = releaseDate && /^\d{4}-\d{2}-\d{2}$/.test(releaseDate) ? releaseDate : undefined;
  const dateFilter = validReleaseDate
    ? {
        gte: new Date(`${validReleaseDate}T00:00:00.000Z`),
        lt: new Date(`${validReleaseDate}T23:59:59.999Z`),
      }
    : undefined;
  const event = await prisma.releaseEvent.findFirst({
    where: { source, slug, releaseDate: dateFilter },
    orderBy: { releaseDate: "desc" },
  });
  return event ? normalizePersistedRelease(event) : null;
}

export async function getPersistedReleases(limit = 500) {
  if (!process.env.DATABASE_URL) return [];
  const prisma = getPrisma();
  const events = await prisma.releaseEvent.findMany({
    orderBy: { releaseDate: "desc" },
    take: limit,
  });
  return events.flatMap((event) => {
    const release = normalizePersistedRelease(event);
    return release ? [release] : [];
  });
}
