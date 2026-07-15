export type GasWizardCityPrice = {
  city: string;
  slug: string;
  url: string;
  currentAverage: number | null;
  regular: number | null;
  premium: number | null;
  diesel: number | null;
  reportedAt: string | null;
};

export type GasWizardPulse = {
  source: "GasWizard.ca";
  sourceUrl: string;
  fetchedAt: string;
  highest: {
    city: string;
    price: number;
  } | null;
  lowest: GasWizardCityPrice | null;
  cities: GasWizardCityPrice[];
};

const GASWIZARD_BASE_URL = "https://gaswizard.ca";

const trackedGasWizardCities = [
  { city: "Vancouver", slug: "vancouver" },
  { city: "Toronto", slug: "toronto" },
  { city: "Montreal", slug: "montreal" },
  { city: "Calgary", slug: "calgary" },
  { city: "Ottawa", slug: "ottawa" },
  { city: "Halifax", slug: "halifax" },
  { city: "Winnipeg", slug: "winnipeg" },
  { city: "St Johns", slug: "st-johns" },
];

function firstNumber(pattern: RegExp, html: string) {
  const match = html.match(pattern);
  return match?.[1] ? Number(match[1]) : null;
}

function firstText(pattern: RegExp, html: string) {
  const match = html.match(pattern);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? null;
}

function parseCityPage(city: string, slug: string, html: string): GasWizardCityPrice {
  const url = `${GASWIZARD_BASE_URL}/gas-prices/${slug}/`;
  const singleCityBlock = html.match(/<ul class="single-city-prices[\s\S]*?<\/ul>/)?.[0] ?? html;

  return {
    city,
    slug,
    url,
    currentAverage: firstNumber(/<h3>Current Average Price<\/h3>\s*<span class="price">\$([0-9.]+)<\/span>/, html),
    regular: firstNumber(/<div class="fueltitle">Regular<\/div><div class="fuelprice">([0-9.]+)/, singleCityBlock),
    premium: firstNumber(/<div class="fueltitle">Premium<\/div><div class="fuelprice">([0-9.]+)/, singleCityBlock),
    diesel: firstNumber(/<div class="fueltitle">Diesel<\/div><div class="fuelprice">([0-9.]+)/, singleCityBlock),
    reportedAt: firstText(/<span class="datetime">\((?:Reported at|Reported):\s*([^)]+)\)<\/span>/, html),
  };
}

function parseHighestPrice(html: string) {
  const match = html.match(/highest Canadian gas price[^0-9]+([0-9.]+)\s+in\s+([^.<]+)/i);

  if (!match) {
    return null;
  }

  return {
    price: Number(match[1]),
    city: match[2].replace(/\s+/g, " ").trim(),
  };
}

async function fetchGasWizardCity(city: { city: string; slug: string }) {
  const url = `${GASWIZARD_BASE_URL}/gas-prices/${city.slug}/`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "CanadaPulse/0.1 (+https://localhost; source attribution dashboard)",
      accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 60 * 60, tags: ["canada-pulse-gaswizard"] },
  });

  if (!response.ok) {
    throw new Error(`GasWizard fetch failed for ${city.slug}: ${response.status}`);
  }

  return parseCityPage(city.city, city.slug, await response.text());
}

export async function getGasWizardPulse(): Promise<GasWizardPulse> {
  const settledCities = await Promise.allSettled(trackedGasWizardCities.map(fetchGasWizardCity));
  const cities = settledCities
    .filter((result): result is PromiseFulfilledResult<GasWizardCityPrice> => result.status === "fulfilled")
    .map((result) => result.value);

  const highestFromCities = cities
    .filter((city) => typeof city.regular === "number")
    .sort((a, b) => (b.regular ?? 0) - (a.regular ?? 0))[0];
  const lowest = cities
    .filter((city) => typeof city.currentAverage === "number")
    .sort((a, b) => (a.currentAverage ?? Number.POSITIVE_INFINITY) - (b.currentAverage ?? Number.POSITIVE_INFINITY))[0] ?? null;

  let highest = highestFromCities?.regular
    ? { city: highestFromCities.city, price: highestFromCities.regular }
    : null;

  try {
    const historyResponse = await fetch(`${GASWIZARD_BASE_URL}/price-history/`, {
      headers: {
        "user-agent": "CanadaPulse/0.1 (+https://localhost; source attribution dashboard)",
        accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 60 * 60, tags: ["canada-pulse-gaswizard"] },
    });

    if (historyResponse.ok) {
      highest = parseHighestPrice(await historyResponse.text()) ?? highest;
    }
  } catch {
    // City pages are enough for the homepage card; the highest widget is a bonus.
  }

  return {
    source: "GasWizard.ca",
    sourceUrl: `${GASWIZARD_BASE_URL}/price-history/`,
    fetchedAt: new Date().toISOString(),
    highest,
    lowest,
    cities,
  };
}

export const gasWizardFallbackPulse: GasWizardPulse = {
  source: "GasWizard.ca",
  sourceUrl: `${GASWIZARD_BASE_URL}/price-history/`,
  fetchedAt: new Date().toISOString(),
  highest: { city: "Vancouver", price: 215.9 },
  lowest: null,
  cities: [],
};
