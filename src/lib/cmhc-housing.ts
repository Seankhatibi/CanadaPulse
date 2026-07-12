import { parseCsv } from "@/lib/csv-utils";
import { fetchStatCanTableCsv } from "@/lib/statcan-table-download";

export type CmhcProvinceStart = {
  province: string;
  starts: number;
  completions: number | null;
  previousStarts: number | null;
  changePct: number | null;
  sharePct: number;
  startsCompletionsGap: number | null;
};

export type CmhcHousingConstructionData = {
  productId: string;
  tableId: string;
  sourceUrl: string;
  downloadUrl: string;
  latestPeriod: string;
  previousPeriod: string | null;
  canadaStarts: number;
  canadaCompletions: number | null;
  canadaStartsCompletionsGap: number | null;
  previousCanadaStarts: number | null;
  canadaChangePct: number | null;
  unitMix: Array<{ label: string; value: number; sharePct: number }>;
  provinces: CmhcProvinceStart[];
};

const productId = "34100135";
const tableId = "34-10-0135-01";
const sourceUrl = "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013501";
const provinceNames = new Set([
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Nova Scotia",
  "New Brunswick",
  "Quebec",
  "Ontario",
  "Manitoba",
  "Saskatchewan",
  "Alberta",
  "British Columbia",
]);

function toNumber(value: string | undefined) {
  if (!value || value === ".." || value === "...") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function pctChange(current: number, previous: number | null) {
  if (!previous) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatUnitType(value: string) {
  if (value === "Apartment and other unit type") return "Apartments/other";
  if (value === "Single-detached") return "Single-detached";
  return value;
}

export async function fetchCmhcHousingConstructionData(): Promise<CmhcHousingConstructionData> {
  const { csv, downloadUrl } = await fetchStatCanTableCsv(productId);
  const rows = parseCsv(csv);
  const header = rows[0] ?? [];
  const index = Object.fromEntries(header.map((name, column) => [name, column]));
  const records = rows.slice(1).map((row) => ({
    period: row[index.REF_DATE],
    geo: row[index.GEO],
    estimate: row[index["Housing estimates"]],
    unitType: row[index["Type of unit"]],
    seasonal: row[index["Seasonal adjustment"]],
    value: toNumber(row[index.VALUE]),
  }));
  const startsTotal = records.filter(
    (record) =>
      record.estimate === "Housing starts" &&
      record.unitType === "Total units" &&
      record.seasonal === "Unadjusted" &&
      record.value !== null,
  );
  const completionsTotal = records.filter(
    (record) =>
      record.estimate === "Housing completions" &&
      record.unitType === "Total units" &&
      record.seasonal === "Unadjusted" &&
      record.value !== null,
  );
  const latestPeriod = [...new Set(startsTotal.map((record) => record.period))].sort().at(-1);

  if (!latestPeriod) {
    throw new Error("No CMHC housing starts period found.");
  }

  const previousPeriod = [...new Set(startsTotal.map((record) => record.period))]
    .sort()
    .filter((period) => period < latestPeriod)
    .at(-1) ?? null;
  const canada = startsTotal.find((record) => record.period === latestPeriod && record.geo === "Canada");
  const canadaCompletion = completionsTotal.find((record) => record.period === latestPeriod && record.geo === "Canada");
  const previousCanada = previousPeriod
    ? startsTotal.find((record) => record.period === previousPeriod && record.geo === "Canada")
    : null;

  if (!canada?.value) {
    throw new Error("No latest Canada CMHC housing starts value found.");
  }
  const canadaStarts = canada.value;
  const canadaCompletions = canadaCompletion?.value ?? null;

  const unitRows = records.filter(
    (record) =>
      record.period === latestPeriod &&
      record.geo === "Canada" &&
      record.estimate === "Housing starts" &&
      record.unitType !== "Total units" &&
      record.seasonal === "Unadjusted" &&
      record.value !== null,
  );
  const provinces = startsTotal
    .filter((record) => record.period === latestPeriod && provinceNames.has(record.geo))
    .map((record) => {
      const previous = previousPeriod
        ? startsTotal.find((candidate) => candidate.period === previousPeriod && candidate.geo === record.geo)
        : null;
      const completion = completionsTotal.find((candidate) => candidate.period === latestPeriod && candidate.geo === record.geo);
      const value = record.value ?? 0;
      const previousValue = previous?.value ?? null;
      const completions = completion?.value ?? null;

      return {
        province: record.geo,
        starts: value,
        completions,
        previousStarts: previousValue,
        changePct: pctChange(value, previousValue),
        sharePct: Number(((value / canadaStarts) * 100).toFixed(1)),
        startsCompletionsGap: completions === null ? null : value - completions,
      };
    })
    .sort((a, b) => b.starts - a.starts);

  return {
    productId,
    tableId,
    sourceUrl,
    downloadUrl,
    latestPeriod,
    previousPeriod,
    canadaStarts,
    canadaCompletions,
    canadaStartsCompletionsGap: canadaCompletions === null ? null : canadaStarts - canadaCompletions,
    previousCanadaStarts: previousCanada?.value ?? null,
    canadaChangePct: pctChange(canadaStarts, previousCanada?.value ?? null),
    unitMix: unitRows
      .map((record) => ({
        label: formatUnitType(record.unitType),
        value: record.value ?? 0,
        sharePct: Number((((record.value ?? 0) / canadaStarts) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value),
    provinces,
  };
}
