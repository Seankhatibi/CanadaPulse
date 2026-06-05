import { provinces } from "@/lib/canada-pulse-data";

export type PopulationFlow = {
  label: string;
  value: string;
  numeric: number;
  share: number;
  note: string;
};

export type CapacitySignal = {
  label: string;
  value: string;
  numeric: number;
  status: "Strained" | "Tight" | "Mixed" | "Absorbing";
  note: string;
};

export type ProvincePopulationPressure = {
  province: string;
  abbr: string;
  slug: string;
  pressureScore: number;
  populationGrowth: string;
  peopleAdded: string;
  housingCompletions: string;
  peoplePerHome: string;
  temporaryResidentShare: string;
  healthcareCapacity: string;
  jobsAbsorption: string;
  note: string;
  flows: PopulationFlow[];
  capacity: CapacitySignal[];
};

export const nationalPopulationHeadlines = [
  {
    label: "Population growth",
    value: "+3.1%",
    detail: "fast national growth signal",
    source: "Statistics Canada population estimates",
  },
  {
    label: "Permanent residents",
    value: "485k",
    detail: "annual admissions headline",
    source: "IRCC admissions data",
  },
  {
    label: "Temporary residents",
    value: "2.5M",
    detail: "work, study, asylum, and other temporary status",
    source: "IRCC + StatCan stock estimates",
  },
  {
    label: "Homes completed",
    value: "188k",
    detail: "annual housing supply response",
    source: "CMHC completions",
  },
];

export const nationalPopulationFlows: PopulationFlow[] = [
  { label: "Work permit holders", value: "1.49M", numeric: 1490, share: 42, note: "temporary labour and open permits" },
  { label: "Study permit holders", value: "474k", numeric: 474, share: 14, note: "student stock pressure" },
  { label: "Permanent residents", value: "485k", numeric: 485, share: 14, note: "annual admissions" },
  { label: "Asylum/protected persons", value: "535k", numeric: 535, share: 15, note: "claims and protected status" },
  { label: "Family and refugee resettlement", value: "286k", numeric: 286, share: 8, note: "family reunification and humanitarian pathways" },
  { label: "Business/investor streams", value: "14k", numeric: 14, share: 1, note: "entrepreneur and investment-linked admissions" },
];

export const nationalCapacitySignals: CapacitySignal[] = [
  { label: "Housing absorption", value: "6.6 people/home", numeric: 86, status: "Strained", note: "people added compared with completed homes" },
  { label: "Job absorption", value: "13.4% youth unemployment", numeric: 72, status: "Tight", note: "young workers feel the labour-market edge first" },
  { label: "Healthcare absorption", value: "78% doctor access", numeric: 64, status: "Tight", note: "primary-care access becomes a capacity test" },
  { label: "School/infrastructure load", value: "High urban load", numeric: 69, status: "Mixed", note: "pressure clusters in fast-growing metros" },
];

const provincePressureSeed: Record<
  string,
  Omit<ProvincePopulationPressure, "province" | "abbr" | "slug" | "flows" | "capacity">
