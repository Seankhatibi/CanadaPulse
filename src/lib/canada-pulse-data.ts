import {
  Activity,
  Banknote,
  Beef,
  Factory,
  Fuel,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  LineChart,
  MapPinned,
  Scale,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  getCategoryScore,
  getProvinceProfiles,
} from "@/lib/data/mock-queries";

export const provinces = getProvinceProfiles().map((province) => ({
  name: province.name,
  slug: province.slug,
  abbr: province.code,
  score: province.score,
  status: province.status,
  pressure: province.pressure,
}));

export const provinceSymbols: Record<
  string,
  {
    symbol: string;
    motto: string;
    accent: string;
    land: string;
  }
> = {
  alberta: {
    symbol: "Wild rose",
    motto: "Fortis et liber",
    accent: "from-rose-600 to-sky-700",
    land: "Prairie energy",
  },
  "british-columbia": {
    symbol: "Pacific dogwood",
    motto: "Splendor sine occasu",
    accent: "from-sky-700 to-amber-500",
    land: "Pacific gateway",
  },
  manitoba: {
    symbol: "Prairie crocus",
    motto: "Gloriosus et liber",
    accent: "from-violet-600 to-emerald-700",
    land: "Prairie hub",
  },
  "new-brunswick": {
    symbol: "Purple violet",
    motto: "Spem reduxit",
    accent: "from-amber-600 to-red-700",
    land: "Atlantic trade",
  },
  "newfoundland-and-labrador": {
    symbol: "Pitcher plant",
    motto: "Quaerite prime regnum dei",
    accent: "from-emerald-700 to-red-700",
    land: "North Atlantic resources",
  },
  "nova-scotia": {
    symbol: "Mayflower",
    motto: "Munit haec et altera vincit",
    accent: "from-blue-700 to-rose-600",
    land: "Atlantic growth",
  },
  ontario: {
    symbol: "White trillium",
    motto: "Ut incepit fidelis sic permanet",
    accent: "from-red-700 to-emerald-700",
    land: "Industrial core",
  },
  "prince-edward-island": {
    symbol: "Lady's slipper",
    motto: "Parva sub ingenti",
    accent: "from-rose-600 to-emerald-700",
    land: "Island supply",
  },
  quebec: {
    symbol: "Blue flag iris",
    motto: "Je me souviens",
    accent: "from-blue-800 to-sky-500",
    land: "Hydro advantage",
  },
  saskatchewan: {
    symbol: "Western red lily",
    motto: "Multis e gentibus vires",
    accent: "from-emerald-700 to-amber-500",
    land: "Food and fuel",
  },
  "northwest-territories": {
    symbol: "Mountain avens",
    motto: "Northern resilience",
    accent: "from-slate-700 to-yellow-500",
    land: "Northern corridor",
  },
  nunavut: {
    symbol: "Purple saxifrage",
    motto: "Nunavut sannginivut",
    accent: "from-sky-700 to-yellow-500",
    land: "Arctic housing gap",
  },
  yukon: {
    symbol: "Fireweed",
    motto: "Northern opportunity",
    accent: "from-fuchsia-700 to-emerald-600",
    land: "Northern gateway",
  },
};

