import {
  cityMetrics,
  categoryScores,
  geographyProfiles,
  indicators,
  indicatorCategories,
  timeSeriesValues,
} from "@/lib/mock-data";

export function getNationalProfile() {
  return geographyProfiles.find((profile) => profile.slug === "canada") ?? geographyProfiles[0];
}

export function getProvinceProfiles() {
  return geographyProfiles.filter((profile) => profile.slug !== "canada");
}

export function getGeographyProfile(slug: string) {
  return geographyProfiles.find((profile) => profile.slug === slug);
}

export function getCategoryScore(geographySlug: string, categorySlug: string) {
  return categoryScores.find(
    (score) => score.geographySlug === geographySlug && score.categorySlug === categorySlug,
  );
}

export function getCategoryScoreCards(geographySlug = "canada") {
  return indicatorCategories.map((category) => ({
    ...category,
    score: getCategoryScore(geographySlug, category.slug),
  }));
}

export function getHotIndicators(geographySlug = "canada") {
  return indicators
    .filter((indicator) => indicator.isHot)
    .map((indicator) => {
      const latest = timeSeriesValues
        .filter((value) => value.indicatorSlug === indicator.slug && value.geographySlug === geographySlug)
        .sort((a, b) => b.period.localeCompare(a.period))[0];

      return {
        ...indicator,
        latest,
      };
    });
}

export function getIndicatorTrend(geographySlug: string, indicatorSlug: string) {
  return timeSeriesValues
    .filter((value) => value.geographySlug === geographySlug && value.indicatorSlug === indicatorSlug)
    .sort((a, b) => a.period.localeCompare(b.period));
}

export function getIndicatorCountByCategory() {
  return indicatorCategories.map((category) => ({
    ...category,
    count: indicators.filter((indicator) => indicator.categorySlug === category.slug).length,
  }));
}

export function getIndicatorsByCategory(geographySlug: string, categorySlug: string) {
  return indicators
    .filter((indicator) => indicator.categorySlug === categorySlug)
    .map((indicator) => {
      const latest = timeSeriesValues
        .filter((value) => value.indicatorSlug === indicator.slug && value.geographySlug === geographySlug)
        .sort((a, b) => b.period.localeCompare(a.period))[0];

      return {
        ...indicator,
        latest,
        trend: getIndicatorTrend(geographySlug, indicator.slug),
      };
    });
}

export function getHousingDashboard(geographySlug = "canada") {
  const profile = getGeographyProfile(geographySlug) ?? getNationalProfile();
  const score = getCategoryScore(geographySlug, "housing");
  const housingIndicators = getIndicatorsByCategory(geographySlug, "housing");
  const youthIndicators = getIndicatorsByCategory(geographySlug, "youth");
  const averageRent = housingIndicators.find((indicator) => indicator.slug === "average-rent");
  const homePrice = housingIndicators.find((indicator) => indicator.slug === "benchmark-home-price");
  const rentToIncome = housingIndicators.find((indicator) => indicator.slug === "rent-to-income-ratio");
  const completions = housingIndicators.find((indicator) => indicator.slug === "housing-completions");
  const childcare = youthIndicators.find((indicator) => indicator.slug === "childcare-cost");
  const localCities = cityMetrics.filter((metric) => metric.geographySlug === geographySlug);

  const annualIncome = 72000 * (profile.score / 63);
  const monthlyIncome = annualIncome / 12;
  const monthlyRent = averageRent?.latest?.value ?? 2200;
  const benchmarkPrice = homePrice?.latest?.value ?? 700000;
  const downPaymentTarget = benchmarkPrice * 0.08;
  const estimatedSavings = Math.max(150, monthlyIncome - monthlyRent - 2100);

  return {
    profile,
    score,
    housingIndicators,
    rentTrend: getIndicatorTrend(geographySlug, "average-rent"),
    homePriceTrend: getIndicatorTrend(geographySlug, "benchmark-home-price"),
    completionsTrend: getIndicatorTrend(geographySlug, "housing-completions"),
    affordability: {
      annualIncome: Math.round(annualIncome),
      monthlyIncome: Math.round(monthlyIncome),
      monthlyRent: Math.round(monthlyRent),
      benchmarkPrice: Math.round(benchmarkPrice),
      rentBurden: Math.round((monthlyRent / monthlyIncome) * 100),
      downPaymentTarget: Math.round(downPaymentTarget),
      estimatedMonthlySavings: Math.round(estimatedSavings),
      yearsToDownPayment: Number((downPaymentTarget / (estimatedSavings * 12)).toFixed(1)),
      childcareCost: Math.round(childcare?.latest?.value ?? 745),
      rentToIncome: Math.round(rentToIncome?.latest?.value ?? 36),
      completions: Math.round(completions?.latest?.value ?? 188000),
    },
    cityMetrics: localCities,
  };
}
