import type { StatCanDailyEntry, ReleaseSignal } from "@/lib/statcan-daily";
import { fetchStatCanFullTableDownloadCsv } from "@/lib/etl/statcan-adapter";

export type StatCanReleaseTable = {
  title: string;
  htmlUrl: string;
  csvUrl: string;
  sourceTableIds: string[];
  periods: string[];
  rows: Array<{
    label: string;
    values: number[];
    latest: number | null;
    previous: number | null;
    change: number | null;
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

function tableIdToProductId(tableId: string) {
  return tableId.replace(/\D/g, "").slice(0, 8);
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

function parseReleaseTable(csv: string, csvUrl: string, htmlUrl: string): StatCanReleaseTable | null {
  const parsed = parseCsv(csv);
  const title = parsed[0]?.[0] || "Release table";
  const headerRowIndex = parsed.findIndex((row) => row.slice(1).filter(Boolean).length >= 2);
  const periods = (parsed[headerRowIndex] ?? []).slice(1).filter(Boolean);
  const sourceTableIds = extractTableIds(csv);

  if (headerRowIndex < 0 || periods.length === 0) {
    return null;
  }

  const rows = parsed
    .slice(headerRowIndex + 1)
    .map((row) => {
      const label = row[0]?.replace(/^"+/, "").trim();
      const values = row.slice(1, periods.length + 1).map(toNumber);
      const numericValues = values.filter((value): value is number => value !== null);
      const latest = values.at(-1) ?? null;
      const previous = values.at(-2) ?? null;

      return {
        label,
        values: values.map((value) => value ?? Number.NaN),
        latest,
        previous,
        change: latest !== null && previous !== null ? Number((latest - previous).toFixed(2)) : null,
        numericCount: numericValues.length,
      };
    })
    .filter((row) => row.label && row.numericCount >= 2 && !row.label.toLowerCase().includes("canada"))
    .slice(0, 12)
    .map((row) => ({
      label: row.label,
      values: row.values,
      latest: row.latest,
      previous: row.previous,
      change: row.change,
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
    rows,
  };
}

function signalsFromTables(tables: StatCanReleaseTable[]): ReleaseSignal[] {
  const rows = tables[0]?.rows ?? [];
  const latestPeriod = tables[0]?.periods.at(-1) ?? "latest period";

  return rows.slice(0, 8).map((row) => {
    const value = row.latest ?? 0;

    return {
      label: row.label,
      value,
      display: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
      direction: value > 0 ? "up" : value < 0 ? "down" : "neutral",
      explanation: `${row.label}: ${value > 0 ? "up" : value < 0 ? "down" : "flat"} ${Math.abs(value).toFixed(1)}% in ${latestPeriod}.`,
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
  const tableIds = extractTableIds(releaseHtml);
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

  const mergedTableIds = [...new Set([...tableIds, ...tables.flatMap((table) => table.sourceTableIds)])];
  const wdsDownloads = await fetchWdsDownloads(mergedTableIds);
  const signals = signalsFromTables(tables);

  return {
    releaseUrl,
    tableIds: mergedTableIds,
    tableLinks,
    wdsDownloads,
    tables,
    signals,
    sourceStatus: tables.length ? "table_data_loaded" : tableLinks.length ? "table_links_detected" : "summary_only",
  };
}
