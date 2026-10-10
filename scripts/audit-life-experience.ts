import assert from "node:assert/strict";
import { comparableScale, barWidth } from "../src/lib/chart-integrity";
import { calculateBudget } from "../src/lib/budget";
import { buildLifeMapCategories, buildProvinceExplorerData } from "../src/lib/province-explorer-data";
import { mapTitle, rankingReading } from "../src/lib/map-language";
import type { LifeSeries } from "../src/lib/life-series";
import { normalizeBill } from "../src/lib/policy-data";
import { buildStateOfCanadaMap, newestVerifiedReleases } from "../src/lib/state-map-data";
import type { NormalizedRelease, ReleaseHubPayload } from "../src/lib/release-hub";

const point = { display: "10%", value: 10, unit: "%", comparisonKey: "unemployment-15-24", period: "2026-09" };
assert.equal(comparableScale([point, { ...point, value: 0 }]), true);
for (const change of [{ unit: "$" }, { period: "2025-09" }, { comparisonKey: "all-ages" }, { value: NaN }, { unit: undefined }]) {
  assert.equal(comparableScale([point, { ...point, ...change }]), false);
}
assert.equal(barWidth(0, 10), 0);
assert.equal(barWidth(Infinity, 10), 0);
const inputs = { takeHome: 2000, rent: 1800, peopleSharing: 2, groceries: 400, transport: 100, utilities: 100, debt: 0, other: 200, savings: 500 };
assert.equal(calculateBudget(inputs).rent, 900);
assert.equal(calculateBudget(inputs).remaining, -200);
assert.equal(calculateBudget({ ...inputs, takeHome: 0 }).rentShare, null);
assert.equal(calculateBudget({ ...inputs, peopleSharing: 0 }).rent, 1800);
assert.equal(calculateBudget({ ...inputs, groceries: NaN }).expenses[1].value, 0);
const bill = normalizeBill({ Id: 1, NumberCode: "C-1", LongTitleEn: "An Act respecting housing", ParliamentNumber: 45, SessionNumber: 1, LatestBillEventDateTime: "0001-01-01", PassedHouseFirstReadingDateTime: "2026-01-01", PassedHouseThirdReadingDateTime: "2026-04-01", ReceivedRoyalAssentDateTime: "2026-05-01", StatusNameEn: "Royal assent" });
assert.equal(bill?.updated, "2026-05-01");
assert.equal(bill?.assent, "2026-05-01");
assert.equal(bill?.url, "https://www.parl.ca/legisinfo/en/bill/45-1/c-1");
assert.equal(normalizeBill({ Id: 2 }), null);
assert.ok(!bill || !("implemented" in bill));
console.log("Life-experience audit passed: compatible scales, zero values, shared rent, missing income and legislative dates.");

const mapDataset: LifeSeries = { id: "youth-jobs", title: "Youth unemployment", topic: "work", unit: "%", cohort: "15–24 years", sourceUrl: "https://www150.statcan.gc.ca/", cadence: "Monthly", implication: "Job-entry context.", limitation: "Survey estimate.", status: "loaded", checkedAt: "2026-10-09", rows: [
  { geography: "Canada", points: [{ period: "2026-09-01", value: 13 }] },
  ...["Ontario", "Alberta", "British Columbia", "Manitoba"].map((geography, index) => ({ geography, points: [{ period: "2026-09-01", value: index * 2 }] })),
  { geography: "Quebec", points: [{ period: "2026-08-01", value: 50 }] },
] };
const mapLayer = buildLifeMapCategories([mapDataset])[0];
assert.equal(mapLayer.values.length, 4);
assert.ok(!mapLayer.values.some((value) => value.province === "Quebec"));
assert.equal(mapLayer.values.find((value) => value.province === "Ontario")?.value, 0);
assert.equal(mapLayer.cohort, "15–24 years");
assert.equal(mapLayer.period, "September 2026");
assert.equal(mapLayer.canada?.value, 13, "Canada must use its source observation, not the province average");
assert.equal(mapLayer.canada?.display, "13.0%");
assert.deepEqual(buildLifeMapCategories([{ ...mapDataset, status: "unavailable" }]), []);
console.log("Map audit passed: shared periods, actual cohorts, zero values and missing-source handling.");

