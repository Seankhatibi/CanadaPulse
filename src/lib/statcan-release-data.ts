import type { StatCanDailyEntry, ReleaseSignal } from "@/lib/statcan-daily";
import { fetchStatCanFullTableDownloadCsv } from "@/lib/etl/statcan-adapter";

export type StatCanReleaseTable = {
  title: string;
  htmlUrl: string;
  csvUrl: string;
  sourceTableIds: string[];
  periods: string[];
  latestPeriod: string;
  previousPeriod: string;
  rows: Array<{
    group?: string;
    label: string;
    values: number[];
    latest: number | null;
    previous: number | null;
    change: number | null;
    changePeriod: string;
    unit?: string;
    changeUnit?: string;
    display?: string;
    previousDisplay?: string;
  }>;
};

export type StatCanReleaseData = {
  releaseUrl: string;
  tableIds: string[];
  tableLinks: Array<{ htmlUrl: string; csvUrl: string }>;
  wdsDownloads: Array<{
    tableId: string;
    productId: string;
    status: "SUCCESS" | "ERROR";
    downloadUrl: string | null;
    message?: string;
  }>;
  tables: StatCanReleaseTable[];
  signals: ReleaseSignal[];
  sourceStatus: "table_data_loaded" | "table_links_detected" | "summary_only";
};

const statCanHost = "https://www150.statcan.gc.ca";

function decodeHtml(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#8212;/g, "-")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(decodeHtml(current));
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(decodeHtml(current));
  return cells;
}

function parseCsv(csv: string) {
  return csv
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine);
}

function toNumber(value: string) {
  const normalized = value.replace(/[,$]/g, "").trim();
  if (!normalized || normalized === "..." || normalized === "x") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeReleaseUrl(url: string) {
  if (url.startsWith("https://www.statcan.gc.ca/")) {
    return url.replace("https://www.statcan.gc.ca", statCanHost);
  }

  return url;
}

function absoluteUrl(pathOrUrl: string, releaseUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl.replace("https://www.statcan.gc.ca", statCanHost);
  const base = releaseUrl.slice(0, releaseUrl.lastIndexOf("/") + 1);
  return new URL(pathOrUrl, base).toString();
}

function extractTableIds(html: string) {
  return [...new Set([...html.matchAll(/\b\d{2}-\d{2}-\d{4}-\d{2}\b/g)].map((match) => match[0]))];
}

function extractTableLinks(html: string, releaseUrl: string) {
  const links = [...html.matchAll(/href="([^"]*t\d{3}a-eng\.htm)"/g)].map((match) => {
    const htmlUrl = absoluteUrl(match[1], releaseUrl);
    return {
      htmlUrl,
      csvUrl: htmlUrl.replace(/\.htm$/, ".csv"),
    };
  });

  return [...new Map(links.map((link) => [link.htmlUrl, link])).values()];
}

function extractCompanionTableUrls(html: string, releaseUrl: string) {
  return [...new Set([...html.matchAll(/href="([^"]*-cansim-eng\.htm)"/gi)]
    .map((match) => absoluteUrl(match[1], releaseUrl)))];
}

function tableIdToProductId(tableId: string) {
  return tableId.replace(/\D/g, "").slice(0, 8);
}

function isSimplePeriod(label: string) {
  return /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Sept\.?|Oct\.?|Nov\.?|Dec\.?)\s+\d{4}/i.test(label) &&
    !/\bto\b|standard error|change|%/i.test(label);
}

function cleanPeriodLabel(value: string) {
  return value.replace(/\{[a-z]+\}/gi, "").replace(/\s+/g, " ").trim();
}

function formatCompactNumber(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 1000) return `${(absolute / 1000).toFixed(1)}M`;
  return `${Math.round(absolute).toLocaleString("en-CA")}k`;
}

