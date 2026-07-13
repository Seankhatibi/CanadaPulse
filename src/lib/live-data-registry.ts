export type LiveDataConnection = {
  slug: string;
  label: string;
  appArea: string;
  publisher: string;
  sourceUrl: string;
  refreshCadence: string;
  status: "live-feed" | "source-linked" | "needs-table-import";
  latestKnownPeriod: string;
  implementation: string;
};

export const liveDataConnections: LiveDataConnection[] = [
  {
    slug: "statcan-daily-economic-releases",
    label: "Daily economic releases",
    appArea: "Homepage, Weekly Pulse, Release explainers",
    publisher: "Statistics Canada",
    sourceUrl: "https://www.statcan.gc.ca/en/sc/rss",
    refreshCadence: "Daily",
    status: "live-feed",
    latestKnownPeriod: "Live StatCan Daily feed plus rolling direct Daily URL probes",
    implementation:
      "Fetched through StatCan Atom feeds plus recent direct Daily URL probes across release suffixes, then ranked in Canada Pulse.",
  },
  {
    slug: "statcan-wds",
    label: "Statistics Canada release tables and WDS",
    appArea: "CPI, labour, GDP, population, trade",
    publisher: "Statistics Canada",
    sourceUrl: "https://www.statcan.gc.ca/en/developers/wds",
    refreshCadence: "Release-driven",
    status: "live-feed",
    latestKnownPeriod: "Latest structured Daily releases",
    implementation: "Discovers release companion tables, resolves compact WDS vectors and imports national and provincial observations into normalized release charts.",
  },
  {
    slug: "cmhc-rental-market",
    label: "CMHC Rental Market Survey",
    appArea: "Housing, rent, vacancy, turnover, province and metro comparisons",
    publisher: "CMHC",
    sourceUrl:
      "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables",
    refreshCadence: "Annual release check",
    status: "live-feed",
    latestKnownPeriod: "October 2025 survey",
    implementation: "Discovers and parses CMHC's current official workbook into national, 10-province and 44-metro rent, vacancy and turnover breakdowns.",
  },
  {
    slug: "bank-of-canada-valet-reports",
    label: "Bank of Canada rates and reports",
    appArea: "Rates, inflation expectations, business outlook, financial conditions",
    publisher: "Bank of Canada",
    sourceUrl: "https://www.bankofcanada.ca/valet/docs",
    refreshCadence: "Daily and release-driven",
    status: "live-feed",
    latestKnownPeriod: "Latest Valet observations and report publications",
    implementation: "Imports policy and market-rate observations from Valet and monitors eight official report families for structured visual explainers.",
  },
  {
    slug: "finance-canada-fiscal-monitor",
    label: "Finance Canada Fiscal Monitor",
    appArea: "Government revenue, spending, deficit and debt charges",
    publisher: "Finance Canada",
    sourceUrl: "https://www.canada.ca/en/department-finance/services/publications/fiscal-monitor.html",
    refreshCadence: "Monthly release check",
    status: "live-feed",
    latestKnownPeriod: "2025-26 fiscal year",
    implementation: "Parses the official Fiscal Monitor tables into revenue, program expense, deficit and public-debt-charge facts.",
  },
  {
    slug: "ircc-open-data-flows",
    label: "IRCC immigration flows",
    appArea: "Permanent residents, study permits, work permits, asylum and provinces",
    publisher: "Immigration, Refugees and Citizenship Canada",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/reports-statistics/statistics-open-data.html",
    refreshCadence: "Monthly metadata and resource check",
    status: "live-feed",
    latestKnownPeriod: "April 2026 flows",
    implementation: "Imports official CSV/TSV records for PR admissions, study and work permit holders, asylum claimants, categories and provincial destinations.",
  },
  {
    slug: "cer-nrcan-energy-monitor",
    label: "CER and NRCan energy releases",
    appArea: "Energy production, pipelines, electricity and exports",
    publisher: "Canada Energy Regulator / Natural Resources Canada",
    sourceUrl: "https://www.cer-rec.gc.ca/en/data-analysis/",
    refreshCadence: "Daily release check",
    status: "live-feed",
    latestKnownPeriod: "Latest official energy market snapshot",
    implementation: "Monitors official energy analysis releases and extracts source-backed headline values into normalized release charts.",
  },
  {
    slug: "pbo-fiscal-reports",
    label: "Parliamentary Budget Officer reports",
    appArea: "Fiscal outlook, budget costing and debt sustainability",
    publisher: "Office of the Parliamentary Budget Officer",
    sourceUrl: "https://www.pbo-dpb.ca/en/publications",
    refreshCadence: "Daily publication check",
    status: "source-linked",
    latestKnownPeriod: "Latest publication page monitored",
    implementation: "Publication detection is connected; report-specific structured table extraction remains pending.",
  },
  {
    slug: "cmhc-starts-completions",
    label: "Quarterly housing construction",
    appArea: "Housing supply and population pressure",
    publisher: "CMHC",
    sourceUrl:
      "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/housing-market-data/starts-completions-units-under-construction-geography",
    refreshCadence: "Quarterly release check",
    status: "live-feed",
    latestKnownPeriod: "Official quarterly table import connected",
    implementation:
      "Imports Statistics Canada table 34-10-0135-01, sourced from CMHC, and builds national, provincial and unit-type housing-start facts.",
  },
  {
    slug: "gaswizard-prices",
    label: "GasWizard pump prices",
    appArea: "Energy and homepage pressure tracker",
    publisher: "GasWizard.ca",
    sourceUrl: "https://gaswizard.ca/price-history/",
    refreshCadence: "Hourly/daily page monitor",
    status: "live-feed",
    latestKnownPeriod: "Current city pages",
    implementation: "Homepage gas tracker fetches live GasWizard data with fallback.",
  },
  {
    slug: "cihi-national-health-expenditure",
    label: "National Health Expenditure Trends",
    appArea: "Health spending and system capacity",
    publisher: "Canadian Institute for Health Information",
    sourceUrl: "https://www.cihi.ca/en/national-health-expenditure-trends",
    refreshCadence: "Twice-daily check; annual release",
    status: "live-feed",
    latestKnownPeriod: "2025 expenditure estimates",
    implementation: "Parses CIHI's official expenditure summary into source-backed health metrics.",
  },
];

export function getLiveDataConnectionsByArea(area: string) {
  const normalized = area.toLowerCase();

  return liveDataConnections.filter((connection) => connection.appArea.toLowerCase().includes(normalized));
}

export function getLiveDataSummary() {
  const live = liveDataConnections.filter((connection) => connection.status === "live-feed").length;
  const linked = liveDataConnections.filter((connection) => connection.status === "source-linked").length;
  const pending = liveDataConnections.filter((connection) => connection.status === "needs-table-import").length;

  return {
    live,
    linked,
    pending,
    total: liveDataConnections.length,
    read:
      pending
        ? "Canada Pulse is reading live source adapters now. Pending imports and third-party sources are labeled separately."
        : linked
          ? "Canada Pulse is reading live source adapters now; source-linked monitors are clearly separated from structured imports."
          : "Every listed source adapter currently exposes structured values.",
  };
}
