import { PrismaClient } from "@prisma/client";
import {
  categoryScores,
  cityMetrics,
  dataSources,
  geographies,
  indicatorCategories,
  indicators,
  shareCards,
  timeSeriesValues,
} from "../src/lib/mock-data";
import { indicatorSourceMaps, sourceDatasets } from "../src/lib/source-datasets";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_FALLBACK_SEED !== "true") {
    throw new Error("Fallback seed is disabled. Set ALLOW_FALLBACK_SEED=true only for an isolated development database.");
  }
  for (const source of dataSources) {
    await prisma.dataSource.upsert({
      where: { slug: source.slug },
      update: source,
      create: source,
    });
  }

  for (const source of sourceDatasets) {
    await prisma.sourceDataset.upsert({
      where: { slug: source.slug },
      update: {
        label: source.label,
        publisher: source.publisher,
        officialUrl: source.officialUrl,
        apiType: source.apiType,
        cadence: source.cadence,
        licenseNote: source.licenseNote,
        updateStatus: source.updateStatus,
        latestKnownPeriod: source.latestKnownPeriod,
      },
      create: {
        slug: source.slug,
        label: source.label,
        publisher: source.publisher,
        officialUrl: source.officialUrl,
        apiType: source.apiType,
        cadence: source.cadence,
        licenseNote: source.licenseNote,
        updateStatus: source.updateStatus,
        latestKnownPeriod: source.latestKnownPeriod,
      },
    });
  }

  for (const category of indicatorCategories) {
    await prisma.indicatorCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const geography of geographies) {
    await prisma.geography.upsert({
      where: { slug: geography.slug },
      update: geography,
      create: geography,
    });
  }

  const sourceBySlug = new Map(
    (await prisma.dataSource.findMany()).map((source) => [source.slug, source.id]),
  );
  const categoryBySlug = new Map(
    (await prisma.indicatorCategory.findMany()).map((category) => [category.slug, category.id]),
  );
  const geographyBySlug = new Map(
    (await prisma.geography.findMany()).map((geography) => [geography.slug, geography.id]),
  );

  for (const indicator of indicators) {
    const categoryId = categoryBySlug.get(indicator.categorySlug);
    const sourceId = sourceBySlug.get(indicator.sourceSlug);

    if (!categoryId) {
      throw new Error(`Missing category ${indicator.categorySlug}`);
    }

    await prisma.indicator.upsert({
      where: { slug: indicator.slug },
      update: {
        name: indicator.name,
        description: indicator.description,
        unit: indicator.unit,
        categoryId,
        frequency: indicator.frequency,
        direction: indicator.direction,
        sourceId,
        isHot: indicator.isHot ?? false,
        isYouth: indicator.isYouth ?? false,
      },
      create: {
        slug: indicator.slug,
        name: indicator.name,
        description: indicator.description,
        unit: indicator.unit,
        categoryId,
        frequency: indicator.frequency,
        direction: indicator.direction,
        sourceId,
        isHot: indicator.isHot ?? false,
        isYouth: indicator.isYouth ?? false,
      },
    });
  }

  const indicatorBySlug = new Map(
    (await prisma.indicator.findMany()).map((indicator) => [indicator.slug, indicator.id]),
  );
  const sourceDatasetBySlug = new Map(
    (await prisma.sourceDataset.findMany()).map((source) => [source.slug, source.id]),
  );

  for (const map of indicatorSourceMaps) {
    const indicatorId = indicatorBySlug.get(map.indicatorSlug);
    const sourceDatasetId = sourceDatasetBySlug.get(map.sourceDatasetSlug);

    if (!indicatorId || !sourceDatasetId) {
      throw new Error(`Missing indicator source map relation ${map.indicatorSlug}:${map.sourceDatasetSlug}`);
    }

    await prisma.indicatorSourceMap.upsert({
      where: {
        indicatorId_sourceDatasetId_priority: {
          indicatorId,
          sourceDatasetId,
          priority: map.priority ?? 1,
        },
      },
      update: {
        sourceIndicatorKey: map.sourceIndicatorKey,
        productId: map.productId,
        vectorId: map.vectorId,
        fieldPath: map.fieldPath,
        geographyMapping: map.geographyMapping,
        unitConversion: map.unitConversion,
        transformRule: map.transformRule,
        importStatus: map.importStatus,
      },
      create: {
        indicatorId,
        sourceDatasetId,
        sourceIndicatorKey: map.sourceIndicatorKey,
        productId: map.productId,
        vectorId: map.vectorId,
        fieldPath: map.fieldPath,
        geographyMapping: map.geographyMapping,
        unitConversion: map.unitConversion,
        transformRule: map.transformRule,
        importStatus: map.importStatus,
        priority: map.priority ?? 1,
      },
    });
  }

  for (const score of categoryScores) {
    const geographyId = geographyBySlug.get(score.geographySlug);
    const categoryId = categoryBySlug.get(score.categorySlug);

    if (!geographyId || !categoryId) {
      throw new Error(`Missing score relation ${score.geographySlug}:${score.categorySlug}`);
    }

    await prisma.geographyScore.upsert({
      where: {
        geographyId_categoryId_period: {
          geographyId,
          categoryId,
          period: new Date(score.period),
        },
      },
      update: {
        score: score.score,
        grade: score.grade,
        trend: score.trend,
      },
      create: {
        geographyId,
        categoryId,
        period: new Date(score.period),
        score: score.score,
        grade: score.grade,
        trend: score.trend,
      },
    });
  }

  for (const value of timeSeriesValues) {
    const geographyId = geographyBySlug.get(value.geographySlug);
    const indicatorId = indicatorBySlug.get(value.indicatorSlug);

    if (!geographyId || !indicatorId) {
      throw new Error(`Missing value relation ${value.geographySlug}:${value.indicatorSlug}`);
    }

    await prisma.timeSeriesValue.upsert({
      where: {
        indicatorId_geographyId_period: {
          indicatorId,
          geographyId,
          period: new Date(value.period),
        },
      },
      update: {
        value: value.value,
        label: value.label,
        isEstimate: value.isEstimate,
        dataStatus: "FALLBACK",
        sourcePeriod: value.period,
        confidence: 0.25,
        note: "Seeded fallback value. Replace with official source import before production use.",
      },
      create: {
        indicatorId,
        geographyId,
        period: new Date(value.period),
        value: value.value,
        label: value.label,
        isEstimate: value.isEstimate,
        dataStatus: "FALLBACK",
        sourcePeriod: value.period,
        confidence: 0.25,
        note: "Seeded fallback value. Replace with official source import before production use.",
      },
    });
  }

  for (const metric of cityMetrics) {
    const geographyId = geographyBySlug.get(metric.geographySlug);

    if (!geographyId) {
      throw new Error(`Missing geography ${metric.geographySlug}`);
    }

    await prisma.cityMetric.create({
      data: {
        geographyId,
        city: metric.city,
        metricSlug: metric.metricSlug,
        value: metric.value,
        unit: metric.unit,
        period: new Date(metric.period),
      },
    });
  }

  for (const card of shareCards) {
    await prisma.shareCard.upsert({
      where: { slug: card.slug },
      update: card,
      create: card,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
