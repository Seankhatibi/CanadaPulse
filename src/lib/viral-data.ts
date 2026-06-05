import { issues } from "@/lib/issue-data";
import { healthSnapshot } from "@/lib/health-data";
import { tradeEnergySnapshot } from "@/lib/trade-energy-data";
import { qualitySnapshot, youthSnapshot } from "@/lib/youth-quality-data";

export type ShareCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  body: string;
  href: string;
  tone: string;
  tags: string[];
};

export type MythReality = {
  slug: string;
  myth: string;
  reality: string;
  signal: string;
  source: string;
  href: string;
};

export type TimelinePoint = {
  year: string;
  housing: number;
  wages: number;
  population: number;
  debt: number;
  health: number;
  note: string;
};

export const shareCards: ShareCard[] = [
  {
    id: "tax-spread-ontario-alberta",
    title: "Same salary, different province",
    value: "$5,437",
    subtitle: "modeled Ontario vs Alberta tax spread on $92k",
    body: "A province move can change the tax receipt before rent, food, gas, or childcare even enter the picture.",
    href: "/compare?left=ontario&right=alberta&income=92000",
    tone: "from-red-700 to-sky-700",
    tags: ["tax", "province battle", "affordability"],
  },
  {
    id: "canada-health-score",
    title: "Canada Pulse Score",
    value: "61/100",
    subtitle: "declining national stress signal",
    body: "Affordability, healthcare, youth outlook, debt, wages, and housing are dragging the national score.",
    href: "/",
    tone: "from-red-700 to-stone-700",
    tags: ["national score", "stress index"],
  },
  {
    id: "preventable-disease-burden",
    title: "Preventable disease burden",
    value: healthSnapshot.preventableBurden,
    subtitle: "modeled annual health-system burden",
    body: "Diabetes, cardiovascular disease, obesity-linked illness, respiratory disease, mental health, and vision loss belong in the same health-system conversation.",
    href: "/health/preventable-disease",
    tone: "from-rose-700 to-red-600",
    tags: ["health", "prevention", "CIHI-ready"],
  },
  {
    id: "youth-future-index",
    title: "Youth Future Index",
    value: youthSnapshot.downPaymentYears,
    subtitle: "modeled years to down payment",
    body: "Youth unemployment, rent burden, childcare, and ownership access are the pressure points young Canadians actually feel.",
    href: "/youth",
    tone: "from-fuchsia-700 to-sky-600",
    tags: ["Gen Z", "housing", "future"],
  },
  {
    id: "energy-export-engine",
    title: "Canada's energy export engine",
    value: tradeEnergySnapshot.energyExports,
    subtitle: "source-ready demo energy exports",
    body: "Alberta drives oil and gas output, Quebec and BC anchor hydro, and Ontario anchors nuclear power.",
    href: "/energy",
    tone: "from-emerald-700 to-amber-500",
    tags: ["energy", "exports", "resources"],
  },
  {
    id: "quality-of-life-check",
    title: "Quality of Life check",
    value: qualitySnapshot.lifeSatisfaction,
    subtitle: "national wellbeing proxy",
    body: "GDP misses the daily-life layer: safety, commute, healthcare access, childcare, climate risk, and social wellbeing.",
    href: "/quality-of-life",
    tone: "from-teal-700 to-sky-600",
    tags: ["life", "safety", "wellbeing"],
  },
];

export const weeklyPulseItems = [
  {
    label: "GDP",
    value: "Flat",
    read: "Q1 real GDP was unchanged while March industry GDP slipped. Momentum is soft, not broken.",
    href: "/",
  },
  {
    label: "Food inflation",
    value: issues.find((issue) => issue.slug === "food-inflation")?.nationalValue ?? "5.4%",
    read: "Grocery pressure remains a front-page affordability signal.",
    href: "/issue/food-inflation",
  },
  {
    label: "Tax spread",
    value: "$5.4k",
    read: "Ontario vs Alberta remains the cleanest province-battle hook for the tax receipt model.",
    href: "/compare?left=ontario&right=alberta&income=92000",
  },
  {
    label: "Health",
    value: healthSnapshot.preventableBurden,
    read: "Preventable disease burden is now modeled as a core system-pressure signal.",
    href: "/health/preventable-disease",
  },
  {
    label: "Youth",
    value: youthSnapshot.youthUnemployment,
    read: "Young Canadians are still facing the hardest combination: jobs, rent, and ownership access.",
    href: "/youth",
  },
];

export const mythRealityItems: MythReality[] = [
  {
    slug: "immigration-housing",
    myth: "Immigration alone explains the housing crisis.",
    reality: "Population growth can increase housing demand, but the real question is whether homes, jobs, healthcare, and infrastructure are expanding fast enough at the same time.",
    signal: "Population growth only becomes a crisis when capacity does not keep up.",
    source: "StatCan population + CMHC completions",
    href: "/population",
  },
  {
    slug: "province-tax-same",
    myth: "A salary is the same everywhere in Canada.",
    reality: "The same income can leave you with a different after-tax life depending on the province, even before rent, groceries, gas, or childcare are counted.",
    signal: "$5,437 modeled Ontario-Alberta tax spread on $92k.",
    source: "CRA + budgets/public accounts",
    href: "/tax-dollar",
  },
  {
    slug: "health-spending",
    myth: "Healthcare pressure is only about total spending.",
    reality: "Canada can spend more and still feel worse if wait times, chronic disease, aging, staffing, and access problems grow faster than capacity.",
    signal: `${healthSnapshot.preventableBurden} modeled preventable burden.`,
    source: "CIHI + PHAC-ready model",
    href: "/health",
  },
  {
    slug: "which-province-carries-canada",
    myth: "One province carries everything.",
    reality: "Canada is not powered by one province. Alberta leads in energy, Ontario in autos/services/nuclear, Quebec in hydro/aerospace, Saskatchewan in food/fertilizer/uranium, and BC in ports/hydro.",
    signal: "The answer changes by metric.",
    source: "StatCan trade + CER-ready model",
    href: "/trade",
  },
  {
    slug: "young-canadians",
    myth: "Young people are just bad with money.",
    reality: "Young Canadians are facing a math problem: rent burden, wage growth, student debt, childcare, and down-payment years have changed the starting line.",
    signal: `${youthSnapshot.downPaymentYears} modeled years to down payment.`,
    source: "LFS + income + CMHC-ready model",
    href: "/youth",
  },
];

export const timelineReplay: TimelinePoint[] = [
  { year: "1990", housing: 18, wages: 42, population: 25, debt: 35, health: 28, note: "Ownership still felt closer to wages." },
  { year: "2000", housing: 26, wages: 49, population: 31, debt: 41, health: 36, note: "Debt and urban housing pressure started rising." },
  { year: "2010", housing: 44, wages: 55, population: 43, debt: 54, health: 48, note: "Metro affordability began separating from national averages." },
  { year: "2020", housing: 72, wages: 61, population: 58, debt: 71, health: 66, note: "Pandemic-era shocks pushed debt, health, and housing stress higher." },
  { year: "2026", housing: 86, wages: 64, population: 78, debt: 82, health: 76, note: "The core story is capacity: homes, services, jobs, and public money." },
];