const releaseFixture: NormalizedRelease = { id: "older-jobs", slug: "older-jobs", title: "Labour Force Survey", source: "statcan", publisher: "Statistics Canada", sourceUrl: "https://www150.statcan.gc.ca/", sourceLinks: [], href: "/pulse-release/statcan/older-jobs", releaseType: "official-daily-release", releaseDate: "2026-10-08", referencePeriod: "September 2026", geographyLevel: "federal", affectedAreas: ["labour"], headlineFacts: [], provinceBreakdown: [], chartPayloads: [{ title: "Employment", kind: "metric-strip", points: [{ label: "Employment", value: 21, display: "21M", direction: "neutral", plainEnglish: "Employment total.", provenance: "official" }] }], importanceScore: 100, youthImpactScore: 100, housingImpactScore: 0, promoted: true, status: "live", plainEnglishSummary: "Official employment data.", socialSummary: "Employment update." };
const newerGdp: NormalizedRelease = { ...releaseFixture, id: "newer-gdp", slug: "newer-gdp", title: "Gross domestic product by industry", href: "/pulse-release/statcan/newer-gdp", releaseDate: "2026-10-09", importanceScore: 10, affectedAreas: ["economy"], chartPayloads: [{ title: "GDP", kind: "metric-strip", points: [{ label: "GDP", value: 2.3, display: "$2.3T", direction: "up", plainEnglish: "Production increased.", provenance: "official", changeDisplay: "+0.2%", period: "August 2026" }] }] };
const hubFixture = { generatedAt: "2026-10-09T18:00:00Z", todayQueue: [releaseFixture, newerGdp] } as ReleaseHubPayload;
const policyFixture = { status: "loaded" as const, checkedAt: "2026-10-09", bills: bill ? [bill] : [] };
const stateMap = buildStateOfCanadaMap(hubFixture, [mapDataset], policyFixture);
assert.equal(stateMap.defaultCategory, "release:newer-gdp", "Newest GDP beats older high-priority jobs release");
const gdpLayer = stateMap.categories.find((category) => category.id === stateMap.defaultCategory)!;
assert.equal(gdpLayer.national?.display, "$2.3T");
assert.equal(gdpLayer.period, "August 2026", "Observation period is not publication date");
assert.deepEqual(gdpLayer.values, [], "National GDP must never fabricate provincial values");
assert.equal(gdpLayer.theme, "economy");
assert.ok(gdpLayer.whyItMatters?.includes("GDP per person"));
assert.equal(newestVerifiedReleases([{ ...newerGdp, archiveFallback: true }, releaseFixture])[0].id, releaseFixture.id);
assert.equal(newestVerifiedReleases([{ ...newerGdp, status: "error" }, releaseFixture])[0].id, releaseFixture.id);
assert.equal(newestVerifiedReleases([{ ...releaseFixture, releaseDate: "2026-10-09", publishedAt: "2026-10-09T08:30:00-04:00" }, { ...newerGdp, publishedAt: "2026-10-09T10:00:00-04:00" }])[0].id, newerGdp.id, "A genuinely later same-day GDP timestamp wins");
assert.equal(stateMap.categories.find((category) => category.id === "bill:1")?.national?.kind, "legislation");
assert.ok(stateMap.categories.find((category) => category.id === "bill:1")?.context.includes("implementation still need separate evidence"));
const withPrior = { ...mapDataset, rows: mapDataset.rows.map((row) => ({ ...row, points: [{ period: "2026-08-01", value: 1 }, ...row.points] })) };
const jobsWithChange = buildLifeMapCategories([withPrior])[0];
assert.equal(jobsWithChange.values.find((value) => value.province === "Ontario")?.changeDisplay, "-1.0 percentage points");
assert.equal(buildLifeMapCategories([mapDataset])[0].values[0].changeDisplay, undefined, "Missing prior observation must not imply no change");
const social = { ...mapDataset, id: "mental-health", topic: "community" as const, cadence: "Annual / occasional" };
assert.equal(buildLifeMapCategories([social])[0].theme, "society");
assert.equal(buildLifeMapCategories([social])[0].values[0].changeDisplay, undefined, "Do not imply comparability across survey redesigns");
console.log("State-map audit passed: latest GDP default, national scope, archived/error exclusion, policy stages and valid period changes.");

const provincialJobs = { ...releaseFixture,
  provinceBreakdown: ["Ontario", "Alberta", "British Columbia", "Manitoba"].map((province, index) => ({ province, value: `${index * 2}%`, note: "Official province observation.", score: 0 })),
  chartPayloads: [{ title: "National jobs", kind: "metric-strip" as const, points: [{ label: "Unemployment rate", value: 6.5, display: "6.5%", direction: "neutral" as const, plainEnglish: "Canada unemployment rate.", provenance: "official" as const, period: "September 2026" }] }],
};
const nationalJobs = buildProvinceExplorerData({ ...hubFixture, todayQueue: [provincialJobs] }).categories[0];
assert.equal(nationalJobs.canada?.display, "6.5%", "Do not use employment totals as an unemployment benchmark");
assert.equal(mapTitle(nationalJobs), "People looking for work");
assert.equal(mapTitle({ ...nationalJobs, id: "release:jobs", measureId: "jobs", headline: "Labour Force Survey, September 2026" }), "People looking for work");
assert.equal(mapTitle(gdpLayer), "Canada’s economic output (GDP)");
assert.ok(rankingReading(nationalJobs).includes("not the best outcome"));
assert.ok(rankingReading(nationalJobs).includes("Equal values share a rank"));
assert.equal(buildProvinceExplorerData({ ...hubFixture, todayQueue: [{ ...provincialJobs, chartPayloads: [] }] }).categories[0].canada, undefined, "Missing national data must remain missing");
console.log("Plain-language map audit passed: understandable titles, exact national benchmarks and honest ranks.");