function formatSignalDisplay(label: string, value: number) {
  if (/rate/i.test(label)) return `${value.toFixed(1)}%`;
  if (/employment|labour force|population|unemployment/i.test(label)) return formatCompactNumber(value);
  return Number.isInteger(value) ? value.toLocaleString("en-CA") : value.toFixed(1);
}

function formatChangeDisplay(label: string, change: number | null) {
  if (change === null) return "latest value";
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  const absolute = Math.abs(change);
  if (/rate/i.test(label)) return `${sign}${absolute.toFixed(1)} pts`;
  if (/employment|labour force|population|unemployment/i.test(label)) return `${sign}${formatCompactNumber(change)}`;
  if (/value|price|sales|income|revenue|permit/i.test(label)) {
    if (absolute >= 1_000_000_000) return `${sign}$${(absolute / 1_000_000_000).toFixed(1)}B`;
    if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  }
  return `${sign}${absolute.toFixed(1)}`;
}

function formatDollarScale(value: number, sourceMultiplier: number) {
  const scaled = value * sourceMultiplier;
  const absolute = Math.abs(scaled);
  if (absolute >= 1_000_000_000_000) return `$${(scaled / 1_000_000_000_000).toFixed(2)}T`;
  if (absolute >= 1_000_000_000) return `$${(scaled / 1_000_000_000).toFixed(1)}B`;
  if (absolute >= 1_000_000) return `$${(scaled / 1_000_000).toFixed(1)}M`;
  return `$${scaled.toLocaleString("en-CA", { maximumFractionDigits: 1 })}`;
}

function formatTableValue(label: string, value: number, unit?: string) {
  const normalizedUnit = unit?.toLowerCase() ?? "";
  if (/rate/i.test(label) && /except rates?/.test(normalizedUnit)) return `${value.toFixed(1)}%`;
  if (/percentage point/.test(normalizedUnit)) return `${value.toFixed(1)} pts`;
  if (/%|percent/.test(normalizedUnit)) return `${value.toFixed(1)}%`;
  if (/millions? of dollars?/.test(normalizedUnit)) return formatDollarScale(value, 1_000_000);
  if (/thousands? of dollars?/.test(normalizedUnit)) return formatDollarScale(value, 1_000);
  if (/dollars?/.test(normalizedUnit)) return formatDollarScale(value, 1);
  if (/thousands?/.test(normalizedUnit)) return formatCompactNumber(value);
  return formatSignalDisplay(label, value);
}

function formatTableChange(label: string, change: number | null, unit?: string) {
  if (change === null) return "latest value";
  const normalizedUnit = unit?.toLowerCase() ?? "";
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  const absolute = Math.abs(change);
  if (/rate/i.test(label) && /except rates?/.test(normalizedUnit)) return `${sign}${absolute.toFixed(1)} pts`;
  if (/percentage point/.test(normalizedUnit)) return `${sign}${absolute.toFixed(1)} pts`;
  if (/%|percent/.test(normalizedUnit)) return `${sign}${absolute.toFixed(1)}%`;
  if (/thousands?/.test(normalizedUnit)) return `${sign}${formatCompactNumber(change)}`;
  if (Number.isInteger(absolute) && absolute >= 1_000) return `${sign}${absolute.toLocaleString("en-CA")}`;
  return formatChangeDisplay(label, change);
}

async function fetchWdsDownloads(tableIds: string[]) {
  return Promise.all(
    tableIds.slice(0, 6).map(async (tableId) => {
      const productId = tableIdToProductId(tableId);

      try {
        const response = (await fetchStatCanFullTableDownloadCsv(productId)) as {
          status?: string;
          object?: string;
          message?: string;
        };

        return {
          tableId,
          productId,
          status: response.status === "SUCCESS" && typeof response.object === "string" ? "SUCCESS" : "ERROR",
          downloadUrl: response.status === "SUCCESS" && typeof response.object === "string" ? response.object : null,
          message: response.message,
        } satisfies StatCanReleaseData["wdsDownloads"][number];
      } catch (error) {
        return {
          tableId,
          productId,
          status: "ERROR",
          downloadUrl: null,
          message: error instanceof Error ? error.message : "WDS download lookup failed.",
        } satisfies StatCanReleaseData["wdsDownloads"][number];
      }
    }),
  );
}

