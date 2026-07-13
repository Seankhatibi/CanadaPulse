import { getPrisma } from "@/lib/prisma";
import { prismaStatusToPublic, sourceStatusToPublic, type PublicIndicatorValue } from "@/lib/data-status";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export async function getDbIndicatorValues({
  geographySlug,
  categorySlug,
}: {
  geographySlug: string;
  categorySlug?: string;
}): Promise<PublicIndicatorValue[] | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const prisma = getPrisma();
  const indicators = await prisma.indicator.findMany({
    where: {
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: true,
      source: true,
      sourceMaps: {
        orderBy: { priority: "asc" },
        take: 1,
        include: { sourceDataset: true },
      },
      values: {
        where: { geography: { slug: geographySlug } },
        orderBy: { period: "asc" },
        include: { geography: true, sourceDataset: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return indicators
    .filter((indicator) => indicator.values.length > 0 || indicator.sourceMaps.length > 0)
    .map((indicator) => {
      const trend = indicator.values.map((value) => ({
        value: Number(value.value),
        period: value.period.toISOString(),
        label: value.label,
      }));
      const latestValue = indicator.values.at(-1);
      const sourceDataset = latestValue?.sourceDataset ?? indicator.sourceMaps[0]?.sourceDataset;

      return {
        indicatorSlug: indicator.slug,
        indicatorName: indicator.name,
        categorySlug: indicator.category.slug,
        geographySlug,
        geographyName: latestValue?.geography?.name ?? geographySlug,
        latest: latestValue
          ? {
              value: Number(latestValue.value),
              period: latestValue.period.toISOString(),
              label: latestValue.label,
              unit: indicator.unit,
            }
          : null,
        trend,
        source: {
          name: sourceDataset?.label ?? indicator.source?.name ?? "Source pending",
          publisher: sourceDataset?.publisher ?? "Source pending",
          url: sourceDataset?.officialUrl ?? "#",
        },
        status: latestValue
          ? prismaStatusToPublic(latestValue.dataStatus)
          : sourceStatusToPublic(indicator.sourceMaps[0]?.importStatus),
        lastFetchedAt: latestValue?.fetchedAt?.toISOString() ?? sourceDataset?.lastCheckedAt?.toISOString() ?? null,
        note: latestValue?.note ?? indicator.sourceMaps[0]?.transformRule ?? null,
      } satisfies PublicIndicatorValue;
    });
}

const categoryAreas: Record<string, string[]> = {
  economy: ["economy", "labour", "inflation", "rates", "trade", "fiscal"],
  housing: ["housing", "rates"],
  inflation: ["inflation"],
  population: ["population", "immigration"],
  immigration: ["population", "immigration"],
  government: ["fiscal"],
  trade: ["trade"],
  energy: ["energy"],
  youth: ["labour", "housing", "inflation", "rates"],
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function numericValue(display: string) {
  const cleaned = display.replace(/[^0-9.-]+/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function displayUnit(display: string) {
  if (display.includes("%")) return "%";
  if (display.includes("$")) return "CAD";
  return "reported unit";
}

export async function getReleaseIndicatorValues({
  geographySlug,
  categorySlug,
}: {
  geographySlug: string;
  categorySlug: string;
}): Promise<PublicIndicatorValue[]> {
  const areas = categoryAreas[categorySlug] ?? [categorySlug];
  const hub = await getMultiSourceReleaseHub();
  const releases = hub.todayQueue.filter(
    (release) => release.status === "live" && release.affectedAreas.some((area) => areas.includes(area)),
  );

  if (geographySlug !== "canada") {
    return releases.flatMap((release) => {
      const province = release.provinceBreakdown.find((item) => slugify(item.province) === geographySlug);
      if (!province) return [];
      const value = numericValue(province.value);
      if (value === null) return [];
      return [{
        indicatorSlug: `${release.slug}-${geographySlug}`,
        indicatorName: release.title,
        categorySlug,
        geographySlug,
        geographyName: province.province,
        latest: { value, period: release.referencePeriod, label: province.value, unit: displayUnit(province.value) },
        trend: [],
        source: { name: release.title, publisher: release.publisher, url: release.sourceUrl },
        status: "live" as const,
        lastFetchedAt: release.releaseDate,
        note: province.note,
      } satisfies PublicIndicatorValue];
    });
  }

  const values = releases.flatMap((release) => {
    const headlineChart = release.chartPayloads.find((chart) => chart.kind === "metric-strip") ?? release.chartPayloads[0];
    return (headlineChart?.points ?? []).map((point) => ({
      indicatorSlug: `${release.slug}-${slugify(point.label)}`,
      indicatorName: point.label,
      categorySlug,
      geographySlug,
      geographyName: "Canada",
      latest: { value: point.value, period: point.period ?? release.referencePeriod, label: point.display, unit: displayUnit(point.display) },
      trend: [],
      source: { name: release.title, publisher: release.publisher, url: release.sourceUrl },
      status: "live" as const,
      lastFetchedAt: release.releaseDate,
      note: point.plainEnglish,
    } satisfies PublicIndicatorValue));
  });

  return [...new Map(values.map((value) => [`${value.indicatorSlug}-${value.latest?.label}`, value])).values()];
}
