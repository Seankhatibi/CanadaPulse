import { cache } from "react";

type Member = { memberId: number; memberNameEn: string; terminated?: number };
type Dimension = { dimensionNameEn: string; dimensionPositionId: number; member: Member[] };
type Point = { refPer: string; value: number | null; scalarFactorCode?: number; statusCode?: number; securityLevelCode?: number; releaseTime?: string };
export type LifeSeries = {
  id: string; title: string; topic: "work" | "community"; unit: string; cohort: string;
  sourceUrl: string; cadence: string; implication: string; limitation: string;
  status: "loaded" | "unavailable"; checkedAt: string;
  rows: { geography: string; points: { period: string; value: number }[] }[];
};
type Definition = Omit<LifeSeries, "status" | "checkedAt" | "rows"> & { productId: number; selectors: Record<string, string>; periods: number };
const labourSelectors = { "Labour force characteristics": "Unemployment rate", Gender: "Total - Gender", Statistics: "Estimate", "Data type": "Seasonally adjusted" };
export const lifeSeriesDefinitions: Definition[] = [
  { id: "primary-care", title: "Regular healthcare provider", topic: "community", productId: 13100905, unit: "%", cohort: "Adults aged 18–34", cadence: "Annual / occasional", periods: 10, selectors: { "Age group": "18 to 34 years", Sex: "Both sexes", Indicators: "Has a regular healthcare provider", Characteristics: "Percent" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1310090501", implication: "Shows whether young adults have a regular point of contact for healthcare, rather than equating a larger health budget with better access.", limitation: "Survey coverage excludes territories. Survey redesigns may limit comparisons over time; this does not measure appointment availability or wait times." },
  { id: "mental-health", title: "Very good or excellent mental health", topic: "community", productId: 13100905, unit: "%", cohort: "Adults aged 18–34", cadence: "Annual / occasional", periods: 10, selectors: { "Age group": "18 to 34 years", Sex: "Both sexes", Indicators: "Perceived mental health, very good or excellent", Characteristics: "Percent" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1310090501", implication: "Adds young adults’ reported wellbeing to the financial picture.", limitation: "Self-reported survey measure, not clinical diagnosis. Changes may not be statistically significant; survey methods and coverage matter." },
  { id: "community-belonging", title: "Strong community belonging", topic: "community", productId: 13100905, unit: "%", cohort: "Adults aged 18–34", cadence: "Annual / occasional", periods: 10, selectors: { "Age group": "18 to 34 years", Sex: "Both sexes", Indicators: "Sense of belonging to local community, somewhat strong or very strong", Characteristics: "Percent" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1310090501", implication: "Looks at connection to community, an aspect of daily life that income and GDP miss.", limitation: "Self-reported, excludes territories. This cannot establish why belonging changed." },
  { id: "youth-jobs", title: "Youth unemployment", topic: "work", productId: 14100287, unit: "%", cohort: "15–24 years", cadence: "Monthly", periods: 36, selectors: { ...labourSelectors, "Age group": "15 to 24 years" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028702", implication: "Shows competition for work among young people actively looking for a job.", limitation: "Includes students looking for work; excludes people outside the labour force. This is not an individual hiring probability." },
  { id: "prime-jobs", title: "Prime-age unemployment", topic: "work", productId: 14100287, unit: "%", cohort: "25–54 years", cadence: "Monthly", periods: 36, selectors: { ...labourSelectors, "Age group": "25 to 54 years" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028702", implication: "Compare with young workers to see whether the job-entry gap is widening.", limitation: "Both rates use the same seasonally adjusted table; age groups have different work and study patterns." },
  { id: "youth-wages", title: "Median hourly pay", topic: "work", productId: 14100063, unit: "$/hour", cohort: "Employees aged 15–24", cadence: "Monthly", periods: 36, selectors: { Wages: "Median hourly wage rate", "Type of work": "Both full- and part-time employees", "North American Industry Classification System (NAICS)": "Total employees, all industries", Gender: "Total - Gender", "Age group": "15 to 24 years" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410006301", implication: "A midpoint wage offers a better starting point for a budget than an economy-wide salary average.", limitation: "Current dollars, unadjusted for seasonality. Changes can reflect job mix; this excludes self-employed workers." },
  { id: "tuition", title: "Canadian undergraduate tuition", topic: "work", productId: 37100045, unit: "$", cohort: "Canadian undergraduate students", cadence: "Annual", periods: 10, selectors: { "Level of study": "Canadian undergraduate" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3710004501", implication: "Tuition is one part of the cost of studying. Add rent, transport, books and lost work hours to your own plan.", limitation: "Average tuition is not a program quote. It excludes living costs, financial aid and international tuition." },
  { id: "food-insecurity", title: "Food insecurity", topic: "community", productId: 13100834, unit: "%", cohort: "All persons", cadence: "Annual", periods: 10, selectors: { "Economic family type": "All persons", "Household food security status": "Food insecure", Statistics: "Percentage of persons" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1310083401", implication: "Measures difficulty accessing food, a different question from how quickly food prices rise.", limitation: "Survey-based and lagged. Suppressed, unreliable and caution-flagged values are omitted. Consult table notes before comparing small differences." },
  { id: "poverty", title: "Poverty rate", topic: "community", productId: 11100135, unit: "%", cohort: "All persons · MBM 2023 base", cadence: "Annual", periods: 10, selectors: { "Persons in low income": "All persons", "Low income lines": "Market basket measure, 2023 base", Statistics: "Percentage of persons in low income" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110013501", implication: "Shows the share of people below an essential-cost threshold, rather than treating GDP growth as household prosperity.", limitation: "All points use the same poverty-line base. Estimates from different MBM bases cannot be spliced together." },
  { id: "life-satisfaction", title: "Life satisfaction", topic: "community", productId: 13100843, unit: "/10", cohort: "All persons in survey coverage", cadence: "Quarterly", periods: 16, selectors: { Gender: "Total, all persons", Indicators: "Average life satisfaction rating", Statistics: "Average rating" }, sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1310084301", implication: "Adds how people feel about their lives to the economic picture. Income alone cannot capture wellbeing.", limitation: "Subjective survey measure; national coverage excludes territories. Small changes may not be statistically meaningful." },
];

const geographies = new Set(["Canada", "Canada (excluding territories)", "Newfoundland and Labrador", "Prince Edward Island", "Nova Scotia", "New Brunswick", "Quebec", "Ontario", "Manitoba", "Saskatchewan", "Alberta", "British Columbia", "Yukon", "Northwest Territories", "Nunavut"]);
const base = "https://www150.statcan.gc.ca/t1/wds/rest";
async function post(endpoint: string, body: unknown) {
  const response = await fetch(`${base}/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(9000), next: { revalidate: 3600, tags: ["canada-pulse-life-series"] } });
  if (!response.ok) throw new Error("Official table request failed");
  return response.json();
}
const metadata = cache(async (productId: number): Promise<Dimension[]> => {
  const payload = await post("getCubeMetadata", [{ productId }]);
  const dimensions = payload[0]?.object?.dimension as Dimension[] | undefined;
  if (payload[0]?.status !== "SUCCESS" || !dimensions?.length) throw new Error("Official dimensions unavailable");
  return [...dimensions].sort((a, b) => a.dimensionPositionId - b.dimensionPositionId);
});

export async function fetchLifeSeries(definition: Definition): Promise<LifeSeries> {
  const { productId, selectors, periods, ...publicDefinition } = definition;
  const result: LifeSeries = { ...publicDefinition, checkedAt: new Date().toISOString(), status: "unavailable", rows: [] };
  try {
    const dimensions = await metadata(productId);
    const geoIndex = dimensions.findIndex((dimension) => dimension.dimensionNameEn === "Geography");
    if (geoIndex < 0) return result;
    const fixed = dimensions.map((dimension, index) => index === geoIndex ? null : dimension.member.find((member) => member.memberNameEn === selectors[dimension.dimensionNameEn] && !member.terminated));
    if (fixed.some((member, index) => index !== geoIndex && !member)) return result;
    const requests = dimensions[geoIndex].member.filter((member) => geographies.has(member.memberNameEn) && !member.terminated).map((geo) => ({
      geography: geo.memberNameEn,
      coordinate: [...fixed.map((member, index) => index === geoIndex ? geo.memberId : member!.memberId), ...Array(10 - dimensions.length).fill(0)].join("."),
    }));
    const payload = await post("getDataFromCubePidCoordAndLatestNPeriods", requests.map(({ coordinate }) => ({ productId, coordinate, latestN: periods }))) as { status: string; object?: { coordinate: string; vectorDataPoint?: Point[] } }[];
    result.rows = payload.flatMap((entry) => {
      const request = requests.find((item) => item.coordinate === entry.object?.coordinate);
      if (!request || entry.status !== "SUCCESS") return [];
      const points = (entry.object?.vectorDataPoint ?? []).filter((point) => typeof point.value === "number" && Number.isFinite(point.value) && [0, 3, 4, 5, 6].includes(Number(point.statusCode ?? 0)) && Number(point.securityLevelCode ?? 0) === 0)
        .map((point) => ({ period: point.refPer, value: point.value! * 10 ** (point.scalarFactorCode ?? 0) })).sort((a, b) => a.period.localeCompare(b.period));
      return points.length ? [{ geography: request.geography, points }] : [];
    });
    if (result.rows.length) result.status = "loaded";
  } catch { /* Missing official values remain visibly unavailable. */ }
  return result;
}
export const getLifeSeries = cache(async () => Promise.all(lifeSeriesDefinitions.map(fetchLifeSeries)));
export function seriesDisplay(value: number, unit: string) {
  const number = value.toLocaleString("en-CA", { maximumFractionDigits: unit === "$" ? 0 : 1 });
  return unit.startsWith("$") ? `$${number}${unit === "$/hour" ? "/hr" : ""}` : `${number}${unit}`;
}
