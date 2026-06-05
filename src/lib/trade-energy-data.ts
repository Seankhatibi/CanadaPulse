import { provinces } from "@/lib/canada-pulse-data";

export type SectorSlice = {
  label: string;
  value: string;
  amount: number;
  note: string;
};

export type EnergySlice = {
  label: string;
  share: number;
  tone: string;
};

export type TradeEnergyProvinceProfile = {
  slug: string;
  province: string;
  abbr: string;
  exportValue: number;
  exportRank: number;
  exportGrowth: string;
  topExport: string;
  tradeRead: string;
  sectors: SectorSlice[];
  partners: SectorSlice[];
  oilGasIndex: number;
  electricityPrice: number;
  energyStrength: number;
  energyRead: string;
  energyMix: EnergySlice[];
  resourceSignals: SectorSlice[];
};

export const tradeEnergySnapshot = {
  period: "2026 public-data snapshot",
  exports: "$768B",
  imports: "$735B",
  tradeBalance: "+$33B",
  energyExports: "$183B",
  electricityRead: "Hydro dominates the clean-power map, Alberta drives fossil output, and Ontario is the nuclear anchor.",
  tradeRead:
    "Canada's export engine is still highly regional: energy in Alberta and Saskatchewan, autos and services in Ontario, hydro-linked industry in Quebec, and ports/resources in British Columbia.",
};

export const nationalExportSectors: SectorSlice[] = [
  { label: "Energy products", value: "$183B", amount: 183, note: "crude, gas, refined fuels, electricity" },
  { label: "Motor vehicles and parts", value: "$93B", amount: 93, note: "Ontario-heavy US supply chain" },
  { label: "Consumer goods", value: "$84B", amount: 84, note: "pharma, packaged goods, retail supply" },
  { label: "Metal and mineral products", value: "$81B", amount: 81, note: "critical minerals, metals, potash-adjacent flows" },
  { label: "Farm, fishing and food", value: "$76B", amount: 76, note: "prairie and coastal food exports" },
  { label: "Forestry and building products", value: "$48B", amount: 48, note: "lumber, pulp, paper" },
];

export const nationalTradePartners: SectorSlice[] = [
  { label: "United States", value: "74%", amount: 74, note: "dominant export destination" },
  { label: "China", value: "4%", amount: 4, note: "commodities and agriculture exposure" },
  { label: "European Union", value: "5%", amount: 5, note: "services, metals, aerospace, food" },
  { label: "Japan", value: "2%", amount: 2, note: "energy, agriculture, seafood" },
  { label: "Mexico", value: "2%", amount: 2, note: "North American supply chain" },
];