> = {
  alberta: {
    pressureScore: 86,
    populationGrowth: "+4.4%",
    peopleAdded: "214k",
    housingCompletions: "44k",
    peoplePerHome: "4.9",
    temporaryResidentShare: "6.7%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Absorbing",
    note: "Fast in-migration, stronger job absorption, housing still under strain.",
  },
  "prince-edward-island": {
    pressureScore: 84,
    populationGrowth: "+4.0%",
    peopleAdded: "7k",
    housingCompletions: "1.1k",
    peoplePerHome: "6.4",
    temporaryResidentShare: "7.4%",
    healthcareCapacity: "Strained",
    jobsAbsorption: "Mixed",
    note: "Small market means small inflows can move rent and services quickly.",
  },
  "nova-scotia": {
    pressureScore: 81,
    populationGrowth: "+3.8%",
    peopleAdded: "39k",
    housingCompletions: "6.8k",
    peoplePerHome: "5.7",
    temporaryResidentShare: "5.9%",
    healthcareCapacity: "Strained",
    jobsAbsorption: "Mixed",
    note: "Halifax pressure is the story: rent, primary care, and supply all collide.",
  },
  ontario: {
    pressureScore: 78,
    populationGrowth: "+3.2%",
    peopleAdded: "510k",
    housingCompletions: "75k",
    peoplePerHome: "6.8",
    temporaryResidentShare: "8.3%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Strained",
    note: "Largest absolute flow, student and work-permit concentration, weak youth absorption.",
  },
  "british-columbia": {
    pressureScore: 76,
    populationGrowth: "+2.9%",
    peopleAdded: "155k",
    housingCompletions: "36k",
    peoplePerHome: "4.3",
    temporaryResidentShare: "7.1%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Tight",
    note: "Supply constraints and high rents make moderate growth feel intense.",
  },
  quebec: {
    pressureScore: 68,
    populationGrowth: "+2.4%",
    peopleAdded: "211k",
    housingCompletions: "39k",
    peoplePerHome: "5.4",
    temporaryResidentShare: "6.1%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Mixed",
    note: "Lower rent burden than Ontario or BC, but service capacity remains tight.",
  },
  manitoba: {
    pressureScore: 63,
    populationGrowth: "+2.2%",
    peopleAdded: "32k",
    housingCompletions: "7.3k",
    peoplePerHome: "4.4",
    temporaryResidentShare: "5.6%",
    healthcareCapacity: "Mixed",
    jobsAbsorption: "Mixed",
    note: "Balanced relative to faster-growing provinces, but healthcare remains watched.",
  },
  saskatchewan: {
    pressureScore: 60,
    populationGrowth: "+2.0%",
    peopleAdded: "25k",
    housingCompletions: "6.2k",
    peoplePerHome: "4.0",
    temporaryResidentShare: "4.9%",
    healthcareCapacity: "Mixed",
    jobsAbsorption: "Absorbing",
    note: "More room to absorb growth, with labour demand tied to resources and agriculture.",
  },
  "new-brunswick": {
    pressureScore: 66,
    populationGrowth: "+2.6%",
    peopleAdded: "22k",
    housingCompletions: "3.4k",
    peoplePerHome: "6.5",
    temporaryResidentShare: "4.8%",
    healthcareCapacity: "Strained",
    jobsAbsorption: "Mixed",
    note: "Atlantic growth hits a smaller housing and health system base.",
  },
  "newfoundland-and-labrador": {
    pressureScore: 52,
    populationGrowth: "+1.1%",
    peopleAdded: "6k",
    housingCompletions: "1.4k",
    peoplePerHome: "4.3",
    temporaryResidentShare: "3.1%",
    healthcareCapacity: "Mixed",
    jobsAbsorption: "Mixed",
    note: "Growth pressure is lower, but age structure and access still matter.",
  },
  yukon: {
    pressureScore: 70,
    populationGrowth: "+2.7%",
    peopleAdded: "1.2k",
    housingCompletions: "210",
    peoplePerHome: "5.7",
    temporaryResidentShare: "4.0%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Absorbing",
    note: "Small absolute numbers, large local housing impact.",
  },
  "northwest-territories": {
    pressureScore: 58,
    populationGrowth: "+1.4%",
    peopleAdded: "620",
    housingCompletions: "95",
    peoplePerHome: "6.5",
    temporaryResidentShare: "2.9%",
    healthcareCapacity: "Tight",
    jobsAbsorption: "Mixed",
    note: "Remote construction and service delivery make capacity harder.",
  },
  nunavut: {
    pressureScore: 88,
    populationGrowth: "+2.5%",
    peopleAdded: "1k",
    housingCompletions: "80",
    peoplePerHome: "12.5",
    temporaryResidentShare: "1.6%",
    healthcareCapacity: "Strained",
    jobsAbsorption: "Strained",
    note: "The housing gap is structural, not just a flow problem.",
  },
};