type WdsMember = {
  memberId: number;
  memberNameEn: string;
  terminated?: number;
};

type WdsDimension = {
  dimensionPositionId: number;
  dimensionNameEn: string;
  member: WdsMember[];
};

type WdsMetadata = {
  productId: string;
  cubeTitleEn: string;
  dimension: WdsDimension[];
};

const canadaGeographies = new Set([
  "Canada",
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
  "Yukon",
  "Northwest Territories",
  "Nunavut",
]);

function memberPriority(member: WdsMember) {
  const name = member.memberNameEn.toLowerCase();
  let score = member.terminated ? -100 : 0;
  if (/^(total|all items|all industries|both sexes|all ages|types? of .* total)/.test(name)) score += 100;
  if (/seasonally adjusted/.test(name) && !/unadjusted/.test(name)) score += 70;
  if (/value of|current dollars|all employees/.test(name)) score += 55;
  if (/cattle|hogs|milk|eggs|wheat|canola|gasoline|food|shelter/.test(name)) score += 25;
  return score;
}

function rankedMembers(dimension: WdsDimension) {
  return [...dimension.member].sort((a, b) => memberPriority(b) - memberPriority(a) || a.memberId - b.memberId);
}

function formatWdsValue(label: string, value: number, scalarFactorCode = 0) {
  const scaled = value * 10 ** scalarFactorCode;
  if (/rate|percent|percentage|index/i.test(label)) return `${value.toFixed(1)}${/rate|percent|percentage/i.test(label) ? "%" : ""}`;
  if (/value|price|sales|income|revenue|permit/i.test(label)) {
    if (Math.abs(scaled) >= 1_000_000_000) return `$${(scaled / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(scaled) >= 1_000_000) return `$${(scaled / 1_000_000).toFixed(1)}M`;
    return `$${scaled.toLocaleString("en-CA", { maximumFractionDigits: 1 })}`;
  }
  return scaled.toLocaleString("en-CA", { maximumFractionDigits: 1 });
}

async function fetchWdsTableSnapshot(productId: string): Promise<StatCanReleaseTable | null> {
  const metadataResponse = await fetch("https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ productId: Number(productId) }]),
    next: { revalidate: 60 * 60 },
  });
  if (!metadataResponse.ok) return null;
  const metadataPayload = (await metadataResponse.json()) as Array<{ status?: string; object?: WdsMetadata }>;
  const metadata = metadataPayload[0]?.object;
  if (!metadata?.dimension?.length) return null;

  const dimensions = [...metadata.dimension].sort((a, b) => a.dimensionPositionId - b.dimensionPositionId);
  const geographyIndex = dimensions.findIndex((dimension) => /geograph/i.test(dimension.dimensionNameEn));
  const geography = geographyIndex >= 0 ? dimensions[geographyIndex] : dimensions[0];
  const geographyMembers = geography.member
    .filter((member) => canadaGeographies.has(member.memberNameEn.trim()))
    .slice(0, canadaGeographies.size);
  const baseMembers = dimensions.map((dimension) => rankedMembers(dimension)[0]);
  const topicIndex = dimensions
    .map((dimension, index) => ({ index, count: index === geographyIndex ? -1 : dimension.member.length }))
    .sort((a, b) => b.count - a.count)[0]?.index ?? -1;
  const topicMembers = topicIndex >= 0 ? rankedMembers(dimensions[topicIndex]).slice(0, 8) : [];
  const geographies = geographyMembers.length ? geographyMembers : rankedMembers(geography).slice(0, 10);
  const topics = topicMembers.length ? topicMembers : [baseMembers[topicIndex]].filter(Boolean);
  const requests = geographies.flatMap((geo) => topics.map((topic) => {
    const selected = baseMembers.map((member, index) => index === geographyIndex ? geo : index === topicIndex ? topic : member);
    const coordinate = [...selected.map((member) => member.memberId), ...Array(Math.max(0, 10 - selected.length)).fill(0)].join(".");
    const context = selected
      .filter((member, index) => index !== geographyIndex && index !== topicIndex && member)
      .map((member) => member.memberNameEn)
      .filter((name) => /value|price|rate|index|number|dollar|unit/i.test(name));
    return { productId: Number(productId), coordinate, latestN: 2, geo, topic, context };
  })).slice(0, 90);
  if (!requests.length) return null;

  const dataResponse = await fetch("https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requests.map(({ productId: pid, coordinate, latestN }) => ({ productId: pid, coordinate, latestN }))),
    next: { revalidate: 60 * 60 },
  });
  if (!dataResponse.ok) return null;
  const payload = (await dataResponse.json()) as Array<{
    status?: string;
    object?: { coordinate?: string; vectorDataPoint?: Array<{ refPer: string; value: number; scalarFactorCode?: number }> };
  }>;
  const requestByCoordinate = new Map(requests.map((request) => [request.coordinate, request]));
  const rows = payload.flatMap((result) => {
    const points = result.object?.vectorDataPoint ?? [];
    if (!points.length) return [];
    const latest = points.at(-1) ?? null;
    const previous = points.at(-2) ?? null;
    if (!latest) return [];
    const request = result.object?.coordinate ? requestByCoordinate.get(result.object.coordinate) : undefined;
    if (!request) return [];
    const label = [...request.context, request.topic.memberNameEn].join(": ");
    const latestValue = latest.value * 10 ** (latest.scalarFactorCode ?? 0);
    const previousValue = previous ? previous.value * 10 ** (previous.scalarFactorCode ?? 0) : null;
    return [{
      group: request.geo.memberNameEn,
      label,
      values: points.map((point) => point.value * 10 ** (point.scalarFactorCode ?? 0)),
      latest: latestValue,
      previous: previousValue,
      change: previousValue === null ? null : Number((latestValue - previousValue).toFixed(2)),
      changePeriod: previous ? `${previous.refPer} to ${latest.refPer}` : latest.refPer,
      display: formatWdsValue(label, latest.value, latest.scalarFactorCode),
      previousDisplay: previous ? formatWdsValue(label, previous.value, previous.scalarFactorCode) : undefined,
      latestPeriod: latest.refPer,
      previousPeriod: previous?.refPer ?? latest.refPer,
    }];
  });
  if (!rows.length) return null;
  const latestPeriod = rows.map((row) => row.latestPeriod).sort().at(-1) ?? "latest period";
  const previousPeriod = rows.map((row) => row.previousPeriod).sort().at(-1) ?? "previous period";

  return {
    title: `${metadata.cubeTitleEn} by province`,
    htmlUrl: `https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=${productId}01`,
    csvUrl: `https://www150.statcan.gc.ca/n1/tbl/csv/${productId}-eng.zip`,
    sourceTableIds: [],
    periods: [previousPeriod, latestPeriod],
    latestPeriod,
    previousPeriod,
    rows: rows.map((row) => ({
      group: row.group,
      label: row.label,
      values: row.values,
      latest: row.latest,
      previous: row.previous,
      change: row.change,
      changePeriod: row.changePeriod,
      display: row.display,
      previousDisplay: row.previousDisplay,
    })),
  };
}

