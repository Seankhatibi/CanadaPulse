export type TaxProvince = {
  slug: string;
  name: string;
  salesTaxLabel: string;
  salesTaxRate: number;
  incomeTaxIndex: number;
  spending: Array<{ label: string; share: number }>;
};

export const taxProfiles: TaxProvince[] = [
  {
    slug: "canada",
    name: "Canada average",
    salesTaxLabel: "Mixed",
    salesTaxRate: 11,
    incomeTaxIndex: 1,
    spending: [
      { label: "Healthcare", share: 34 },
      { label: "Transfers and seniors", share: 24 },
      { label: "Debt interest", share: 12 },
      { label: "Infrastructure", share: 8 },
      { label: "Defense and safety", share: 8 },
      { label: "Immigration and settlement", share: 4 },
      { label: "Other programs", share: 10 },
    ],
  },
  {
    slug: "ontario",
    name: "Ontario",
    salesTaxLabel: "HST",
    salesTaxRate: 13,
    incomeTaxIndex: 1,
    spending: [
      { label: "Healthcare", share: 36 },
      { label: "Education", share: 18 },
      { label: "Debt interest", share: 10 },
      { label: "Infrastructure", share: 9 },
      { label: "Social services", share: 15 },
      { label: "Federal programs", share: 12 },
    ],
  },
  {
    slug: "manitoba",
    name: "Manitoba",
    salesTaxLabel: "GST + PST",
    salesTaxRate: 12,
    incomeTaxIndex: 1.04,
    spending: [
      { label: "Healthcare", share: 38 },
      { label: "Education", share: 17 },
      { label: "Debt interest", share: 7 },
      { label: "Infrastructure", share: 10 },
      { label: "Social services", share: 17 },
      { label: "Federal programs", share: 11 },
    ],
  },
  {
    slug: "saskatchewan",
    name: "Saskatchewan",
    salesTaxLabel: "GST + PST",
    salesTaxRate: 11,
    incomeTaxIndex: 0.98,
    spending: [
      { label: "Healthcare", share: 39 },
      { label: "Education", share: 18 },
      { label: "Debt interest", share: 6 },
      { label: "Infrastructure", share: 12 },
      { label: "Social services", share: 13 },
      { label: "Federal programs", share: 12 },
    ],
  },
  {
    slug: "alberta",
    name: "Alberta",
    salesTaxLabel: "GST",
    salesTaxRate: 5,
    incomeTaxIndex: 0.9,
    spending: [
      { label: "Healthcare", share: 38 },
      { label: "Education", share: 20 },
      { label: "Debt interest", share: 5 },
      { label: "Infrastructure", share: 13 },
      { label: "Social services", share: 12 },
      { label: "Federal programs", share: 12 },
    ],
  },
  {
    slug: "british-columbia",
    name: "British Columbia",
    salesTaxLabel: "GST + PST",
    salesTaxRate: 12,
    incomeTaxIndex: 0.96,
    spending: [
      { label: "Healthcare", share: 37 },
      { label: "Education", share: 17 },
      { label: "Debt interest", share: 6 },
      { label: "Housing programs", share: 9 },
      { label: "Social services", share: 17 },
      { label: "Federal programs", share: 14 },
    ],
  },
  {
    slug: "quebec",
    name: "Quebec",
    salesTaxLabel: "GST + QST",
    salesTaxRate: 14.975,
    incomeTaxIndex: 1.13,
    spending: [
      { label: "Healthcare", share: 35 },
      { label: "Education", share: 16 },
      { label: "Debt interest", share: 8 },
      { label: "Family programs", share: 10 },
      { label: "Social services", share: 18 },
      { label: "Federal programs", share: 13 },
    ],
  },
  {
    slug: "new-brunswick",
    name: "New Brunswick",
    salesTaxLabel: "HST",
    salesTaxRate: 15,
    incomeTaxIndex: 1.03,
    spending: [
      { label: "Healthcare", share: 39 },
      { label: "Education", share: 16 },
      { label: "Debt interest", share: 8 },
      { label: "Infrastructure", share: 10 },
      { label: "Social services", share: 16 },
      { label: "Federal programs", share: 11 },
    ],
  },
  {
    slug: "nova-scotia",
    name: "Nova Scotia",
    salesTaxLabel: "HST",
    salesTaxRate: 15,
    incomeTaxIndex: 1.08,
    spending: [
      { label: "Healthcare", share: 40 },
      { label: "Education", share: 15 },
      { label: "Debt interest", share: 9 },
      { label: "Infrastructure", share: 9 },
      { label: "Social services", share: 16 },
      { label: "Federal programs", share: 11 },
    ],
  },
  {
    slug: "prince-edward-island",
    name: "Prince Edward Island",
    salesTaxLabel: "HST",
    salesTaxRate: 15,
    incomeTaxIndex: 1.06,
    spending: [
      { label: "Healthcare", share: 38 },
      { label: "Education", share: 16 },
      { label: "Debt interest", share: 8 },
      { label: "Infrastructure", share: 11 },
      { label: "Social services", share: 16 },
      { label: "Federal programs", share: 11 },
    ],
  },
  {
    slug: "newfoundland-and-labrador",
    name: "Newfoundland and Labrador",
    salesTaxLabel: "HST",
    salesTaxRate: 15,
    incomeTaxIndex: 1.07,
    spending: [
      { label: "Healthcare", share: 39 },
      { label: "Education", share: 15 },
      { label: "Debt interest", share: 10 },
      { label: "Infrastructure", share: 11 },
      { label: "Social services", share: 14 },
      { label: "Federal programs", share: 11 },
    ],
  },
  {
    slug: "yukon",
    name: "Yukon",
    salesTaxLabel: "GST",
    salesTaxRate: 5,
    incomeTaxIndex: 0.94,
    spending: [
      { label: "Healthcare", share: 32 },
      { label: "Education", share: 15 },
      { label: "Debt interest", share: 4 },
      { label: "Infrastructure", share: 18 },
      { label: "Social services", share: 16 },
      { label: "Federal programs", share: 15 },
    ],
  },
  {
    slug: "northwest-territories",
    name: "Northwest Territories",
    salesTaxLabel: "GST",
    salesTaxRate: 5,
    incomeTaxIndex: 0.97,
    spending: [
      { label: "Healthcare", share: 33 },
      { label: "Education", share: 14 },
      { label: "Debt interest", share: 4 },
      { label: "Infrastructure", share: 19 },
      { label: "Social services", share: 16 },
      { label: "Federal programs", share: 14 },
    ],
  },
  {
    slug: "nunavut",
    name: "Nunavut",
    salesTaxLabel: "GST",
    salesTaxRate: 5,
    incomeTaxIndex: 0.92,
    spending: [
      { label: "Healthcare", share: 31 },
      { label: "Education", share: 14 },
      { label: "Debt interest", share: 3 },
      { label: "Housing and infrastructure", share: 24 },
      { label: "Social services", share: 15 },
      { label: "Federal programs", share: 13 },
    ],
  },
];

export function getTaxProfile(slug: string) {
  return taxProfiles.find((profile) => profile.slug === slug) ?? taxProfiles.find((profile) => profile.slug === "canada")!;
}

export function estimateTaxReceipt(income: number, provinceSlug: string) {
  const profile = getTaxProfile(provinceSlug);
  const baseEffectiveRate = income < 60000 ? 0.19 : income < 110000 ? 0.255 : income < 180000 ? 0.32 : 0.38;
  const incomeTax = income * baseEffectiveRate * profile.incomeTaxIndex;
  const estimatedSalesTaxBase = income * 0.42;
  const salesTax = estimatedSalesTaxBase * (profile.salesTaxRate / 100);
  const totalTax = incomeTax + salesTax;

  return {
    profile,
    incomeTax: Math.round(incomeTax),
    salesTax: Math.round(salesTax),
    totalTax: Math.round(totalTax),
    spending: profile.spending.map((item) => ({
      ...item,
      amount: Math.round(totalTax * (item.share / 100)),
    })),
  };
}
