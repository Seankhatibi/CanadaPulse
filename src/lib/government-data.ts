export const federalFiscalSnapshot = {
  period: "April 2025 to March 2026",
  source: "Federal fiscal snapshot, March 2026",
  sourceUrl: "https://www.canada.ca/en/department-finance/services/publications/fiscal-monitor/2026/03.html",
  deficit: "$55.3B",
  deficitNumeric: 55.3,
  revenues: "$500.0B",
  revenuesNumeric: 500.0,
  programExpenses: "$487.9B",
  programExpensesNumeric: 487.9,
  debtCharges: "$53.7B",
  debtChargesNumeric: 53.7,
  totalExpenses: "$555.3B",
  totalExpensesNumeric: 555.3,
  read:
    "Ottawa collected more revenue, but spending and debt charges still left a large deficit. Debt interest alone is now a front-page affordability issue.",
};

export const federalRevenueBreakdown = [
  { label: "Personal income tax", value: "$226.8B", amount: 226.8, change: "+2.8%", note: "largest federal revenue source" },
  { label: "Corporate income tax", value: "$101.5B", amount: 101.5, change: "+4.5%", note: "boosted by corporate receipts" },
  { label: "GST", value: "$50.8B", amount: 50.8, change: "-5.6%", note: "weaker year-to-date GST revenue" },
  { label: "Non-resident income tax", value: "$14.7B", amount: 14.7, change: "+4.0%", note: "withholding-tax stream" },
  { label: "Other taxes and duties", value: "$73.9B", amount: 73.9, change: "mixed", note: "includes customs and excise flows" },
];

export const federalExpenseBreakdown = [
  { label: "Major transfers to persons", value: "$142.3B", amount: 142.3, change: "+7.4%", tone: "rising", note: "OAS, EI, child benefits, legacy supports" },
  { label: "Transfers to provinces/territories/municipalities", value: "$110.8B", amount: 110.8, change: "+5.5%", tone: "rising", note: "health, social, equalization, childcare, infrastructure funds" },
  { label: "Other transfer payments", value: "$102.9B", amount: 102.9, change: "+0.1%", tone: "flat", note: "housing, dental care, benefits, grants, defence contributions" },
  { label: "Operating expenses", value: "$127.6B", amount: 127.6, change: "+2.6%", tone: "rising", note: "departments, agencies, Crown corporations" },
  { label: "Public debt charges", value: "$53.7B", amount: 53.7, change: "+0.1%", tone: "watch", note: "interest cost on federal debt" },
  { label: "Net actuarial losses", value: "$13.7B", amount: 13.7, change: "+240.7%", tone: "volatile", note: "pension and benefit accounting effects" },
];

export const federalTransferBreakdown = [
  { label: "Canada Health Transfer", value: "$54.7B", amount: 54.7, change: "+5.0%" },
  { label: "Canada Social Transfer", value: "$17.4B", amount: 17.4, change: "+3.0%" },
  { label: "Equalization", value: "$26.2B", amount: 26.2, change: "+3.6%" },
  { label: "Territorial Formula Financing", value: "$5.5B", amount: 5.5, change: "+6.4%" },
  { label: "Early learning and child care", value: "$7.9B", amount: 7.9, change: "+19.0%" },
  { label: "Community-Building Fund", value: "$2.5B", amount: 2.5, change: "+4.2%" },
  { label: "Health agreements", value: "$4.3B", amount: 4.3, change: "0.0%" },
];

export const governmentViralQuestions = [
  {
    question: "Does debt interest cost more than major programs?",
    answer: "$53.7B in public debt charges is close to the Canada Health Transfer at $54.7B.",
    tone: "border-red-300/20 bg-red-500/10 text-red-100",
  },
  {
    question: "Where does federal revenue actually come from?",
    answer: "Personal income tax is the giant: $226.8B, more than corporate tax and GST combined.",
    tone: "border-sky-300/20 bg-sky-500/10 text-sky-100",
  },
  {
    question: "What do provinces receive?",
    answer: "Major transfers to provinces, territories and municipalities reached $110.8B year-to-date.",
    tone: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  },
];

const equalizationPool = 27_160;

export const equalizationGovernmentCards = [
  { province: "Quebec", abbr: "QC", slug: "quebec", amount: 13_907 },
  { province: "Manitoba", abbr: "MB", slug: "manitoba", amount: 5_044 },
  { province: "Nova Scotia", abbr: "NS", slug: "nova-scotia", amount: 3_538 },
  { province: "New Brunswick", abbr: "NB", slug: "new-brunswick", amount: 3_360 },
  { province: "Prince Edward Island", abbr: "PE", slug: "prince-edward-island", amount: 723 },
  { province: "Ontario", abbr: "ON", slug: "ontario", amount: 406 },
  { province: "Newfoundland and Labrador", abbr: "NL", slug: "newfoundland-and-labrador", amount: 182 },
].map((recipient) => ({
  ...recipient,
  value: recipient.amount >= 1_000 ? `$${(recipient.amount / 1_000).toFixed(1)}B` : `$${recipient.amount}M`,
  share: Math.round((recipient.amount / equalizationPool) * 100),
}));

export const governmentRefreshPlan = [
  {
    dataset: "Fiscal Monitor",
    cadence: "monthly",
    source: "Federal fiscal table source pending live importer",
    nextStep: "Parse latest monthly revenue, expense, deficit, and debt-charge tables.",
  },
  {
    dataset: "Federal transfers",
    cadence: "annual plus budget updates",
    source: "Government of Canada transfer tables",
    nextStep: "Refresh CHT, CST, Equalization, Territorial Formula Financing, and childcare transfers.",
  },
  {
    dataset: "Provincial budgets",
    cadence: "annual plus fiscal updates",
    source: "provincial finance ministries",
    nextStep: "Connect province pages to health, education, debt-service, infrastructure, and tax revenue tables.",
  },
];
