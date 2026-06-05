import { provinces } from "@/lib/canada-pulse-data";

export type HealthMetric = {
  label: string;
  value: string;
  numeric: number;
  note: string;
  direction?: "higher" | "lower";
};

export type DiseaseBurden = {
  label: string;
  prevalence: string;
  numeric: number;
  burden: string;
  preventableShare: number;
  note: string;
};

export type ProvinceHealthProfile = {
  slug: string;
  province: string;
  abbr: string;
  healthScore: number;
  accessStatus: "Strong" | "Mixed" | "Tight" | "Strained";
  spendingPerPerson: number;
  doctorAccess: number;
  waitPressure: number;
  chronicBurden: number;
  preventableBurden: number;
  read: string;
  systemMetrics: HealthMetric[];
  diseases: DiseaseBurden[];
};

export const healthSnapshot = {
  period: "2025-26 source-ready demo",
  totalSpending: "$399B",
  spendingPerPerson: "$9,626",
  doctorAccess: "78%",
  preventableBurden: "$52B",
  read:
    "The health story is not just spending. It is access, aging, chronic disease, preventable illness, and whether population growth is outpacing capacity.",
};

export const nationalSystemMetrics: HealthMetric[] = [
  { label: "Health spending per person", value: "$9,626", numeric: 9626, note: "CIHI national expenditure signal", direction: "lower" },
  { label: "Family doctor access", value: "78%", numeric: 78, note: "primary-care access proxy", direction: "higher" },
  { label: "ER / surgery wait pressure", value: "High", numeric: 76, note: "capacity pressure score", direction: "lower" },
  { label: "Hospital beds pressure", value: "Tight", numeric: 71, note: "acute-care capacity proxy", direction: "lower" },
  { label: "Mental health access", value: "Strained", numeric: 82, note: "youth and working-age pressure", direction: "lower" },
  { label: "Avoidable hospitalizations", value: "Rising", numeric: 68, note: "prevention and primary-care signal", direction: "lower" },
];

export const nationalDiseaseBurden: DiseaseBurden[] = [
  {
    label: "Cardiovascular disease",
    prevalence: "7.1%",
    numeric: 7.1,
    burden: "$15.8B",
    preventableShare: 58,
    note: "heart disease, stroke, hypertension, and related hospital load",
  },
  {
    label: "Diabetes",
    prevalence: "9.4%",
    numeric: 9.4,
    burden: "$9.7B",
    preventableShare: 62,
    note: "direct care, kidney disease, vision loss, amputations, lost productivity",
  },
  {
    label: "Obesity-linked disease",
    prevalence: "29%",
    numeric: 29,
    burden: "$11.4B",
    preventableShare: 64,
    note: "diabetes, cardiovascular, joint, sleep and cancer risk pathways",
  },
  {
    label: "Mental health and substance use",
    prevalence: "21%",
    numeric: 21,
    burden: "$14.1B",
    preventableShare: 38,
    note: "workforce loss, ER pressure, youth access, opioid deaths",
  },
  {
    label: "Respiratory disease",
    prevalence: "10.8%",
    numeric: 10.8,
    burden: "$6.8B",
    preventableShare: 45,
    note: "asthma, COPD, smoking and air-quality exposure",
  },
  {
    label: "Vision loss",
    prevalence: "5.7%",
    numeric: 5.7,
    burden: "$4.3B",
    preventableShare: 52,
    note: "diabetes, aging, screening access, falls and independence",
  },
];

const provinceHealthSeeds: Record<
  string,
  Omit<ProvinceHealthProfile, "slug" | "province" | "abbr" | "systemMetrics" | "diseases">