export const pulseCategories = [
  {
    title: "Economy",
    categorySlug: "economy",
    grade: getCategoryScore("canada", "economy")?.grade ?? "B-",
    metric: "GDP per capita",
    value: "$61.8k",
    change: "-0.7%",
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: LineChart,
  },
  {
    title: "Housing",
    categorySlug: "housing",
    grade: getCategoryScore("canada", "housing")?.grade ?? "D",
    metric: "Affordability strain",
    value: "High",
    change: "+12 pts",
    tone: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
    icon: Home,
  },
  {
    title: "Immigration",
    categorySlug: "immigration",
    grade: getCategoryScore("canada", "immigration")?.grade ?? "C+",
    metric: "Population pressure",
    value: "Fast",
    change: "+3.1%",
    tone: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: Users,
  },
  {
    title: "Health",
    categorySlug: "health",
    grade: getCategoryScore("canada", "health")?.grade ?? "C-",
    metric: "System load",
    value: "Rising",
    change: "+5.4%",
    tone: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: HeartPulse,
  },
  {
    title: "Government",
    categorySlug: "government",
    grade: getCategoryScore("canada", "government")?.grade ?? "C",
    metric: "Debt service",
    value: "Elevated",
    change: "+8.2%",
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: Landmark,
  },
  {
    title: "Trade",
    categorySlug: "trade",
    grade: getCategoryScore("canada", "trade")?.grade ?? "B",
    metric: "Export engine",
    value: "Strong",
    change: "+2.6%",
    tone: "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    icon: Factory,
  },
  {
    title: "Energy",
    categorySlug: "energy",
    grade: getCategoryScore("canada", "energy")?.grade ?? "A-",
    metric: "Resource base",
    value: "Deep",
    change: "+4.1%",
    tone: "border-lime-500/40 bg-lime-500/10 text-lime-700 dark:text-lime-300",
    icon: Zap,
  },
  {
    title: "Youth",
    categorySlug: "youth",
    grade: getCategoryScore("canada", "youth")?.grade ?? "D-",
    metric: "Future access",
    value: "Tight",
    change: "-9 pts",
    tone: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
    icon: Activity,
  },
  {
    title: "Quality of Life",
    categorySlug: "quality-of-life",
    grade: getCategoryScore("canada", "quality-of-life")?.grade ?? "C+",
    metric: "Livability",
    value: "Mixed",
    change: "-2 pts",
    tone: "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    icon: Leaf,
  },
];

export const featureTiles = [
  {
    title: "Can I Survive Here?",
    eyebrow: "Affordability engine",
    body: "Salary, rent, taxes, groceries, childcare, transport, and years to a down payment.",
    icon: Banknote,
    href: "/housing#survive",
  },
  {
    title: "Population vs Supply",
    eyebrow: "Pressure meter",
    body: "Compare population growth, housing completions, jobs, healthcare capacity, and schools.",
    icon: MapPinned,
    href: "/population",
  },
  {
    title: "Where Did My Taxes Go?",
    eyebrow: "Budget tracker",
    body: "Convert an income estimate into a visual breakdown of public spending categories.",
    icon: ShieldCheck,
    href: "/tax-dollar",
  },
];

export const viralMeters = [
  {
    label: "Housing pressure",
    value: "High",
    detail: "Rent, prices, supply, income gap",
    tone: "text-red-300",
  },
  {
    label: "Youth affordability",
    value: "F",
    detail: "Rent burden and ownership gap",
    tone: "text-fuchsia-300",
  },
  {
    label: "GDP per person",
    value: "$61.8k",
    detail: "Prosperity signal",
    tone: "text-emerald-300",
  },
  {
    label: "Productivity",
    value: "-0.7%",
    detail: "Output per hour trend",
    tone: "text-amber-300",
  },
];

