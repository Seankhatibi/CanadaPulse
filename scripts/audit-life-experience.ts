import assert from "node:assert/strict";
import { comparableScale, barWidth } from "../src/lib/chart-integrity";
import { calculateBudget } from "../src/lib/budget";
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
