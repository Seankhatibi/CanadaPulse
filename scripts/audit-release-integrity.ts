import { fetchCmhcHousingConstructionData } from "../src/lib/cmhc-housing";
import { fetchCmhcRentalSnapshot } from "../src/lib/cmhc-rental";
import { fetchFinanceCanadaFiscalSnapshot } from "../src/lib/finance-canada-fiscal";
import { fetchIrccImmigrationSnapshot } from "../src/lib/ircc-immigration";
import { buildReleaseExplainer, fetchStatCanDailyEntryFromUrl } from "../src/lib/statcan-daily";
import { fetchStatCanReleaseData, formatWdsValue } from "../src/lib/statcan-release-data";
import { fetchStatCanCpiSnapshot } from "../src/lib/statcan-cpi";
import { normalizeStatCanDailyRelease } from "../src/lib/release-hub";
import { buildProvincePeerRows } from "../src/lib/province-research";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  assert(formatWdsValue("Electric Power Selling Price Index", 142.2) === "142.2", "A price index was formatted as currency.");
  assert(formatWdsValue("Job vacancies", 177_340) === "177,340", "A job-vacancy count was formatted as a percentage.");
  const peerCheck = buildProvincePeerRows([
    { province: "Ontario", value: "$4.6B", note: "", score: 10 },
    { province: "Alberta", value: "$1.6B", note: "", score: 90 },
    { province: "Quebec", value: "$2.8B", note: "", score: 20 },
  ], "Ontario");
  assert(peerCheck.rank === 1 && peerCheck.peerRows[0]?.province === "Ontario", "Province comparisons ranked internal scores instead of reported values.");
  const tieCheck = buildProvincePeerRows([
    { province: "Ontario", value: "7.0%", note: "", score: 10 },
    { province: "Alberta", value: "7.0%", note: "", score: 90 },
    { province: "Quebec", value: "6.1%", note: "", score: 20 },
  ], "Alberta");
  assert(tieCheck.rank === 1, "Equal province values did not receive the same rank.");

  const labourUrl = "https://www150.statcan.gc.ca/n1/daily-quotidien/260710/dq260710a-eng.htm";
  const labourEntry = await fetchStatCanDailyEntryFromUrl(labourUrl);
  assert(labourEntry, "Labour Force Survey release was not fetched.");
  const labour = await fetchStatCanReleaseData(labourEntry);
  const metric = (label: string) => labour.signals.find((signal) => signal.label === label);
  const employment = metric("Employment");
  const unemploymentRate = metric("Unemployment rate");
  const participationRate = metric("Participation rate");
  assert(employment && employment.value > 20_000 && employment.value < 25_000, `National employment failed integrity range: ${employment?.value}`);
  assert(unemploymentRate && unemploymentRate.value === 6.5, `National unemployment rate should be 6.5%, got ${unemploymentRate?.value}`);
  assert(participationRate && participationRate.value === 65, `National participation rate should be 65.0%, got ${participationRate?.value}`);
  assert(unemploymentRate.display === "6.5%", `Unemployment display lost its percent unit: ${unemploymentRate.display}`);
  assert(participationRate.display === "65.0%", `Participation display lost its percent unit: ${participationRate.display}`);
  const provinceTable = labour.tables.find((table) => /by province/i.test(table.title));
  const provinceGroups = new Set(provinceTable?.rows.map((row) => row.group).filter(Boolean));
  assert(provinceGroups.has("Ontario") && !provinceGroups.has("North Shore, Nova Scotia"), "LFS geography normalization included sub-provincial regions.");

  const labourFallback = buildReleaseExplainer({
    title: "Labour Force Survey, June 2026",
    href: labourUrl,
    published: "2026-07-10T08:30:00-04:00",
    summary: "Employment rose by 0.1% in June. The employment rate rose 0.1 percentage points to 60.8%. The unemployment rate fell 0.1 percentage points to 6.5%.",
    feed: "Labour",
  });
  const fallbackMetric = (label: string) => labourFallback.signals.find((signal) => signal.label === label);
  assert(fallbackMetric("Employment")?.display === "0.1%", "LFS fallback employment change was mislabeled as a level.");
  assert(fallbackMetric("Employment rate")?.display === "60.8%", "LFS fallback employment-rate level was parsed incorrectly.");
  assert(fallbackMetric("Employment rate")?.changeDisplay === "+0.1 pts", "LFS fallback employment-rate move was parsed incorrectly.");
  assert(fallbackMetric("Unemployment rate")?.display === "6.5%", "LFS fallback unemployment-rate level was parsed incorrectly.");
  assert(fallbackMetric("Unemployment rate")?.direction === "down", "LFS fallback unemployment-rate direction was parsed incorrectly.");
  assert(fallbackMetric("Unemployment rate")?.changeDisplay === "-0.1 pts", "LFS fallback unemployment-rate move was parsed incorrectly.");

  const employmentInsuranceUrl = "https://www150.statcan.gc.ca/n1/daily-quotidien/260618/dq260618d-eng.htm";
  const employmentInsuranceEntry = await fetchStatCanDailyEntryFromUrl(employmentInsuranceUrl);
  assert(employmentInsuranceEntry, "Unpromoted Employment Insurance release was not fetched.");
  const employmentInsurance = await normalizeStatCanDailyRelease(employmentInsuranceEntry);
  assert(employmentInsurance.status === "live", `Unpromoted release did not load table data on demand: ${employmentInsurance.status}`);
  assert(employmentInsurance.chartPayloads.some((chart) => chart.points.length > 0), "Unpromoted release has no on-demand structured metrics.");
  assert(employmentInsurance.sourceLinks.some((link) => link.url === employmentInsuranceUrl), "Unpromoted release lost its official source trail.");

  const gdpEntry = await fetchStatCanDailyEntryFromUrl("https://www150.statcan.gc.ca/n1/daily-quotidien/260630/dq260630a-eng.htm");
  assert(gdpEntry, "GDP by industry release was not fetched.");
  const gdp = await fetchStatCanReleaseData(gdpEntry);
  const allIndustries = gdp.signals.find((signal) => signal.label === "All industries");
  assert(allIndustries?.display === "$2.35T", `GDP level should preserve millions-of-dollars scaling, got ${allIndustries?.display}`);
  assert(allIndustries.previous === null, `GDP monthly percent change was mistaken for a previous level: ${allIndustries.previous}`);
  assert(allIndustries.changeDisplay === "+1.1%", `GDP annual change should retain percent units, got ${allIndustries.changeDisplay}`);

  const vacanciesEntry = await fetchStatCanDailyEntryFromUrl("https://www150.statcan.gc.ca/n1/daily-quotidien/260616/dq260616b-eng.htm");
  assert(vacanciesEntry, "Job vacancies release was not fetched.");
  const vacancies = await fetchStatCanReleaseData(vacanciesEntry);
  assert(vacancies.signals.find((signal) => signal.label === "Job vacancies")?.display === "506,730", "Job-vacancy count was formatted with the wrong unit.");
  assert(vacancies.signals.find((signal) => signal.label === "Job vacancy rate")?.display === "2.8%", "Job-vacancy rate lost its percent unit.");

  const cpi = await fetchStatCanCpiSnapshot();
  assert(cpi.referencePeriod === "May 2026", `Unexpected CPI period: ${cpi.referencePeriod}`);
  assert(cpi.canada.allItems.yearOverYearPct === 3.2, `Headline CPI should be 3.2%, got ${cpi.canada.allItems.yearOverYearPct}`);
  assert(cpi.canada.food.yearOverYearPct === 3.8, `Food CPI should be 3.8%, got ${cpi.canada.food.yearOverYearPct}`);
  assert(cpi.provinces.length === 10, `CPI should include 10 provinces, got ${cpi.provinces.length}`);
  assert(cpi.components.find((item) => item.product === "Rent")?.yearOverYearPct === 3.5, "CPI rent component failed integrity check.");

  const finance = await fetchFinanceCanadaFiscalSnapshot();
  assert(finance.referencePeriod === "April to March 2025-26", `Unexpected Fiscal Monitor period: ${finance.referencePeriod}`);
  assert(finance.metrics.find((item) => item.label === "Fiscal-year deficit")?.display === "$55.3B", "Fiscal Monitor deficit failed integrity check.");

  const housing = await fetchCmhcHousingConstructionData();
  assert(housing.latestPeriodLabel === "Q1 2026", `Unexpected CMHC quarter: ${housing.latestPeriodLabel}`);
  assert(housing.releaseDate === "2026-04-21", `Unexpected CMHC release date: ${housing.releaseDate}`);

  const rental = await fetchCmhcRentalSnapshot();
  assert(rental.referencePeriod === "October 2025", `Unexpected CMHC rental period: ${rental.referencePeriod}`);
  assert(rental.releaseDate === "2025-12-11", `Unexpected CMHC rental release date: ${rental.releaseDate}`);
  assert(rental.canada.averageTwoBedroomRent === 1_550, `CMHC Canada two-bedroom rent should be $1,550, got ${rental.canada.averageTwoBedroomRent}`);
  assert(rental.canada.vacancyRate === 3.1, `CMHC Canada vacancy should be 3.1%, got ${rental.canada.vacancyRate}`);
  assert(rental.provinces.find((item) => item.geography === "Ontario")?.averageTwoBedroomRent === 1_827, "CMHC Ontario rent failed integrity check.");
  assert(rental.metros.some((item) => item.geography.includes("Toronto")), "CMHC Toronto metro row is missing.");
  assert(rental.metros.some((item) => item.geography.includes("Vancouver")), "CMHC Vancouver metro row is missing.");

  const immigration = await fetchIrccImmigrationSnapshot();
  const permanentResidents = immigration.metrics.find((item) => item.key === "permanentResidents");
  const tfwp = immigration.metrics.find((item) => item.key === "tfwp");
  const asylum = immigration.metrics.find((item) => item.key === "asylum");
  assert(permanentResidents && permanentResidents.value > 20_000, `IRCC permanent-resident total failed integrity range: ${permanentResidents?.value}`);
  assert(tfwp && tfwp.value > 10_000, `IRCC TFWP total failed integrity range: ${tfwp?.value}`);
  assert(asylum && asylum.value > 1_000, `IRCC asylum total failed integrity range: ${asylum?.value}`);
  assert(permanentResidents.provinceValues.some((item) => item.province === "Ontario"), "IRCC Ontario province row is missing.");

  console.log("Official release integrity audit passed: major and unpromoted StatCan releases, CPI, Finance Canada, CMHC construction/rental and IRCC values and units are correctly identified.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