export const livePressureTrackers = [
  {
    label: "Food inflation",
    value: "5.4%",
    change: "+0.3 pts",
    question: "Is the grocery bill cooling or getting worse?",
    cadence: "Monthly CPI",
    source: "StatCan",
    href: "/issue/food-inflation",
    tone: "from-red-600 to-amber-500",
    icon: Beef,
  },
  {
    label: "Average rent burden",
    value: "36%",
    change: "+2 pts",
    question: "How much of income disappears into rent?",
    cadence: "Monthly/quarterly housing",
    source: "CMHC + StatCan",
    href: "/issue/rent-burden",
    tone: "from-fuchsia-600 to-red-600",
    icon: Home,
  },
  {
    label: "Population pressure",
    value: "3.1%",
    change: "Fast",
    question: "Are people arriving faster than homes and services?",
    cadence: "Quarterly estimates",
    source: "StatCan + IRCC",
    href: "/population",
    tone: "from-sky-600 to-red-600",
    icon: Users,
  },
  {
    label: "Youth unemployment",
    value: "13.4%",
    change: "+1.1 pts",
    question: "Can young Canadians get a foothold?",
    cadence: "Monthly jobs",
    source: "Labour Force Survey",
    href: "/issue/youth-jobs",
    tone: "from-violet-600 to-sky-600",
    icon: Activity,
  },
  {
    label: "Mortgage stress",
    value: "$4.1k",
    change: "Modeled",
    question: "What does a starter-home payment look like now?",
    cadence: "Rate + price refresh",
    source: "BoC + CMHC",
    href: "/housing#survive",
    tone: "from-red-700 to-stone-500",
    icon: Banknote,
  },
  {
    label: "Tax receipt",
    value: "$26k",
    change: "$92k salary",
    question: "Same income, different province: who pays what?",
    cadence: "Annual tax tables",
    source: "CRA + budgets",
    href: "/tax-dollar",
    tone: "from-red-700 to-blue-700",
    icon: Landmark,
  },
  {
    label: "Equalization / EPP",
    value: "$27.2B",
    change: "2026-27",
    question: "Quebec receives the most: $13.9B, about 51% of the pool.",
    cadence: "Annual federal transfer table",
    source: "Government of Canada transfers",
    href: "/issue/equalization-epp",
    tone: "from-red-700 to-blue-700",
    icon: Scale,
  },
  {
    label: "Gas and energy",
    value: "$1.64/L",
    change: "National pulse",
    question: "Where are driving and power costs biting hardest?",
    cadence: "Weekly/monthly",
    source: "NRCan + CER",
    href: "/canada",
    tone: "from-emerald-600 to-amber-500",
    icon: Fuel,
  },
  {
    label: "Healthcare access",
    value: "78%",
    change: "Doctor access",
    question: "Is the system absorbing population and aging pressure?",
    cadence: "Annual/quarterly",
    source: "CIHI + StatCan",
    href: "/population",
    tone: "from-rose-600 to-red-600",
    icon: HeartPulse,
  },
];

export const populationPressure = [
  { label: "Permanent residents", value: "485k", share: 41, detail: "Annual admissions target" },
  { label: "TFWs", value: "238k", share: 20, detail: "Temporary foreign workers" },
  { label: "International students", value: "682k", share: 58, detail: "Study permit holders" },
  { label: "Refugees and asylum", value: "143k", share: 12, detail: "Protected and claimant streams" },
  { label: "Investor stream", value: "8.4k", share: 3, detail: "Business and investor class" },
];

export const moneyFlowSignals = [
  { label: "Business investment", value: "$415B", change: "-1.8%", sentiment: "Weakening" },
  { label: "Exports", value: "$768B", change: "+2.6%", sentiment: "Holding" },
  { label: "FDI inflow", value: "$69B", change: "+4.4%", sentiment: "Improving" },
  { label: "Debt service", value: "$54B", change: "+8.2%", sentiment: "Rising cost" },
];

export const youthSignals = [
  { label: "Youth unemployment", value: "13.4%", warning: "Jobs pressure" },
  { label: "Average rent", value: "$2,180", warning: "Paycheque squeeze" },
  { label: "Years to down payment", value: "9.6", warning: "Ownership gap" },
  { label: "Childcare cost", value: "$745", warning: "Family formation" },
];

export const roadmap = [
  "Foundation and app shell",
  "Data model and demo data",
  "Canada map and national score",
  "Housing and affordability engine",
  "Immigration and demographics engine",
  "Government spending and tax tracker",
  "Trade, industry and energy",
  "Health and preventable disease dashboard",
  "Youth future and quality of life",
  "Viral layer, AI summaries and launch",
];

export function getProvince(slug: string) {
  return provinces.find((province) => province.slug === slug) ?? provinces[0];
}
