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
    label: "Statistics Canada table API",
    appArea: "CPI, labour, GDP, population, trade",
    publisher: "Statistics Canada",
    sourceUrl: "https://www.statcan.gc.ca/en/developers/wds",
    refreshCadence: "Release-driven",
    status: "source-linked",
    latestKnownPeriod: "Official WDS methods available",
    implementation: "WDS endpoints are linked; table/vector mappings must be completed per indicator.",
  },
  {
    slug: "cmhc-housing-market-data",
    label: "CMHC housing market data",
    appArea: "Housing, rent, starts, completions, supply",
    publisher: "CMHC",
    sourceUrl:
      "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/housing-market-data",
    refreshCadence: "Monthly/annual by dataset",
    status: "needs-table-import",
    latestKnownPeriod: "CMHC publishes current housing data tables and portal updates",
    implementation:
      "Source is linked now. Next step is importing CMHC table exports into TimeSeriesValue rows by province/city.",
  },
  {
    slug: "cmhc-starts-completions",
    label: "Starts, completions and under construction",
    appArea: "Housing supply and population pressure",
    publisher: "CMHC",
    sourceUrl:
      "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/housing-market-data/starts-completions-units-under-construction-geography",
    refreshCadence: "Monthly",
    status: "live-feed",
    latestKnownPeriod: "Official table import connected",
    implementation: "Imports the official StatCan/CMHC housing construction table and builds starts/completions release facts.",
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
      "Canada Pulse has live release feeds connected now. Some category dashboards still use seeded values until their official tables are imported into the database.",
  };
}
