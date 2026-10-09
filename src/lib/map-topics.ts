import type { MapTheme, ProvinceExplorerCategory } from "@/lib/province-explorer-data";

export const mapThemes: { id: MapTheme; label: string; description: string }[] = [
  { id: "economy", label: "Economy", description: "Growth, prices, pay and starting a career" },
  { id: "housing", label: "Housing", description: "Rent, rental choice and the home-building pipeline" },
  { id: "society", label: "Society", description: "Health, belonging, poverty and quality of life" },
  { id: "immigration", label: "Immigration", description: "New arrivals, population and the immigration system" },
  { id: "government", label: "Government", description: "Bills, public money and the stage decisions have reached" },
  { id: "trade", label: "Trade", description: "Exports, industries and connections beyond Canada" },
  { id: "energy", label: "Energy & future", description: "Energy, environment and tomorrow’s opportunities" },
];

export function mapTheme(category: ProvinceExplorerCategory): MapTheme {
  if (category.theme) return category.theme;
  if (["rent", "vacancy", "homes"].includes(category.id)) return "housing";
  if (category.id === "newcomers") return "immigration";
  if (["primary-care", "mental-health", "community-belonging", "food-insecurity", "poverty", "life-satisfaction"].includes(category.id)) return "society";
  return "economy";
}

export function everydayReading(category: ProvinceExplorerCategory, value: number, display: string): string {
  const readings: Partial<Record<ProvinceExplorerCategory["id"], string>> = {
    "youth-jobs": `About ${Math.round(value)} in 100 young people in the labour force are unemployed and looking for work. This is not the share of all young Canadians.`,
    "youth-wages": `${display} is the midpoint hourly wage for employees aged 15–24: half earn less and half earn more. It is before tax.`,
    "primary-care": `About ${Math.round(value)} in 100 adults aged 18–34 report having a regular healthcare provider. It does not measure how quickly they get an appointment.`,
    "mental-health": `About ${Math.round(value)} in 100 adults aged 18–34 rate their mental health as very good or excellent. This is a self-reported survey response.`,
    "community-belonging": `About ${Math.round(value)} in 100 adults aged 18–34 report a somewhat or very strong connection to their local community.`,
    "food-insecurity": `About ${Math.round(value)} in 100 people live in households experiencing food insecurity. This concerns access to food, not just food prices.`,
    poverty: `About ${Math.round(value)} in 100 people are below the Market Basket Measure’s essential-cost threshold. This layer uses the 2023 base.`,
    "life-satisfaction": `People rate their lives at ${display} on average. This is a survey measure, not an overall score for a province.`,
    tuition: `${display} is average undergraduate tuition for Canadian students. Rent, books, transport and financial aid are outside this figure.`,
    rent: `${display} a month is average two-bedroom purpose-built rent. Listings for someone signing a new lease can cost more.`,
    vacancy: `About ${value.toFixed(1)} in 100 purpose-built rental units are vacant. A smaller share generally means fewer choices for renters.`,
    prices: `Prices in the representative basket are ${display} higher than a year earlier. Slower inflation does not necessarily mean prices are falling.`,
    newcomers: `${display} permanent-resident admissions were recorded during this period. This does not count every type of arrival or the total newcomer population.`,
    homes: `${display} homes were started during the period. They are not completed homes ready to move into; raw counts also reflect province size.`,
  };
  return readings[category.measureId ?? category.id] ?? category.whyItMatters ?? category.context;
}
