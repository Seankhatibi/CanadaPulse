import type { NormalizedRelease } from "@/lib/release-hub";
import { parseComparableProvinceValue } from "@/lib/province-values";

export type ReleaseExportRow = {
  recordType: "metric" | "province" | "headline";
  chart: string;
  geography: string;
  indicator: string;
  sourceValue: number | null;
  normalizedValue: number | null;
  display: string;
  unit: string;
  valueType: "official" | "derived" | "qualitative" | "text";
  previousSourceValue: number | null;
  previousNormalizedValue: number | null;
  previousDisplay: string;
  changeSourceValue: number | null;
  changeNormalizedValue: number | null;
  changeDisplay: string;
  period: string;
  changePeriod: string;
  note: string;
  publisher: string;
  releaseTitle: string;
  releaseDate: string;
  referencePeriod: string;
  sourceUrl: string;
  evidenceStatus: string;
};

const columns: Array<keyof ReleaseExportRow> = [
  "recordType",
  "chart",
  "geography",
  "indicator",
  "sourceValue",
  "normalizedValue",
  "display",
  "unit",
  "valueType",
  "previousSourceValue",
  "previousNormalizedValue",
  "previousDisplay",
  "changeSourceValue",
  "changeNormalizedValue",
  "changeDisplay",
  "period",
  "changePeriod",
  "note",
  "publisher",
  "releaseTitle",
  "releaseDate",
  "referencePeriod",
  "sourceUrl",
  "evidenceStatus",
];

function commonFields(release: NormalizedRelease) {
  return {
    publisher: release.publisher,
    releaseTitle: release.title,
    releaseDate: release.releaseDate,
    referencePeriod: release.referencePeriod,
    sourceUrl: release.sourceUrl,
    evidenceStatus: release.status,
  };
}

function inferUnit(label: string, display: string) {
  if (/percentage point|\bpts?\b/i.test(display)) return "percentage points";
  if (display.includes("%") || /\brate\b|percent/i.test(label)) return "percent";
  if (display.includes("$")) return "CAD";
  if (/index/i.test(label)) return "index";
  if (/population|labour force|employment|unemployment|persons?|admissions|holders|claimants/i.test(label)) return "persons";
  if (/job vacanc/i.test(label)) return "vacancies";
  if (/starts|completions/i.test(label)) return "housing units";
  return "source unit";
}

function provinceValueType(display: string): ReleaseExportRow["valueType"] {
  return parseComparableProvinceValue(display) === null ? "qualitative" : "official";
}

function normalizeDisplayedValue(sourceValue: number | null | undefined, display: string) {
  const displayedValue = parseComparableProvinceValue(display);
  if (sourceValue === null || sourceValue === undefined) return displayedValue;
  if (displayedValue === null || sourceValue === 0) return sourceValue;

  const ratio = Math.abs(displayedValue / sourceValue);
  const scales = [1, 1e3, 1e6, 1e9, 1e12];
  const scale = scales.reduce((best, candidate) =>
    Math.abs(Math.log10(Math.max(ratio, Number.EPSILON)) - Math.log10(candidate))
      < Math.abs(Math.log10(Math.max(ratio, Number.EPSILON)) - Math.log10(best))
      ? candidate
      : best,
  );
  return sourceValue * scale;
}

export function buildReleaseExportRows(release: NormalizedRelease): ReleaseExportRow[] {
  const common = commonFields(release);
  const metricRows = release.chartPayloads.flatMap((chart) => chart.points.map((point) => ({
    recordType: "metric" as const,
    chart: chart.title,
    geography: chart.kind === "province-rank" ? point.label : "Canada",
    indicator: point.label,
    sourceValue: point.value,
    normalizedValue: normalizeDisplayedValue(point.value, point.display),
    display: point.display,
    unit: inferUnit(point.label, point.display),
    valueType: point.provenance ?? (chart.kind === "qualitative" ? "qualitative" : "official"),
    previousSourceValue: point.previous ?? null,
    previousNormalizedValue: normalizeDisplayedValue(point.previous, point.previousDisplay ?? ""),
    previousDisplay: point.previousDisplay ?? "",
    changeSourceValue: point.change ?? null,
    changeNormalizedValue: normalizeDisplayedValue(point.change, point.changeDisplay ?? ""),
    changeDisplay: point.changeDisplay ?? "",
    period: point.period ?? release.referencePeriod,
    changePeriod: point.changePeriod ?? "",
    note: point.methodology ? `${point.plainEnglish} Methodology: ${point.methodology}` : point.plainEnglish,
    ...common,
  })));
  const provinceRows = release.provinceBreakdown.map((province) => ({
    recordType: "province" as const,
    chart: "Provincial breakdown",
    geography: province.province,
    indicator: release.title,
    sourceValue: null,
    normalizedValue: parseComparableProvinceValue(province.value),
    display: province.value,
    unit: inferUnit(release.title, province.value),
    valueType: provinceValueType(province.value),
    previousSourceValue: null,
    previousNormalizedValue: null,
    previousDisplay: "",
    changeSourceValue: null,
    changeNormalizedValue: null,
    changeDisplay: "",
    period: release.referencePeriod,
    changePeriod: "",
    note: province.note,
    ...common,
  }));
  const headlineRows = release.headlineFacts.map((fact) => ({
    recordType: "headline" as const,
    chart: "Release facts",
    geography: release.geographyLevel === "federal" ? "Canada" : release.geographyLevel,
    indicator: "Headline fact",
    sourceValue: null,
    normalizedValue: null,
    display: fact,
    unit: "text",
    valueType: "text" as const,
    previousSourceValue: null,
    previousNormalizedValue: null,
    previousDisplay: "",
    changeSourceValue: null,
    changeNormalizedValue: null,
    changeDisplay: "",
    period: release.referencePeriod,
    changePeriod: "",
    note: "",
    ...common,
  }));

  return [...metricRows, ...provinceRows, ...headlineRows];
}

function csvCell(value: string | number | null) {
  if (value === null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function releaseRowsToCsv(rows: ReleaseExportRow[]) {
  const header = columns.join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(row[column])).join(","));
  return [header, ...body].join("\r\n");
}

export function buildReleaseExportPayload(release: NormalizedRelease) {
  const rows = buildReleaseExportRows(release);
  return {
    schemaVersion: "1.1",
    generatedAt: new Date().toISOString(),
    fieldDefinitions: {
      sourceValue: "Numeric value returned by the imported official table or source adapter, before display scaling.",
      normalizedValue: "Analysis-ready numeric value adjusted to the magnitude shown in display; percentages and indexes remain unscaled.",
      display: "Human-readable value shown by Canada Pulse, preserving currency, percent and compact magnitude symbols.",
      unit: "Best available semantic unit inferred from official labels and display notation.",
      valueType: "Official values come directly from the named source; derived values are Canada Pulse calculations and include methodology in note.",
    },
    release: {
      id: release.id,
      title: release.title,
      publisher: release.publisher,
      source: release.source,
      sourceUrl: release.sourceUrl,
      releaseDate: release.releaseDate,
      referencePeriod: release.referencePeriod,
      geographyLevel: release.geographyLevel,
      affectedAreas: release.affectedAreas,
      status: release.status,
    },
    rows,
  };
}