> = {
  alberta: {
    healthScore: 65,
    accessStatus: "Tight",
    spendingPerPerson: 9630,
    doctorAccess: 76,
    waitPressure: 72,
    chronicBurden: 61,
    preventableBurden: 63,
    read: "Alberta has younger demographics and stronger incomes, but fast population growth is testing primary care and emergency access.",
  },
  "british-columbia": {
    healthScore: 67,
    accessStatus: "Tight",
    spendingPerPerson: 9340,
    doctorAccess: 77,
    waitPressure: 74,
    chronicBurden: 58,
    preventableBurden: 59,
    read: "BC has healthier baseline indicators, but housing stress, opioid deaths, and primary-care access keep pressure elevated.",
  },
  manitoba: {
    healthScore: 56,
    accessStatus: "Strained",
    spendingPerPerson: 10080,
    doctorAccess: 73,
    waitPressure: 82,
    chronicBurden: 72,
    preventableBurden: 75,
    read: "Manitoba's health pressure is driven by chronic disease, access gaps, and avoidable hospitalization signals.",
  },
  "new-brunswick": {
    healthScore: 52,
    accessStatus: "Strained",
    spendingPerPerson: 10190,
    doctorAccess: 70,
    waitPressure: 84,
    chronicBurden: 79,
    preventableBurden: 78,
    read: "New Brunswick combines older demographics, doctor access pressure, and high chronic disease burden.",
  },
  "newfoundland-and-labrador": {
    healthScore: 50,
    accessStatus: "Strained",
    spendingPerPerson: 10940,
    doctorAccess: 72,
    waitPressure: 85,
    chronicBurden: 82,
    preventableBurden: 81,
    read: "Newfoundland and Labrador faces high per-person costs, older demographics, and elevated chronic disease burden.",
  },
  "nova-scotia": {
    healthScore: 53,
    accessStatus: "Strained",
    spendingPerPerson: 10340,
    doctorAccess: 69,
    waitPressure: 86,
    chronicBurden: 78,
    preventableBurden: 77,
    read: "Nova Scotia's pressure is visible in doctor access, aging, chronic disease, and rapid population growth around Halifax.",
  },
  ontario: {
    healthScore: 61,
    accessStatus: "Tight",
    spendingPerPerson: 9070,
    doctorAccess: 78,
    waitPressure: 75,
    chronicBurden: 63,
    preventableBurden: 64,
    read: "Ontario has scale and major hospitals, but population growth, ER load, and primary-care access remain capacity tests.",
  },
  "prince-edward-island": {
    healthScore: 54,
    accessStatus: "Strained",
    spendingPerPerson: 10020,
    doctorAccess: 68,
    waitPressure: 83,
    chronicBurden: 75,
    preventableBurden: 74,
    read: "PEI is small enough that doctor shortages and population growth can move the whole system quickly.",
  },
  quebec: {
    healthScore: 63,
    accessStatus: "Mixed",
    spendingPerPerson: 9480,
    doctorAccess: 79,
    waitPressure: 73,
    chronicBurden: 64,
    preventableBurden: 62,
    read: "Quebec has broad coverage and lower housing pressure than Ontario or BC, but wait times and aging remain major system issues.",
  },
  saskatchewan: {
    healthScore: 58,
    accessStatus: "Tight",
    spendingPerPerson: 10060,
    doctorAccess: 74,
    waitPressure: 78,
    chronicBurden: 70,
    preventableBurden: 72,
    read: "Saskatchewan's burden is tied to chronic disease, rural access, and prevention gaps despite a smaller population base.",
  },
  yukon: {
    healthScore: 59,
    accessStatus: "Mixed",
    spendingPerPerson: 13600,
    doctorAccess: 76,
    waitPressure: 71,
    chronicBurden: 66,
    preventableBurden: 67,
    read: "Yukon has high delivery costs and access challenges, but smaller absolute volumes than provinces.",
  },
  "northwest-territories": {
    healthScore: 51,
    accessStatus: "Strained",
    spendingPerPerson: 17300,
    doctorAccess: 65,
    waitPressure: 79,
    chronicBurden: 76,
    preventableBurden: 80,
    read: "The Northwest Territories health story is remote delivery, high cost per person, and access gaps.",
  },
  nunavut: {
    healthScore: 43,
    accessStatus: "Strained",
    spendingPerPerson: 19600,
    doctorAccess: 58,
    waitPressure: 88,
    chronicBurden: 84,
    preventableBurden: 86,
    read: "Nunavut faces the hardest access math: remote delivery, high costs, housing-driven health burden, and limited local capacity.",
  },
};

function buildSystemMetrics(seed: Omit<ProvinceHealthProfile, "slug" | "province" | "abbr" | "systemMetrics" | "diseases">): HealthMetric[] {
  return [
    { label: "Health spending per person", value: `$${seed.spendingPerPerson.toLocaleString()}`, numeric: seed.spendingPerPerson, note: "per-person health expenditure signal", direction: "lower" },
    { label: "Family doctor access", value: `${seed.doctorAccess}%`, numeric: seed.doctorAccess, note: "primary-care access proxy", direction: "higher" },
    { label: "Wait-time pressure", value: `${seed.waitPressure}/100`, numeric: seed.waitPressure, note: "ER and surgery pressure proxy", direction: "lower" },
    { label: "Chronic burden", value: `${seed.chronicBurden}/100`, numeric: seed.chronicBurden, note: "disease prevalence and hospital load", direction: "lower" },
  ];
}

function buildDiseaseProfile(seed: Omit<ProvinceHealthProfile, "slug" | "province" | "abbr" | "systemMetrics" | "diseases">): DiseaseBurden[] {
  const chronicShift = (seed.chronicBurden - 65) / 100;

  return nationalDiseaseBurden.map((disease) => {
    const numeric = Math.max(1, Number((disease.numeric * (1 + chronicShift)).toFixed(1)));

    return {
      ...disease,
      numeric,
      prevalence: disease.prevalence.includes("%") ? `${numeric}%` : disease.prevalence,
      preventableShare: Math.max(20, Math.min(80, Math.round(disease.preventableShare + (seed.preventableBurden - 65) / 3))),
    };
  });
}

export const provinceHealthProfiles: ProvinceHealthProfile[] = provinces.map((province) => {
  const seed = provinceHealthSeeds[province.slug] ?? provinceHealthSeeds.ontario;

  return {
    ...seed,
    slug: province.slug,
    province: province.name,
    abbr: province.abbr,
    systemMetrics: buildSystemMetrics(seed),
    diseases: buildDiseaseProfile(seed),
  };
});

export function getHealthProfile(slug: string) {
  return provinceHealthProfiles.find((profile) => profile.slug === slug) ?? provinceHealthProfiles[0];
}