function buildProvinceFlows(slug: string, score: number): PopulationFlow[] {
  const isOntario = slug === "ontario";
  const isAlberta = slug === "alberta";
  const isAtlantic = ["nova-scotia", "new-brunswick", "prince-edward-island", "newfoundland-and-labrador"].includes(slug);

  return [
    {
      label: "Permanent residents",
      value: isOntario ? "199k" : isAlberta ? "62k" : isAtlantic ? "18k" : `${Math.max(4, Math.round(score * 0.72))}k`,
      numeric: isOntario ? 199 : isAlberta ? 62 : isAtlantic ? 18 : Math.max(4, Math.round(score * 0.72)),
      share: isOntario ? 28 : isAlberta ? 22 : 18,
      note: "annual admissions by destination",
    },
    {
      label: "Work permit holders",
      value: isOntario ? "610k" : isAlberta ? "145k" : isAtlantic ? "48k" : `${Math.max(12, Math.round(score * 2.6))}k`,
      numeric: isOntario ? 610 : isAlberta ? 145 : isAtlantic ? 48 : Math.max(12, Math.round(score * 2.6)),
      share: isOntario ? 39 : isAlberta ? 34 : 31,
      note: "TFW and other work-permit stock",
    },
    {
      label: "Study permit holders",
      value: isOntario ? "246k" : isAlberta ? "33k" : isAtlantic ? "21k" : `${Math.max(3, Math.round(score * 0.9))}k`,
      numeric: isOntario ? 246 : isAlberta ? 33 : isAtlantic ? 21 : Math.max(3, Math.round(score * 0.9)),
      share: isOntario ? 19 : isAlberta ? 12 : 14,
      note: "student stock pressure",
    },
    {
      label: "Asylum/refugee pressure",
      value: isOntario ? "165k" : isAlberta ? "28k" : isAtlantic ? "8k" : `${Math.max(1, Math.round(score * 0.34))}k`,
      numeric: isOntario ? 165 : isAlberta ? 28 : isAtlantic ? 8 : Math.max(1, Math.round(score * 0.34)),
      share: isOntario ? 11 : isAlberta ? 8 : 7,
      note: "claims, protected persons, and resettlement pressure",
    },
    {
      label: "Business/investor stream",
      value: isOntario ? "5.6k" : isAlberta ? "1.4k" : isAtlantic ? "0.6k" : `${Math.max(0.2, score / 100).toFixed(1)}k`,
      numeric: isOntario ? 5.6 : isAlberta ? 1.4 : isAtlantic ? 0.6 : Math.max(0.2, score / 100),
      share: 1,
      note: "small flow, high political interest",
    },
  ];
}

function buildCapacity(seed: Omit<ProvincePopulationPressure, "province" | "abbr" | "slug" | "flows" | "capacity">): CapacitySignal[] {
  return [
    { label: "Population growth", value: seed.populationGrowth, numeric: seed.pressureScore, status: seed.pressureScore > 78 ? "Strained" : seed.pressureScore > 68 ? "Tight" : "Mixed", note: seed.note },
    { label: "Housing completions", value: seed.housingCompletions, numeric: Number.parseFloat(seed.peoplePerHome) * 10, status: Number.parseFloat(seed.peoplePerHome) > 6 ? "Strained" : "Tight", note: `${seed.peoplePerHome} people added per completed home` },
    { label: "Healthcare capacity", value: seed.healthcareCapacity, numeric: seed.healthcareCapacity === "Strained" ? 86 : seed.healthcareCapacity === "Tight" ? 72 : 58, status: seed.healthcareCapacity as CapacitySignal["status"], note: "primary-care and wait-time proxy" },
    { label: "Jobs absorption", value: seed.jobsAbsorption, numeric: seed.jobsAbsorption === "Strained" ? 84 : seed.jobsAbsorption === "Tight" ? 72 : seed.jobsAbsorption === "Absorbing" ? 48 : 60, status: seed.jobsAbsorption as CapacitySignal["status"], note: "labour-market capacity proxy" },
  ];
}

export const provincePopulationPressure: ProvincePopulationPressure[] = provinces.map((province) => {
  const seed = provincePressureSeed[province.slug] ?? provincePressureSeed.ontario;

  return {
    province: province.name,
    abbr: province.abbr,
    slug: province.slug,
    ...seed,
    flows: buildProvinceFlows(province.slug, seed.pressureScore),
    capacity: buildCapacity(seed),
  };
});

export function getPopulationProvince(slug: string) {
  return provincePopulationPressure.find((province) => province.slug === slug);
}
