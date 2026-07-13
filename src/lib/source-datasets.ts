import { indicators } from "@/lib/mock-data";

export type SourceDatasetSeed = {
  slug: string;
  label: string;
  publisher: string;
  officialUrl: string;
  apiType: "STATCAN_WDS" | "STATCAN_DAILY" | "CMHC_TABLE" | "CKAN" | "XLSX" | "CSV" | "HTML" | "MANUAL";
  cadence: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  licenseNote: string;
  updateStatus: "LIVE" | "SOURCE_LINKED" | "IMPORT_PENDING" | "NEEDS_SOURCE" | "LICENSED_SOURCE_NEEDED";
  latestKnownPeriod?: string;
};

export type IndicatorSourceMapSeed = {
  indicatorSlug: string;
  sourceDatasetSlug: string;
  sourceIndicatorKey?: string;
  productId?: string;
  vectorId?: string;
  fieldPath?: string;
  geographyMapping?: Record<string, string>;
  unitConversion?: string;
  transformRule?: string;
  importStatus: SourceDatasetSeed["updateStatus"];
  priority?: number;
};

export const sourceDatasets: SourceDatasetSeed[] = [
  {
    slug: "statcan-daily-economic-releases",
    label: "Statistics Canada Daily economic releases",
    publisher: "Statistics Canada",
    officialUrl: "https://www.statcan.gc.ca/en/sc/rss",
    apiType: "STATCAN_DAILY",
    cadence: "DAILY",
    licenseNote: "Official Statistics Canada release feed.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Live release feed",
  },
  {
    slug: "statcan-wds-cpi",
    label: "Consumer Price Index",
    publisher: "Statistics Canada",
    officialUrl: "https://www.statcan.gc.ca/en/developers/wds",
    apiType: "STATCAN_WDS",
    cadence: "MONTHLY",
    licenseNote: "Official Statistics Canada WDS table data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "WDS table mapping required",
  },
  {
    slug: "statcan-wds-labour",
    label: "Labour Force Survey",
    publisher: "Statistics Canada",
    officialUrl: "https://www.statcan.gc.ca/en/developers/wds",
    apiType: "STATCAN_WDS",
    cadence: "MONTHLY",
    licenseNote: "Official Statistics Canada WDS table data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "WDS table mapping required",
  },
  {
    slug: "statcan-wds-gdp",
    label: "GDP and productivity tables",
    publisher: "Statistics Canada",
    officialUrl: "https://www.statcan.gc.ca/en/developers/wds",
    apiType: "STATCAN_WDS",
    cadence: "QUARTERLY",
    licenseNote: "Official Statistics Canada WDS table data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "WDS table mapping required",
  },
  {
    slug: "statcan-wds-population-income-trade",
    label: "Population, income and trade tables",
    publisher: "Statistics Canada",
    officialUrl: "https://www.statcan.gc.ca/en/developers/wds",
    apiType: "STATCAN_WDS",
    cadence: "QUARTERLY",
    licenseNote: "Official Statistics Canada WDS table data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "WDS table mapping required",
  },
  {
    slug: "cmhc-housing-market-data",
    label: "CMHC housing market data",
    publisher: "CMHC",
    officialUrl:
      "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables",
    apiType: "CMHC_TABLE",
    cadence: "MONTHLY",
    licenseNote: "Official CMHC housing tables. Some table pages export CSV/XLSX.",
    updateStatus: "IMPORT_PENDING",
    latestKnownPeriod: "CMHC table import pending",
  },
  {
    slug: "cmhc-housing-starts",
    label: "CMHC quarterly housing construction",
    publisher: "CMHC",
    officialUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data",
    apiType: "CMHC_TABLE",
    cadence: "QUARTERLY",
    licenseNote: "Official CMHC housing construction data distributed through Statistics Canada table 34-10-0135-01.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Latest quarterly starts by province and unit type",
  },
  {
    slug: "cmhc-rental-market",
    label: "CMHC rental market data",
    publisher: "CMHC",
    officialUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data",
    apiType: "CMHC_TABLE",
    cadence: "MONTHLY",
    licenseNote: "Official CMHC rental market data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "Detailed rental importer pending",
  },
  {
    slug: "cmhc-mortgage-debt",
    label: "CMHC mortgage and debt data",
    publisher: "CMHC",
    officialUrl: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data",
    apiType: "CMHC_TABLE",
    cadence: "MONTHLY",
    licenseNote: "Official CMHC mortgage and debt data.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "Detailed mortgage/debt importer pending",
  },
  {
    slug: "bank-of-canada-valet",
    label: "Bank of Canada Valet financial data",
    publisher: "Bank of Canada",
    officialUrl: "https://www.bankofcanada.ca/valet/docs",
    apiType: "CSV",
    cadence: "DAILY",
    licenseNote: "Official Bank of Canada Valet API.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Live rate observation",
  },
  {
    slug: "bank-of-canada-reports",
    label: "Bank of Canada reports and surveys",
    publisher: "Bank of Canada",
    officialUrl: "https://www.bankofcanada.ca/rss-feeds/",
    apiType: "HTML",
    cadence: "DAILY",
    licenseNote: "Official Bank of Canada publication feeds and report pages.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Publication report monitor",
  },
  {
    slug: "finance-canada-fiscal",
    label: "Finance Canada fiscal data",
    publisher: "Department of Finance Canada",
    officialUrl: "https://www.canada.ca/en/department-finance/services/publications/fiscal-monitor.html",
    apiType: "HTML",
    cadence: "MONTHLY",
    licenseNote: "Official Government of Canada fiscal publications.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Latest Fiscal Monitor summary table",
  },
  {
    slug: "finance-canada-fiscal-monitor",
    label: "Finance Canada Fiscal Monitor",
    publisher: "Department of Finance Canada",
    officialUrl: "https://www.canada.ca/en/department-finance/services/publications/fiscal-monitor.html",
    apiType: "HTML",
    cadence: "MONTHLY",
    licenseNote: "Official Government of Canada fiscal publication.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Revenue, program expenses, public debt charges and budgetary balance",
  },
  {
    slug: "open-government-ircc",
    label: "IRCC Open Government datasets",
    publisher: "Open Government Canada / IRCC",
    officialUrl: "https://search.open.canada.ca/opendata/?owner_org=cic",
    apiType: "CKAN",
    cadence: "MONTHLY",
    licenseNote: "Official Government of Canada open data catalogue and resources.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Open Government metadata monitor",
  },
  {
    slug: "cihi-health-indicators",
    label: "CIHI health indicators",
    publisher: "Canadian Institute for Health Information",
    officialUrl: "https://www.cihi.ca/en/access-data-and-reports/indicator-library/download-indicator-data",
    apiType: "XLSX",
    cadence: "ANNUAL",
    licenseNote: "CIHI public indicator data download.",
    updateStatus: "IMPORT_PENDING",
    latestKnownPeriod: "Importer pending",
  },
  {
    slug: "cihi-national-health-expenditure",
    label: "CIHI National Health Expenditure Trends",
    publisher: "Canadian Institute for Health Information",
    officialUrl: "https://www.cihi.ca/en/national-health-expenditure-trends",
    apiType: "HTML",
    cadence: "ANNUAL",
    licenseNote: "Official CIHI national health expenditure summary.",
    updateStatus: "LIVE",
    latestKnownPeriod: "2025 expenditure estimates",
  },
  {
    slug: "phac-chronic-disease",
    label: "PHAC chronic disease surveillance",
    publisher: "Public Health Agency of Canada",
    officialUrl: "https://health-infobase.canada.ca/ccdss/",
    apiType: "CSV",
    cadence: "ANNUAL",
    licenseNote: "Official public health surveillance data.",
    updateStatus: "IMPORT_PENDING",
    latestKnownPeriod: "Importer pending",
  },
  {
    slug: "cer-nrcan-energy",
    label: "CER and NRCan energy data",
    publisher: "Canada Energy Regulator / Natural Resources Canada",
    officialUrl: "https://www.cer-rec.gc.ca/en/data-analysis/",
    apiType: "CSV",
    cadence: "MONTHLY",
    licenseNote: "Official energy regulator and government energy data.",
    updateStatus: "IMPORT_PENDING",
    latestKnownPeriod: "Importer pending",
  },
  {
    slug: "pbo-fiscal-reports",
    label: "Parliamentary Budget Officer fiscal reports",
    publisher: "Parliamentary Budget Officer",
    officialUrl: "https://www.pbo-dpb.ca/en/",
    apiType: "HTML",
    cadence: "ANNUAL",
    licenseNote: "Official PBO reports and releases.",
    updateStatus: "SOURCE_LINKED",
    latestKnownPeriod: "PBO report monitor linked",
  },
  {
    slug: "gaswizard-prices",
    label: "GasWizard pump prices",
    publisher: "GasWizard.ca",
    officialUrl: "https://gaswizard.ca/price-history/",
    apiType: "HTML",
    cadence: "DAILY",
    licenseNote: "Third-party live fuel price tracker; label separately from official sources.",
    updateStatus: "LIVE",
    latestKnownPeriod: "Live city pages",
  },
  {
    slug: "licensed-resale-benchmark-needed",
    label: "Resale benchmark home price source",
    publisher: "Licensed/public source required",
    officialUrl: "https://www.crea.ca/housing-market-stats/",
    apiType: "MANUAL",
    cadence: "MONTHLY",
    licenseNote: "Use only after confirming licensing or public-source availability.",
    updateStatus: "LICENSED_SOURCE_NEEDED",
    latestKnownPeriod: "Source decision pending",
  },
];