const profileSeeds: Record<string, Omit<TradeEnergyProvinceProfile, "province" | "abbr" | "slug">> = {
  alberta: {
    exportValue: 214,
    exportRank: 1,
    exportGrowth: "+4.8%",
    topExport: "Crude oil and natural gas",
    tradeRead: "Alberta is the country's export engine because energy exports dominate the province's trade base.",
    sectors: [
      { label: "Oil and gas", value: "$166B", amount: 166, note: "primary export engine" },
      { label: "Petrochemicals", value: "$18B", amount: 18, note: "industrial downstream" },
      { label: "Agriculture", value: "$15B", amount: 15, note: "grains, beef, canola" },
      { label: "Machinery/services", value: "$11B", amount: 11, note: "energy supply chain" },
    ],
    partners: [
      { label: "United States", value: "89%", amount: 89, note: "pipeline and refinery demand" },
      { label: "Asia", value: "6%", amount: 6, note: "food and resource buyers" },
      { label: "EU/UK", value: "2%", amount: 2, note: "specialty flows" },
    ],
    oilGasIndex: 100,
    electricityPrice: 18.8,
    energyStrength: 95,
    energyRead: "Canada's oil and gas map starts here, but electricity prices and emissions are the pressure points.",
    energyMix: [
      { label: "Natural gas", share: 61, tone: "bg-amber-400" },
      { label: "Wind/solar", share: 18, tone: "bg-emerald-400" },
      { label: "Coal", share: 8, tone: "bg-stone-400" },
      { label: "Other", share: 13, tone: "bg-sky-400" },
    ],
    resourceSignals: [
      { label: "Oil production", value: "Very high", amount: 100, note: "national leader" },
      { label: "Gas production", value: "Very high", amount: 92, note: "national leader" },
      { label: "Pipeline exposure", value: "High", amount: 88, note: "export capacity matters" },
    ],
  },
  "british-columbia": {
    exportValue: 66,
    exportRank: 4,
    exportGrowth: "+2.2%",
    topExport: "Natural gas, forestry, ports",
    tradeRead: "BC is a Pacific gateway: resources, forestry, LNG exposure, and port-linked trade define the story.",
    sectors: [
      { label: "Energy and gas", value: "$18B", amount: 18, note: "gas and electricity exposure" },
      { label: "Forestry", value: "$15B", amount: 15, note: "lumber and pulp" },
      { label: "Mining/metals", value: "$14B", amount: 14, note: "coal, copper, minerals" },
      { label: "Services/tech", value: "$13B", amount: 13, note: "urban export base" },
    ],
    partners: [
      { label: "United States", value: "53%", amount: 53, note: "largest buyer" },
      { label: "Asia", value: "31%", amount: 31, note: "Pacific trade lane" },
      { label: "EU/UK", value: "7%", amount: 7, note: "diversified demand" },
    ],
    oilGasIndex: 45,
    electricityPrice: 13.5,
    energyStrength: 78,
    energyRead: "BC's strength is hydro power plus west-coast export optionality, with LNG as the big watch item.",
    energyMix: [
      { label: "Hydro", share: 86, tone: "bg-sky-400" },
      { label: "Natural gas", share: 9, tone: "bg-amber-400" },
      { label: "Wind/solar", share: 3, tone: "bg-emerald-400" },
      { label: "Other", share: 2, tone: "bg-stone-400" },
    ],
    resourceSignals: [
      { label: "Hydro base", value: "Very high", amount: 86, note: "clean-power advantage" },
      { label: "LNG exposure", value: "Rising", amount: 65, note: "export optionality" },
      { label: "Forestry pressure", value: "High", amount: 72, note: "cyclical sector" },
    ],
  },
  ontario: {
    exportValue: 203,
    exportRank: 2,
    exportGrowth: "+1.4%",
    topExport: "Autos, manufacturing, services",
    tradeRead: "Ontario's trade engine is the US supply chain: vehicles, parts, machinery, finance, and services.",
    sectors: [
      { label: "Autos and parts", value: "$86B", amount: 86, note: "largest visible engine" },
      { label: "Machinery", value: "$34B", amount: 34, note: "manufacturing supply chain" },
      { label: "Consumer/pharma", value: "$31B", amount: 31, note: "large urban base" },
      { label: "Services/finance", value: "$45B", amount: 45, note: "Toronto export economy" },
    ],
    partners: [
      { label: "United States", value: "82%", amount: 82, note: "auto corridor dependence" },
      { label: "EU/UK", value: "6%", amount: 6, note: "finance and goods" },
      { label: "Asia", value: "5%", amount: 5, note: "mixed industrial flows" },
    ],
    oilGasIndex: 6,
    electricityPrice: 16.1,
    energyStrength: 82,
    energyRead: "Ontario is the nuclear anchor and industrial electricity demand centre, not an oil-and-gas province.",
    energyMix: [
      { label: "Nuclear", share: 52, tone: "bg-violet-400" },
      { label: "Hydro", share: 24, tone: "bg-sky-400" },
      { label: "Natural gas", share: 10, tone: "bg-amber-400" },
      { label: "Wind/solar", share: 14, tone: "bg-emerald-400" },
    ],
    resourceSignals: [
      { label: "Nuclear generation", value: "Very high", amount: 92, note: "national anchor" },
      { label: "Industrial demand", value: "Very high", amount: 86, note: "manufacturing load" },
      { label: "Oil/gas production", value: "Low", amount: 6, note: "consumer, not producer" },
    ],
  },
  quebec: {
    exportValue: 112,
    exportRank: 3,
    exportGrowth: "+2.7%",
    topExport: "Aerospace, aluminum, hydro-linked industry",
    tradeRead: "Quebec combines hydro power with aerospace, aluminum, food, services, and US/EU trade lanes.",
    sectors: [
      { label: "Aerospace", value: "$25B", amount: 25, note: "global cluster" },
      { label: "Aluminum/metals", value: "$21B", amount: 21, note: "hydro-linked industry" },
      { label: "Food/agriculture", value: "$16B", amount: 16, note: "large domestic base" },
      { label: "Services", value: "$31B", amount: 31, note: "Montreal economy" },
    ],
    partners: [
      { label: "United States", value: "71%", amount: 71, note: "main export lane" },
      { label: "EU/UK", value: "11%", amount: 11, note: "aerospace/services" },
      { label: "Asia", value: "6%", amount: 6, note: "industrial buyers" },
    ],
    oilGasIndex: 2,
    electricityPrice: 8.4,
    energyStrength: 88,
    energyRead: "Quebec's energy advantage is low-cost hydro, which supports industry and household affordability.",
    energyMix: [
      { label: "Hydro", share: 94, tone: "bg-sky-400" },
      { label: "Wind/solar", share: 5, tone: "bg-emerald-400" },
      { label: "Other", share: 1, tone: "bg-stone-400" },
    ],
    resourceSignals: [
      { label: "Hydro generation", value: "Very high", amount: 96, note: "national leader" },
      { label: "Electricity price", value: "Low", amount: 84, note: "affordability advantage" },
      { label: "Oil/gas production", value: "Very low", amount: 2, note: "consumer/importer" },
    ],
  },
  saskatchewan: {
    exportValue: 54,
    exportRank: 5,
    exportGrowth: "+3.5%",
    topExport: "Potash, uranium, oil, agriculture",
    tradeRead: "Saskatchewan punches above its population because food, fuel, potash, and uranium matter globally.",
    sectors: [
      { label: "Potash/minerals", value: "$18B", amount: 18, note: "global fertilizer supply" },
      { label: "Oil", value: "$14B", amount: 14, note: "resource exports" },
      { label: "Agriculture", value: "$17B", amount: 17, note: "canola, wheat, pulses" },
      { label: "Uranium", value: "$4B", amount: 4, note: "critical energy mineral" },
    ],
    partners: [
      { label: "United States", value: "58%", amount: 58, note: "largest buyer" },
      { label: "Asia", value: "21%", amount: 21, note: "food and fertilizer" },
      { label: "Latin America", value: "8%", amount: 8, note: "potash demand" },
    ],
    oilGasIndex: 54,
    electricityPrice: 19.2,
    energyStrength: 86,
    energyRead: "Saskatchewan is food, fuel, potash, and uranium: small population, huge resource relevance.",
    energyMix: [
      { label: "Coal/gas", share: 68, tone: "bg-amber-400" },
      { label: "Hydro", share: 16, tone: "bg-sky-400" },
      { label: "Wind/solar", share: 16, tone: "bg-emerald-400" },
    ],
    resourceSignals: [
      { label: "Potash", value: "Very high", amount: 94, note: "global input" },
      { label: "Uranium", value: "Very high", amount: 88, note: "nuclear supply chain" },
      { label: "Oil production", value: "High", amount: 54, note: "resource base" },
    ],
  },
};

