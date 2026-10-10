import type { ProvinceExplorerCategory } from "@/lib/province-explorer-data";

const measures: Record<string, string> = {
  jobs: "People looking for work", "youth-jobs": "Young people looking for work",
  "youth-wages": "What young workers earn", rent: "Monthly rent for a two-bedroom home",
  vacancy: "How many rentals are available", prices: "How fast prices are rising",
  homes: "New homes being started", newcomers: "New permanent residents",
  "primary-care": "Having a regular healthcare provider", "mental-health": "How young adults feel about their mental health",
  "community-belonging": "Feeling connected to your community", tuition: "University tuition costs",
  "food-insecurity": "People struggling to get enough food", poverty: "People living below the poverty line",
  "life-satisfaction": "How people rate their lives",
};

export function mapTitle(category: ProvinceExplorerCategory): string {
  const measure = measures[category.measureId ?? category.id];
  if (measure) return measure;
  const title = category.headline ?? category.label;
  const known: [RegExp, string][] = [
    [/gross domestic product|\bgdp\b/i, "Canada’s economic output (GDP)"],
    [/annual wholesale/i, "What wholesalers sell"],
    [/farm product prices/i, "Prices farmers receive"],
    [/producer price/i, "Prices charged by businesses"],
    [/film.*post-production/i, "Canada’s film and TV editing industry"],
    [/mortgage.*rate watch/i, "Interest rates and mortgage costs"],
    [/merchandise trade/i, "Goods Canada buys and sells abroad"],
    [/job vacancies/i, "Jobs employers are trying to fill"],
    [/fiscal monitor/i, "Federal government income and spending"],
    [/battery storage/i, "How Canada stores electricity in batteries"],
    [/governing council deliberations/i, "Why the Bank of Canada made its rate decision"],
    [/market participants survey/i, "What financial experts expect next"],
    [/monetary policy report/i, "The Bank of Canada’s economic outlook"],
    [/consumer expectations/i, "What Canadians expect for prices and money"],
    [/business outlook survey/i, "How businesses see the economy"],
    [/financial stability report/i, "Risks to Canada’s financial system"],
    [/financial system survey/i, "What financial firms see as risks"],
    [/annual report/i, "The Bank of Canada’s year in review"],
    [/first nations clean water/i, "Clean water for First Nations"],
    [/building canada strong/i, "Building Canada Strong"],
    [/fuel affordability/i, "Fuel affordability"],
    [/indigenous rights statement/i, "Indigenous rights statements"],
    [/tlegohli got/i, "Self-government for the Tlegohli Got’ine"],
    [/magnitsky/i, "Sanctions for serious human rights abuses"],
    [/victim protection|protecting victims/i, "Protection for crime victims"],
    [/cutting red tape/i, "Reducing government paperwork"],
    [/modern treaty implementation/i, "Putting modern treaties into practice"],
    [/defence sector/i, "Supporting Canada’s defence industry"],
    [/energy poverty/i, "Helping households afford energy"],
    [/skilled trades.*labour mobility/i, "Skilled trades and working across provinces"],
    [/jury duty appreciation/i, "Recognizing jury service"],
    [/combatting hate/i, "Hate crime laws"],
    [/military justice/i, "Military justice rules"],
    [/build canada homes/i, "Creating Build Canada Homes"],
  ];
  const simple = known.find(([pattern]) => pattern.test(title))?.[1] ?? title.replace(/^Bank of Canada report:\s*|^Canada Energy Regulator \/ NRCan:\s*Market Snapshot:\s*/i, "");
  return category.national?.kind === "legislation" ? `${category.national.label} · ${simple}` : simple;
}

export function simpleMetricLabel(label: string): string {
  const labels: Record<string, string> = {
    "All industries": "Total economic output", "Goods-producing industries": "Output from businesses making goods",
    "Services-producing industries": "Output from service businesses", "All-items": "Overall price increase",
    "Unemployment rate": "Share looking for work", Employment: "People with jobs", "Participation rate": "People working or looking for work",
    "Permanent residents admitted": "New permanent residents", "Housing starts": "Homes where construction started",
    "Study permit holders with permit(s) becoming effective": "People with new study permits",
    "TFWP work permit holders with permit(s) becoming effective": "People with new temporary foreign worker permits",
    "IMP work permit holders with permit(s) becoming effective": "People with new International Mobility Program work permits",
    "Rental vacancy rate": "Rentals sitting empty", "Fixed-sample rent growth": "Rent increases in the same buildings",
    "Goods-producing sector": "Businesses making goods", "Non-Energy": "Businesses outside energy",
  };
  return labels[label] ?? label;
}

export function rankingReading(category: ProvinceExplorerCategory): string {
  return `#1 means the highest ${category.highMeaning === "pressure" ? "rate or cost—not the best outcome" : "value—not an overall grade"}. Equal values share a rank. Canada is the overall comparison, not a ranked province.`;
}
