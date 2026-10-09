import assert from "node:assert/strict";
import { comparableScale, barWidth } from "../src/lib/chart-integrity";
import { calculateBudget } from "../src/lib/budget";
import { buildLifeMapCategories } from "../src/lib/province-explorer-data";
import type { LifeSeries } from "../src/lib/life-series";
import { normalizeBill } from "../src/lib/policy-data";

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
assert.deepEqual(buildLifeMapCategories([{ ...mapDataset, status: "unavailable" }]), []);
console.log("Map audit passed: shared periods, actual cohorts, zero values and missing-source handling.");