function sourceForIndicator(indicatorSlug: string) {
  if (indicatorSlug === "food-inflation") return { slug: "statcan-wds-cpi", productId: "18-10-0004-01" };
  if (indicatorSlug.includes("unemployment")) return { slug: "statcan-wds-labour", productId: "14-10-0287-01" };
  if (indicatorSlug.includes("gdp") || indicatorSlug.includes("productivity")) return { slug: "statcan-wds-gdp", productId: "36-10-0104-01" };
  if (indicatorSlug.includes("income") || indicatorSlug.includes("population") || indicatorSlug.includes("exports")) {
    return { slug: "statcan-wds-population-income-trade" };
  }
  if (indicatorSlug.includes("home-price")) return { slug: "licensed-resale-benchmark-needed" };
  if (indicatorSlug.includes("rent") || indicatorSlug.includes("housing")) return { slug: "cmhc-housing-market-data" };
  if (indicatorSlug.includes("health") || indicatorSlug.includes("doctor")) return { slug: "cihi-health-indicators" };
  if (indicatorSlug.includes("diabetes") || indicatorSlug.includes("cardiovascular")) return { slug: "phac-chronic-disease" };
  if (indicatorSlug.includes("debt") || indicatorSlug.includes("spending")) return { slug: "finance-canada-fiscal" };
  if (indicatorSlug.includes("oil") || indicatorSlug.includes("electricity")) return { slug: "cer-nrcan-energy" };
  if (indicatorSlug.includes("crime") || indicatorSlug.includes("life") || indicatorSlug.includes("childcare")) {
    return { slug: "statcan-wds-population-income-trade" };
  }
  return { slug: "statcan-wds-population-income-trade" };
}

export const indicatorSourceMaps: IndicatorSourceMapSeed[] = indicators.map((indicator) => {
  const source = sourceForIndicator(indicator.slug);
  const dataset = sourceDatasets.find((item) => item.slug === source.slug);

  return {
    indicatorSlug: indicator.slug,
    sourceDatasetSlug: source.slug,
    sourceIndicatorKey: indicator.slug,
    productId: "productId" in source ? source.productId : undefined,
    transformRule: "Normalize period/geography, convert unit when needed, write TimeSeriesValue rows.",
    unitConversion: `source to ${indicator.unit}`,
    importStatus: dataset?.updateStatus ?? "SOURCE_LINKED",
    priority: 1,
  };
});
