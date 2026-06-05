export const indicatorCategories = [
  {
    slug: "economy",
    name: "Economy",
    description: "GDP, income, productivity, jobs, investment, debt, and trade balance.",
    sortOrder: 1,
  },
  {
    slug: "housing",
    name: "Housing",
    description: "Prices, rents, starts, completions, vacancy, permits, and affordability.",
    sortOrder: 2,
  },
  {
    slug: "immigration",
    name: "Immigration",
    description: "Permanent residents, temporary residents, students, TFWs, refugees, and asylum claims.",
    sortOrder: 3,
  },
  {
    slug: "health",
    name: "Health",
    description: "Health spending, access, waits, capacity, chronic disease, and preventable burden.",
    sortOrder: 4,
  },
  {
    slug: "government",
    name: "Government",
    description: "Revenue, spending, transfers, deficit, debt, and debt service.",
    sortOrder: 5,
  },
  {
    slug: "trade",
    name: "Trade",
    description: "Exports, imports, interprovincial trade, sectors, and partners.",
    sortOrder: 6,
  },
  {
    slug: "energy",
    name: "Energy",
    description: "Oil, gas, hydro, nuclear, renewables, electricity prices, emissions, and resources.",
    sortOrder: 7,
  },
  {
    slug: "youth",
    name: "Youth Future",
    description: "Youth wages, rent burden, student debt, unemployment, childcare, ownership, and opportunity.",
    sortOrder: 8,
  },
  {
    slug: "quality-of-life",
    name: "Quality of Life",
    description: "Crime, commute, life satisfaction, air quality, climate risk, safety, and family life.",
    sortOrder: 9,
  },
] as const;

export type IndicatorCategorySlug = (typeof indicatorCategories)[number]["slug"];
