import { geographies } from "./geographies";
import { indicatorCategories } from "./categories";
import { indicators } from "./indicators";

const provinceBase = {
  canada: { score: 63, heat: "Mixed", pressure: "National strain" },
  alberta: { score: 74, heat: "Energy strength", pressure: "Fast in-migration" },
  "british-columbia": { score: 66, heat: "Housing stress", pressure: "Affordability crunch" },
  manitoba: { score: 61, heat: "Stable costs", pressure: "Healthcare access" },
  "new-brunswick": { score: 58, heat: "Aging pressure", pressure: "Low wage growth" },
  "newfoundland-and-labrador": { score: 57, heat: "Resource cycle", pressure: "Aging population" },
  "nova-scotia": { score: 59, heat: "Population surge", pressure: "Rental pressure" },
  ontario: { score: 62, heat: "Affordability crunch", pressure: "Housing and youth stress" },
  "prince-edward-island": { score: 55, heat: "Rental pressure", pressure: "Small market squeeze" },
  quebec: { score: 65, heat: "Hydro advantage", pressure: "Productivity drag" },
  saskatchewan: { score: 68, heat: "Food and fuel", pressure: "Commodity exposure" },
  "northwest-territories": { score: 52, heat: "Cost isolation", pressure: "Remote infrastructure" },
  nunavut: { score: 45, heat: "Housing shortage", pressure: "Severe supply gap" },
  yukon: { score: 56, heat: "Small market", pressure: "High living cost" },
} as const;

const grades = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];

function gradeFromScore(score: number) {
  const index = Math.max(0, Math.min(grades.length - 1, Math.floor((score - 35) / 6)));
  return grades[index];
}

function categoryOffset(categorySlug: string) {
  const offsets: Record<string, number> = {
    economy: 3,
    housing: -11,
    immigration: -2,
    health: -7,
    government: -4,
    trade: 4,
    energy: 8,
    youth: -13,
    "quality-of-life": -3,
  };
  return offsets[categorySlug] ?? 0;
}

export const geographyProfiles = geographies.map((geography) => {
  const base = provinceBase[geography.slug as keyof typeof provinceBase] ?? provinceBase.canada;

  return {
    ...geography,
    score: base.score,
    status: base.heat,
    pressure: base.pressure,
    grade: gradeFromScore(base.score),
  };
});

export const categoryScores = geographyProfiles.flatMap((geography, geoIndex) =>
  indicatorCategories.map((category, categoryIndex) => {
    const score = Math.max(
      32,
      Math.min(91, geography.score + categoryOffset(category.slug) + ((geoIndex + categoryIndex) % 7) - 3),
    );

    return {
      geographySlug: geography.slug,
      categorySlug: category.slug,
      score,
      grade: gradeFromScore(score),
      trend: score >= 70 ? "Improving" : score >= 58 ? "Mixed" : "Worsening",
      period: "2026-01-01",
    };
  }),
);

const latestValues: Record<string, number> = {
  "gdp-per-capita": 61800,
  "productivity-growth": -0.7,
  "unemployment-rate": 6.2,
  "youth-unemployment-rate": 13.4,
  "median-after-tax-income": 72000,
  "food-inflation": 3.8,
  "benchmark-home-price": 704000,
  "average-rent": 2180,
  "housing-completions": 188000,
  "rent-to-income-ratio": 36,
  "population-growth": 3.1,
  "non-permanent-residents": 2800000,
  "health-spending-per-person": 9626,
  "family-doctor-access": 78,
  "diabetes-prevalence": 9.4,
  "cardiovascular-disease-prevalence": 7.1,
  "debt-service-cost": 54,
  "health-spending-share": 39,
  "exports-total": 768,
  "oil-gas-production-index": 100,
  "electricity-price": 17.2,
  "childcare-cost": 745,
  "violent-crime-rate": 1080,
  "life-satisfaction": 6.8,
};

function geographyMultiplier(slug: string, indicatorSlug: string) {
  const base = provinceBase[slug as keyof typeof provinceBase]?.score ?? 63;
  const normalized = (base - 63) / 100;

  if (indicatorSlug.includes("home-price") || indicatorSlug.includes("rent")) {
    if (slug === "british-columbia") return 1.32;
    if (slug === "ontario") return 1.18;
    if (slug === "nunavut") return 1.24;
    if (slug === "quebec") return 0.82;
    return 1 - normalized;
  }

  if (indicatorSlug.includes("oil-gas")) {
    if (slug === "alberta") return 2.2;
    if (slug === "saskatchewan") return 1.5;
    if (slug === "newfoundland-and-labrador") return 1.4;
    return 0.55;
  }

  if (indicatorSlug.includes("exports")) {
    if (slug === "ontario") return 1.65;
    if (slug === "alberta") return 1.38;
    if (slug === "quebec") return 1.18;
    return 0.72 + normalized;
  }

  return 1 + normalized;
}

export const timeSeriesValues = geographyProfiles.flatMap((geography) =>
  indicators.flatMap((indicator) => {
    const base = latestValues[indicator.slug] ?? 100;
    const multiplier = geography.slug === "canada" ? 1 : geographyMultiplier(geography.slug, indicator.slug);

    return [2022, 2023, 2024, 2025, 2026].map((year, index) => {
      const drift = 1 + (index - 2) * 0.025;
      const value = Number((base * multiplier * drift).toFixed(2));

      return {
        indicatorSlug: indicator.slug,
        geographySlug: geography.slug,
        period: `${year}-01-01`,
        value,
        label: year.toString(),
        isEstimate: year === 2026,
      };
    });
  }),
);

export const cityMetrics = [
  { geographySlug: "ontario", city: "Toronto", metricSlug: "average-rent", value: 2680, unit: "CAD/month", period: "2026-01-01" },
  { geographySlug: "ontario", city: "Ottawa", metricSlug: "average-rent", value: 2180, unit: "CAD/month", period: "2026-01-01" },
  { geographySlug: "british-columbia", city: "Vancouver", metricSlug: "average-rent", value: 2920, unit: "CAD/month", period: "2026-01-01" },
  { geographySlug: "alberta", city: "Calgary", metricSlug: "average-rent", value: 1940, unit: "CAD/month", period: "2026-01-01" },
  { geographySlug: "quebec", city: "Montreal", metricSlug: "average-rent", value: 1780, unit: "CAD/month", period: "2026-01-01" },
];

export const shareCards = [
  {
    slug: "ontario-housing-pressure",
    title: "Ontario Housing Score",
    geography: "Ontario",
    category: "Housing",
    headline: "Ontario's housing pressure is still severe.",
    summary: "Mock signal: rents, benchmark prices, and youth affordability remain under heavy pressure.",
    score: 51,
    payload: { grade: "D", shareText: "Ontario Housing Score: D. Youth affordability remains strained." },
  },
  {
    slug: "alberta-energy-strength",
    title: "Alberta Energy Strength",
    geography: "Alberta",
    category: "Energy",
    headline: "Alberta remains Canada's strongest energy engine.",
    summary: "Mock signal: high resource output supports exports and provincial revenue.",
    score: 86,
    payload: { grade: "A-", shareText: "Alberta Energy Score: A-. Canada's resource engine stays strong." },
  },
];