function parseReleaseTable(csv: string, csvUrl: string, htmlUrl: string): StatCanReleaseTable | null {
  const parsed = parseCsv(csv);
  const title = parsed[0]?.[0] || "Release table";
  const headerRowIndex = parsed.findIndex((row) => row.slice(1).filter(Boolean).length >= 2);
  const periods = (parsed[headerRowIndex] ?? []).slice(1).filter(Boolean).map(cleanPeriodLabel);
  const sourceTableIds = extractTableIds(csv);

  if (headerRowIndex < 0 || periods.length === 0) {
    return null;
  }

  const simplePeriodIndexes = periods
    .map((period, index) => ({ period, index }))
    .filter((item) => isSimplePeriod(item.period));
  const latestValueIndex = simplePeriodIndexes.at(-1)?.index ?? Math.min(1, Math.max(0, periods.length - 1));
  const previousValueIndex = simplePeriodIndexes.at(-2)?.index ?? Math.max(0, latestValueIndex - 1);
  const changeColumnIndex =
    periods.findIndex((period, index) => index > latestValueIndex && /\bto\b/i.test(period)) >= 0
      ? periods.findIndex((period, index) => index > latestValueIndex && /\bto\b/i.test(period))
      : -1;
  const possibleUnitRow = parsed[headerRowIndex + 1] ?? [];
  const units = possibleUnitRow.slice(1, periods.length + 1);
  const hasUnitRow = !possibleUnitRow[0] && units.some((unit) => /%|percent|dollar|thousand|million|number|index|person|unit|rate/i.test(unit));
  const latestPeriod = periods[latestValueIndex] ?? "latest period";
  const hasComparablePrevious = previousValueIndex !== latestValueIndex && periods[previousValueIndex] !== periods[latestValueIndex];
  const previousPeriod = hasComparablePrevious ? periods[previousValueIndex] : "previous comparable period unavailable";
  const changePeriod = changeColumnIndex >= 0 ? periods[changeColumnIndex] : `${previousPeriod} to ${latestPeriod}`;
  const latestUnit = hasUnitRow ? units[latestValueIndex] : undefined;
  const previousUnit = hasUnitRow ? units[previousValueIndex] : undefined;
  const changeUnit = hasUnitRow && changeColumnIndex >= 0 ? units[changeColumnIndex] : undefined;

  let currentGroup: string | undefined;
  const rows = parsed
    .slice(headerRowIndex + (hasUnitRow ? 2 : 1))
    .flatMap((row) => {
      const label = row[0]?.replace(/^"+/, "").trim();
      const values = row.slice(1, periods.length + 1).map(toNumber);
      const numericValues = values.filter((value): value is number => value !== null);

      if (label && numericValues.length === 0) {
        currentGroup = label;
        return [];
      }

      const latest = values[latestValueIndex] ?? null;
      const previous = hasComparablePrevious ? (values[previousValueIndex] ?? null) : null;
      const sourceChange = changeColumnIndex >= 0 ? (values[changeColumnIndex] ?? null) : null;

      return [{
        group: currentGroup,
        label,
        values: values.map((value) => value ?? Number.NaN),
        latest,
        previous,
        change:
          sourceChange !== null
            ? sourceChange
            : latest !== null && previous !== null
              ? Number((latest - previous).toFixed(2))
              : null,
        changePeriod,
        unit: latestUnit,
        previousUnit,
        changeUnit,
        numericCount: numericValues.length,
      }];
    })
    .filter((row) => row.label && row.numericCount >= 2 && !row.label.toLowerCase().includes("canada"))
    .slice(0, 300)
    .map((row) => ({
      group: row.group,
      label: row.label,
      values: row.values,
      latest: row.latest,
      previous: row.previous,
      change: row.change,
      changePeriod: row.changePeriod,
      unit: row.unit,
      changeUnit: row.changeUnit,
      display: row.latest === null ? undefined : formatTableValue(row.label, row.latest, row.unit),
      previousDisplay: row.previous === null ? undefined : formatTableValue(row.label, row.previous, row.previousUnit),
    }));

  if (rows.length === 0) {
    return null;
  }

  return {
    title,
    htmlUrl,
    csvUrl,
    sourceTableIds,
    periods,
    latestPeriod,
    previousPeriod,
    rows,
  };
}

function signalsFromTables(tables: StatCanReleaseTable[]): ReleaseSignal[] {
  const rows = tables[0]?.rows ?? [];
  const nationalRows = rows.filter((row) => row.group === "Canada");
  const candidates = nationalRows.length ? nationalRows : rows;
  const signalRows = candidates.filter((row, index) => candidates.findIndex((candidate) => candidate.label === row.label) === index);
  const latestPeriod = tables[0]?.latestPeriod ?? "latest period";

  return signalRows.slice(0, 8).map((row) => {
    const value = row.latest ?? 0;
    const change = row.change;
    const display = row.display ?? formatSignalDisplay(row.label, value);
    const changeDisplay = formatTableChange(row.label, change, row.changeUnit);

    return {
      label: row.label,
      value,
      display,
      direction: change === null || change === 0 ? "neutral" : change > 0 ? "up" : "down",
      explanation: `${row.label}: ${display} in ${latestPeriod}; ${changeDisplay} over ${row.changePeriod}.`,
      previous: row.previous,
      previousDisplay: row.previousDisplay ?? (row.previous === null ? undefined : formatSignalDisplay(row.label, row.previous)),
      change,
      changeDisplay,
      period: latestPeriod,
      changePeriod: row.changePeriod,
    };
  });
}

export async function fetchStatCanReleaseData(entry: StatCanDailyEntry): Promise<StatCanReleaseData> {
  const releaseUrl = normalizeReleaseUrl(entry.href);
  const releaseResponse = await fetch(releaseUrl, {
    headers: { "User-Agent": "Canada Pulse StatCan table importer" },
    next: { revalidate: 60 * 60 },
  });

  if (!releaseResponse.ok) {
    throw new Error(`StatCan release fetch failed ${releaseResponse.status}`);
  }

  const releaseHtml = await releaseResponse.text();
  const companionHtml = (await Promise.all(extractCompanionTableUrls(releaseHtml, releaseUrl).map(async (url) => {
    const response = await fetch(url, { headers: { "User-Agent": "Canada Pulse StatCan table importer" }, next: { revalidate: 60 * 60 } });
    return response.ok ? response.text() : "";
  }))).join("\n");
  const tableIds = [...new Set([...extractTableIds(releaseHtml), ...extractTableIds(companionHtml)])];
  const tableLinks = extractTableLinks(releaseHtml, releaseUrl);

  const tables = (
    await Promise.all(
      tableLinks.slice(0, 3).map(async (link) => {
        const response = await fetch(link.csvUrl, {
          headers: { "User-Agent": "Canada Pulse StatCan table importer" },
          next: { revalidate: 60 * 60 },
        });

        if (!response.ok) return null;
        return parseReleaseTable(await response.text(), link.csvUrl, link.htmlUrl);
      }),
    )
  ).filter((table): table is StatCanReleaseTable => Boolean(table));

  const wdsTables = tables.length ? [] : (await Promise.all(tableIds.slice(0, 2).map((tableId) => fetchWdsTableSnapshot(tableIdToProductId(tableId)).catch(() => null))))
    .filter((table): table is StatCanReleaseTable => Boolean(table));
  const allTables = [...tables, ...wdsTables];
  const mergedTableIds = [...new Set([...tableIds, ...allTables.flatMap((table) => table.sourceTableIds)])];
  const wdsDownloads = await fetchWdsDownloads(mergedTableIds);
  const signals = signalsFromTables(allTables);

  return {
    releaseUrl,
    tableIds: mergedTableIds,
    tableLinks,
    wdsDownloads,
    tables: allTables,
    signals,
    sourceStatus: allTables.length ? "table_data_loaded" : tableLinks.length || tableIds.length ? "table_links_detected" : "summary_only",
  };
}
