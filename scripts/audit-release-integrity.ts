import { fetchCmhcHousingConstructionData } from "../src/lib/cmhc-housing";
import { fetchFinanceCanadaFiscalSnapshot } from "../src/lib/finance-canada-fiscal";
import { fetchIrccImmigrationSnapshot } from "../src/lib/ircc-immigration";
import { fetchStatCanDailyEntryFromUrl } from "../src/lib/statcan-daily";
import { fetchStatCanReleaseData } from "../src/lib/statcan-release-data";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
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

  const finance = await fetchFinanceCanadaFiscalSnapshot();
  assert(finance.referencePeriod === "April to March 2025-26", `Unexpected Fiscal Monitor period: ${finance.referencePeriod}`);
  assert(finance.metrics.find((item) => item.label === "Fiscal-year deficit")?.display === "$55.3B", "Fiscal Monitor deficit failed integrity check.");

  const housing = await fetchCmhcHousingConstructionData();
  assert(housing.latestPeriodLabel === "Q1 2026", `Unexpected CMHC quarter: ${housing.latestPeriodLabel}`);
  assert(housing.releaseDate === "2026-04-21", `Unexpected CMHC release date: ${housing.releaseDate}`);

  const immigration = await fetchIrccImmigrationSnapshot();
  const permanentResidents = immigration.metrics.find((item) => item.key === "permanentResidents");
  const tfwp = immigration.metrics.find((item) => item.key === "tfwp");
  const asylum = immigration.metrics.find((item) => item.key === "asylum");
  assert(permanentResidents && permanentResidents.value > 20_000, `IRCC permanent-resident total failed integrity range: ${permanentResidents?.value}`);
  assert(tfwp && tfwp.value > 10_000, `IRCC TFWP total failed integrity range: ${tfwp?.value}`);
  assert(asylum && asylum.value > 1_000, `IRCC asylum total failed integrity range: ${asylum?.value}`);
  assert(permanentResidents.provinceValues.some((item) => item.province === "Ontario"), "IRCC Ontario province row is missing.");

  console.log("Official release integrity audit passed: LFS, Finance Canada, CMHC and IRCC headline values are correctly identified.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
