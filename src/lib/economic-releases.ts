export function getCanadaReleaseDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const economicReleaseSchedule = [
  {
    slug: "monthly-gdp-by-industry",
    name: "Monthly GDP by industry",
    source: "Statistics Canada",
    tableIds: ["36-10-0434-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "official-release-calendar",
    expectedReferencePeriod: "latest monthly GDP reference period",
    sourceUrl: "https://www150.statcan.gc.ca/n1/en/type/data",
    promoteOnHomepage: true,
  },
  {
    slug: "quarterly-gdp-income-expenditure",
    name: "GDP by income and expenditure",
    source: "Statistics Canada",
    tableIds: ["36-10-0104-01", "36-10-0112-01"],
    releaseCadence: "quarterly",
    nextReleaseDate: "official-release-calendar",
    expectedReferencePeriod: "latest quarterly GDP reference period",
    sourceUrl: "https://www150.statcan.gc.ca/n1/en/type/data",
    promoteOnHomepage: true,
  },
  {
    slug: "labour-force-survey",
    name: "Labour Force Survey",
    source: "Statistics Canada",
    tableIds: ["14-10-0287-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "official-release-calendar",
    expectedReferencePeriod: "latest monthly labour market",
    sourceUrl: "https://www.statcan.gc.ca/en/survey/household/3701",
    promoteOnHomepage: true,
  },
  {
    slug: "consumer-price-index",
    name: "Consumer Price Index",
    source: "Statistics Canada",
    tableIds: ["18-10-0004-01"],
    releaseCadence: "monthly",
    nextReleaseDate: "official-release-calendar",
    expectedReferencePeriod: "latest monthly CPI",
    sourceUrl: "https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes",
    promoteOnHomepage: true,
  },
] as const;
