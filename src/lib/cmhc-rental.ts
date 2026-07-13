import { readWorkbook } from "@/lib/xlsx-lite";

export type CmhcRentalMarket = {
  geography: string;
  kind: "canada" | "province" | "metro";
  vacancyRate: number;
  previousVacancyRate: number;
  vacancyChange: number;
  turnoverRate: number | null;
  previousTurnoverRate: number | null;
  averageTwoBedroomRent: number;
  previousAverageTwoBedroomRent: number;
  rentChangeAmount: number;
  rentGrowthPct: number | null;
  vacancyQuality: string | null;
  rentQuality: string | null;
};

export type CmhcRentalSnapshot = {
  releaseDate: string;
  referencePeriod: string;
  previousPeriod: string;
  sourceUrl: string;
  workbookUrl: string;
  canada: CmhcRentalMarket;
  provinces: CmhcRentalMarket[];
  metros: CmhcRentalMarket[];
  definition: string;
};

const sourceUrl = "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables";

async function fetchOfficial(url: string, timeoutMs: number) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Canada Pulse CMHC rental importer" },
        next: { revalidate: 12 * 60 * 60 },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok || (response.status < 500 && response.status !== 429)) return response;
      lastError = new Error(`CMHC rental resource returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : new Error("CMHC rental resource fetch failed.");
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value || value === "**" || value === "++") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizedProvince(value: string) {
  return value.replace(/\s+10,000\+$/, "").replace(/^Québec$/, "Quebec");
}

function marketFromRow(row: Array<string | number | null>): CmhcRentalMarket | null {
  const rawGeography = typeof row[0] === "string" ? row[0] : "";
  const vacancyRate = toNumber(row[3]);
  const previousVacancyRate = toNumber(row[1]);
  const averageRent = toNumber(row[13]);
  const previousAverageRent = toNumber(row[11]);
  if (!rawGeography || vacancyRate === null || previousVacancyRate === null || averageRent === null || previousAverageRent === null) return null;
  const kind = rawGeography === "Canada 10,000+" ? "canada" : rawGeography.endsWith("10,000+") ? "province" : /\b(CMA|CA)\b/.test(rawGeography) ? "metro" : null;
  if (!kind) return null;

  return {
    geography: kind === "canada" ? "Canada" : kind === "province" ? normalizedProvince(rawGeography) : rawGeography,
    kind,
    vacancyRate,
    previousVacancyRate,
    vacancyChange: Number((vacancyRate - previousVacancyRate).toFixed(1)),
    turnoverRate: toNumber(row[8]),
    previousTurnoverRate: toNumber(row[6]),
    averageTwoBedroomRent: averageRent,
    previousAverageTwoBedroomRent: previousAverageRent,
    rentChangeAmount: averageRent - previousAverageRent,
    rentGrowthPct: toNumber(row[17]),
    vacancyQuality: typeof row[4] === "string" ? row[4] : null,
    rentQuality: typeof row[14] === "string" ? row[14] : null,
  };
}

function publishedDate(html: string) {
  const raw = html.match(/id="DatePublishedTag"[^>]*>([^<]+)</i)?.[1]?.trim();
  if (!raw) return "2025-12-11";
  const parsed = new Date(`${raw} 12:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? "2025-12-11" : parsed.toISOString().slice(0, 10);
}

function surveyPeriod(value: string | number | null | undefined, fallback: string) {
  if (typeof value !== "string") return fallback;
  const match = value.trim().match(/^([A-Za-z]{3})-(\d{2})$/);
  if (!match) return value.trim() || fallback;
  const month = ({ Jan: "January", Apr: "April", Jul: "July", Oct: "October" } as Record<string, string>)[match[1]] ?? match[1];
  return `${month} 20${match[2]}`;
}

export async function fetchCmhcRentalSnapshot(): Promise<CmhcRentalSnapshot> {
  const pageResponse = await fetchOfficial(sourceUrl, 8_000);
  if (!pageResponse.ok) throw new Error(`CMHC rental page failed: ${pageResponse.status}`);
  const html = await pageResponse.text();
  const workbookUrl = html.match(/id="document-url"[^>]+value="([^"]+\.xlsx[^"]*)"/i)?.[1]?.replace(/&amp;/g, "&");
  if (!workbookUrl) throw new Error("CMHC rental workbook URL not found.");
  const workbookResponse = await fetchOfficial(workbookUrl, 12_000);
  if (!workbookResponse.ok) throw new Error(`CMHC rental workbook failed: ${workbookResponse.status}`);
  const workbook = readWorkbook(await workbookResponse.arrayBuffer());
  const table = workbook.find((sheet) => sheet.name === "Table 1.0");
  if (!table) throw new Error("CMHC Rental Market Survey Table 1.0 not found.");
  const markets = table.rows.map(marketFromRow).filter((market): market is CmhcRentalMarket => Boolean(market));
  const canada = markets.find((market) => market.kind === "canada");
  if (!canada) throw new Error("CMHC national rental-market row not found.");
  const provinces = markets.filter((market) => market.kind === "province");
  const metros = markets.filter((market) => market.kind === "metro");
  if (provinces.length !== 10) throw new Error(`CMHC rental workbook returned ${provinces.length} provinces; expected 10.`);
  if (metros.length < 30) throw new Error(`CMHC rental workbook returned only ${metros.length} metro rows.`);
  if (canada.averageTwoBedroomRent < 500 || canada.averageTwoBedroomRent > 5_000) {
    throw new Error(`CMHC national two-bedroom rent failed integrity range: ${canada.averageTwoBedroomRent}.`);
  }
  if (canada.vacancyRate < 0 || canada.vacancyRate > 20) {
    throw new Error(`CMHC national vacancy rate failed integrity range: ${canada.vacancyRate}.`);
  }
  const currentHeader = table.rows[4]?.[3];
  const previousHeader = table.rows[4]?.[1];

  return {
    releaseDate: publishedDate(html),
    referencePeriod: surveyPeriod(currentHeader, "October 2025"),
    previousPeriod: surveyPeriod(previousHeader, "October 2024"),
    sourceUrl,
    workbookUrl,
    canada,
    provinces,
    metros,
    definition: "CMHC Rental Market Survey: privately initiated apartment structures of three units and over in centres with at least 10,000 people; average rent is for two-bedroom units in new and existing structures.",
  };
}