const fallbackSeeds: Record<string, Omit<TradeEnergyProvinceProfile, "province" | "abbr" | "slug">> = {
  default: {
    exportValue: 18,
    exportRank: 8,
    exportGrowth: "+1.0%",
    topExport: "Regional goods and services",
    tradeRead: "This province has a smaller export base, but local sectors still matter for jobs and public revenue.",
    sectors: [
      { label: "Services", value: "$6B", amount: 6, note: "local business exports" },
      { label: "Food/resources", value: "$5B", amount: 5, note: "regional strengths" },
      { label: "Manufacturing", value: "$4B", amount: 4, note: "specialized production" },
      { label: "Other goods", value: "$3B", amount: 3, note: "mixed exports" },
    ],
    partners: [
      { label: "United States", value: "64%", amount: 64, note: "main export lane" },
      { label: "EU/UK", value: "8%", amount: 8, note: "secondary market" },
      { label: "Asia", value: "7%", amount: 7, note: "food/resource demand" },
    ],
    oilGasIndex: 10,
    electricityPrice: 17.2,
    energyStrength: 58,
    energyRead: "Energy story is local: electricity cost, grid mix, and import dependence matter more than production.",
    energyMix: [
      { label: "Hydro/renewables", share: 42, tone: "bg-sky-400" },
      { label: "Natural gas", share: 36, tone: "bg-amber-400" },
      { label: "Wind/solar", share: 12, tone: "bg-emerald-400" },
      { label: "Other", share: 10, tone: "bg-stone-400" },
    ],
    resourceSignals: [
      { label: "Electricity affordability", value: "Mixed", amount: 55, note: "watch household bills" },
      { label: "Export diversity", value: "Mixed", amount: 48, note: "smaller base" },
      { label: "Resource exposure", value: "Moderate", amount: 42, note: "sector-specific" },
    ],
  },
};

const exportRankOverrides: Record<string, number> = {
  manitoba: 6,
  "newfoundland-and-labrador": 7,
  "nova-scotia": 8,
  "new-brunswick": 9,
  "prince-edward-island": 10,
  yukon: 11,
  "northwest-territories": 12,
  nunavut: 13,
};

export const provinceTradeEnergyProfiles: TradeEnergyProvinceProfile[] = provinces.map((province) => {
  const seed = profileSeeds[province.slug] ?? fallbackSeeds.default;

  return {
    ...seed,
    exportRank: profileSeeds[province.slug]?.exportRank ?? exportRankOverrides[province.slug] ?? seed.exportRank,
    slug: province.slug,
    province: province.name,
    abbr: province.abbr,
  };
});

export function getTradeEnergyProfile(slug: string) {
  return provinceTradeEnergyProfiles.find((profile) => profile.slug === slug) ?? provinceTradeEnergyProfiles[0];
}
