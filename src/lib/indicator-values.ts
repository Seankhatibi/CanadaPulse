import { getPrisma } from "@/lib/prisma";
import { getIndicatorsByCategory } from "@/lib/data/mock-queries";
import { prismaStatusToPublic, sourceStatusToPublic, type PublicIndicatorValue } from "@/lib/data-status";

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

export function getFallbackIndicatorValues({
  geographySlug,
  categorySlug,
}: {
  geographySlug: string;
  categorySlug: string;
}): PublicIndicatorValue[] {
  return getIndicatorsByCategory(geographySlug, categorySlug).map((indicator) => ({
    indicatorSlug: indicator.slug,
    indicatorName: indicator.name,
    categorySlug,
    geographySlug,
    geographyName: geographySlug,
    latest: indicator.latest
      ? {
          value: indicator.latest.value,
          period: indicator.latest.period,
          label: indicator.latest.label,
          unit: indicator.unit,
        }
      : null,
    trend: indicator.trend.map((point) => ({
      value: point.value,
      period: point.period,
      label: point.label,
    })),
    source: {
      name: "Fallback seed data",
      publisher: "Canada Pulse",
      url: "/data-status",
    },
    status: "fallback",
    lastFetchedAt: null,
    note: "Seeded fallback value. Official source import pending.",
  }));
}
