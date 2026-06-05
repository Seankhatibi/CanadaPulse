import {
  Apple,
  BriefcaseBusiness,
  Home,
  LineChart,
  ReceiptText,
  Scale,
  Users,
} from "lucide-react";
import { provinces } from "@/lib/canada-pulse-data";
import {
  equalizationContributionContext,
  equalizationNonRecipients,
  equalizationProgram,
  equalizationRecipients,
  equalizationShare,
  formatEqualizationAmount,
} from "@/lib/equalization-data";
import { estimateTaxReceipt, taxProfiles } from "@/lib/tax-data";

export type IssueComponent = { label: string; value: string; numeric: number; note: string };

export type Issue = {
  slug: string;
  title: string;
  question: string;
  nationalValue: string;
  nationalLabel: string;
  movement: string;
  source: string;
  icon: typeof Apple;
  tone: string;
  provinceValues: Array<{ province: string; abbr: string; slug: string; value: string; numeric: number; note: string }>;
  components: IssueComponent[];
  provinceComponents?: Record<string, IssueComponent[]>;
};

export const issues: Issue[] = [
  {
    slug: "food-inflation",
    title: "Food inflation",
    question: "How much more expensive is the grocery cart?",
    nationalValue: "5.4%",
    nationalLabel: "food inflation, y/y",
    movement: "Restaurants and staples are still doing the damage.",
    source: "Statistics Canada CPI tables",
    icon: Apple,
    tone: "from-red-600 to-amber-500",
    provinceValues: [
      { province: "Nova Scotia", abbr: "NS", slug: "nova-scotia", value: "6.2%", numeric: 6.2, note: "highest pressure" },
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "5.8%", numeric: 5.8, note: "urban grocery squeeze" },
      { province: "British Columbia", abbr: "BC", slug: "british-columbia", value: "5.6%", numeric: 5.6, note: "high rent plus food" },
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "5.1%", numeric: 5.1, note: "wage offset stronger" },
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "4.9%", numeric: 4.9, note: "below national demo" },
      { province: "Manitoba", abbr: "MB", slug: "manitoba", value: "4.7%", numeric: 4.7, note: "lower basket pressure" },
    ],
    components: [
      { label: "Restaurant food", value: "7.8%", numeric: 7.8, note: "eating out keeps rising" },
      { label: "Meat", value: "6.4%", numeric: 6.4, note: "protein shock" },
      { label: "Bakery and grains", value: "5.9%", numeric: 5.9, note: "staples pressure" },
      { label: "Vegetables", value: "4.8%", numeric: 4.8, note: "volatile supply" },
      { label: "Dairy and eggs", value: "3.9%", numeric: 3.9, note: "sticky essentials" },
    ],
  },
  {
    slug: "rent-burden",
    title: "Rent burden",
    question: "How much of a paycheque disappears into rent?",
    nationalValue: "36%",
    nationalLabel: "rent-to-income burden",
    movement: "Young renters are living closest to the edge.",
    source: "CMHC + Statistics Canada income",
    icon: Home,
    tone: "from-fuchsia-600 to-red-600",
    provinceValues: [
      { province: "British Columbia", abbr: "BC", slug: "british-columbia", value: "44%", numeric: 44, note: "highest burden" },
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "41%", numeric: 41, note: "GTA pressure" },
      { province: "Nova Scotia", abbr: "NS", slug: "nova-scotia", value: "38%", numeric: 38, note: "fast rent reset" },
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "31%", numeric: 31, note: "relative relief" },
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "29%", numeric: 29, note: "income helps" },
      { province: "Saskatchewan", abbr: "SK", slug: "saskatchewan", value: "27%", numeric: 27, note: "most survivable" },
    ],
    components: [
      { label: "Rent", value: "$2,180", numeric: 2180, note: "national average demo" },
      { label: "Utilities", value: "$230", numeric: 230, note: "monthly basics" },
      { label: "Insurance", value: "$55", numeric: 55, note: "renter coverage" },
      { label: "Transit/commute", value: "$260", numeric: 260, note: "getting to work" },
    ],
  },
  {
    slug: "population-vs-housing",
    title: "Population vs housing",
    question: "Are we adding people faster than homes?",
    nationalValue: "3.1%",
    nationalLabel: "population growth",
    movement: "The viral chart is people added vs homes completed.",
    source: "StatCan population + CMHC completions",
    icon: Users,
    tone: "from-sky-600 to-red-600",
    provinceValues: [
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "+4.4%", numeric: 4.4, note: "in-migration surge" },
      { province: "PEI", abbr: "PE", slug: "prince-edward-island", value: "+4.0%", numeric: 4.0, note: "small market stress" },
      { province: "Nova Scotia", abbr: "NS", slug: "nova-scotia", value: "+3.8%", numeric: 3.8, note: "Halifax squeeze" },
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "+3.2%", numeric: 3.2, note: "large absolute flow" },
      { province: "BC", abbr: "BC", slug: "british-columbia", value: "+2.9%", numeric: 2.9, note: "supply constrained" },
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "+2.4%", numeric: 2.4, note: "slower growth" },
    ],
    components: [
      { label: "Permanent residents", value: "485k", numeric: 485, note: "annual admissions" },
      { label: "Study permits", value: "474k", numeric: 474, note: "holders only" },
      { label: "Work permits", value: "1.49M", numeric: 1495, note: "holders only" },
      { label: "Asylum/protected", value: "535k", numeric: 535, note: "IRCC stock" },
      { label: "Completions", value: "188k", numeric: 188, note: "housing supply" },
    ],
  },
  {
    slug: "youth-jobs",
    title: "Youth jobs",
    question: "Can young Canadians get a foothold?",
    nationalValue: "13.4%",
    nationalLabel: "youth unemployment",
    movement: "Jobs, rent, and student debt belong on one screen.",
    source: "Statistics Canada Labour Force Survey",
    icon: BriefcaseBusiness,
    tone: "from-violet-600 to-sky-600",
    provinceValues: [
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "14.6%", numeric: 14.6, note: "largest youth market" },
      { province: "BC", abbr: "BC", slug: "british-columbia", value: "13.8%", numeric: 13.8, note: "high cost labour" },
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "12.9%", numeric: 12.9, note: "lower rent offset" },
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "12.1%", numeric: 12.1, note: "energy jobs help" },
      { province: "Manitoba", abbr: "MB", slug: "manitoba", value: "11.8%", numeric: 11.8, note: "stable market" },
    ],
    components: [
      { label: "Youth unemployment", value: "13.4%", numeric: 13.4, note: "jobs pressure" },
      { label: "Average rent", value: "$2,180", numeric: 2180, note: "starting-life cost" },
      { label: "Childcare", value: "$745", numeric: 745, note: "family formation" },
      { label: "Down payment years", value: "9.6", numeric: 9.6, note: "ownership gap" },
    ],
  },
  {
    slug: "productivity",
    title: "Productivity",
    question: "Is Canada getting richer per hour worked?",
    nationalValue: "-0.7%",
    nationalLabel: "productivity growth",
    movement: "This is the boring chart that explains living standards.",
    source: "Statistics Canada productivity accounts",
    icon: LineChart,
    tone: "from-emerald-600 to-amber-500",
    provinceValues: [
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "+1.1%", numeric: 1.1, note: "capital intensity" },
      { province: "Saskatchewan", abbr: "SK", slug: "saskatchewan", value: "+0.6%", numeric: 0.6, note: "resources" },
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "-0.3%", numeric: -0.3, note: "mixed" },
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "-0.8%", numeric: -0.8, note: "services drag" },
      { province: "BC", abbr: "BC", slug: "british-columbia", value: "-1.0%", numeric: -1.0, note: "housing-heavy economy" },
    ],
    components: [
      { label: "Output per hour", value: "-0.7%", numeric: -0.7, note: "national trend" },
      { label: "Business investment", value: "-1.8%", numeric: -1.8, note: "capital gap" },
      { label: "GDP per capita", value: "$61.8k", numeric: 61.8, note: "prosperity signal" },
      { label: "Real wages", value: "+0.4%", numeric: 0.4, note: "barely moving" },
    ],
  },
  {
    slug: "tax-receipt",
    title: "Tax receipt",
    question: "Where does your money go?",
    nationalValue: "$26k",
    nationalLabel: "tax receipt on $92k income",
    movement: "The answer changes by province.",
    source: "CRA + budget/public accounts",
    icon: ReceiptText,
    tone: "from-red-700 to-stone-600",
    provinceValues: [
      { province: "Quebec", abbr: "QC", slug: "quebec", value: "$32.3k", numeric: 32.3, note: "higher income tax index" },
      { province: "Ontario", abbr: "ON", slug: "ontario", value: "$28.7k", numeric: 28.7, note: "HST province" },
      { province: "BC", abbr: "BC", slug: "british-columbia", value: "$27.0k", numeric: 27.0, note: "PST + GST" },
      { province: "Alberta", abbr: "AB", slug: "alberta", value: "$23.7k", numeric: 23.7, note: "no PST" },
    ],
    components: [
      { label: "Healthcare", value: "34%", numeric: 34, note: "largest visible service" },
      { label: "Transfers/seniors", value: "24%", numeric: 24, note: "income security" },
      { label: "Debt interest", value: "12%", numeric: 12, note: "cost of debt" },
      { label: "Infrastructure", value: "8%", numeric: 8, note: "capital spend" },
    ],
  },
  {
    slug: "equalization-epp",
    title: "Equalization and fiscal transfers",
    question: "Who contributes, who receives, and by how much?",
    nationalValue: "$27.2B",
    nationalLabel: "2026-27 Equalization pool",
    movement: "Quebec receives the largest amount; contribution is best shown as federal tax-base/fiscal-capacity context, not province-to-province cheques.",
    source: "Government of Canada federal transfers",
    icon: Scale,
    tone: "from-red-700 to-blue-700",
    provinceValues: equalizationRecipients.map((item) => ({
      province: item.province,
      abbr: item.abbr,
      slug: item.slug,
      value: formatEqualizationAmount(item.amount),
      numeric: item.amount / 1_000,
      note: `recipient, ${equalizationShare(item.amount)}% of ${equalizationProgram.fiscalYear} pool`,
    })),
    components: [
      ...equalizationRecipients.slice(0, 5).map((item) => ({
        label: item.province,
        value: `${formatEqualizationAmount(item.amount)} / ${equalizationShare(item.amount)}%`,
        numeric: item.amount / 1_000,
        note: item.slug === "quebec" ? "largest recipient" : "recipient",
      })),
      {
        label: "Ontario + Newfoundland and Labrador",
        value: "$588M / 2%",
        numeric: 0.588,
        note: "smaller 2026-27 recipients",
      },
    ],
    provinceComponents: {},
  },
];

const taxIssue = issues.find((issue) => issue.slug === "tax-receipt");
if (taxIssue) {
  taxIssue.provinceValues = taxProfiles
    .filter((profile) => profile.slug !== "canada")
    .map((profile) => {
      const receipt = estimateTaxReceipt(92000, profile.slug);

      return {
        province: profile.name,
        abbr: provinces.find((province) => province.slug === profile.slug)?.abbr ?? profile.name.slice(0, 2).toUpperCase(),
        slug: profile.slug,
        value: `$${Math.round(receipt.totalTax / 100) / 10}k`,
        numeric: Math.round(receipt.totalTax / 100) / 10,
        note: `${profile.salesTaxLabel} ${profile.salesTaxRate}%`,
      };
    })
    .sort((a, b) => b.numeric - a.numeric);
}

const provinceFallbackByIssue: Record<string, (province: (typeof provinces)[number], index: number) => Issue["provinceValues"][number]> = {
  "food-inflation": (province, index) => {
    const value = Math.max(3.8, 6.1 - index * 0.16 + (province.pressure.includes("Rental") ? 0.4 : 0));
    return {
      province: province.name,
      abbr: province.abbr,
      slug: province.slug,
      value: `${value.toFixed(1)}%`,
      numeric: Number(value.toFixed(1)),
      note: "modeled provincial CPI split",
    };
  },
  "rent-burden": (province, index) => {
    const value = Math.max(24, 43 - index * 1.35 + (province.pressure.includes("housing") || province.pressure.includes("Rental") ? 3 : 0));
    return {
      province: province.name,
      abbr: province.abbr,
      slug: province.slug,
      value: `${Math.round(value)}%`,
      numeric: Math.round(value),
      note: "modeled rent-to-income burden",
    };
  },
  "population-vs-housing": (province, index) => {
    const value = Math.max(0.8, 4.1 - index * 0.22 + (province.status.includes("High") ? 0.3 : 0));
    return {
      province: province.name,
      abbr: province.abbr,
      slug: province.slug,
      value: `+${value.toFixed(1)}%`,
      numeric: Number(value.toFixed(1)),
      note: "modeled population pressure",
    };
  },
  "youth-jobs": (province, index) => {
    const value = Math.max(8.7, 14.4 - index * 0.28);
    return {
      province: province.name,
      abbr: province.abbr,
      slug: province.slug,
      value: `${value.toFixed(1)}%`,
      numeric: Number(value.toFixed(1)),
      note: "modeled youth labour pressure",
    };
  },
  productivity: (province, index) => {
    const value = province.score > 70 ? 0.9 - index * 0.08 : -0.2 - index * 0.08;
    return {
      province: province.name,
      abbr: province.abbr,
      slug: province.slug,
      value: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
      numeric: Number(value.toFixed(1)),
      note: "modeled output-per-hour trend",
    };
  },
  "equalization-epp": (province) => ({
    province: province.name,
    abbr: province.abbr,
    slug: province.slug,
    value: "$0",
    numeric: 0,
    note: "not receiving Equalization in 2026-27 / contribution context",
  }),
};

for (const issue of issues) {
  const fallback = provinceFallbackByIssue[issue.slug];
  if (!fallback) {
    continue;
  }

  const existing = new Map(issue.provinceValues.map((item) => [item.slug, item]));
  issue.provinceValues = provinces
    .map((province, index) => existing.get(province.slug) ?? fallback(province, index))
    .sort((a, b) => b.numeric - a.numeric);
}

const componentProfiles: Record<string, Record<string, IssueComponent[]>> = {
  "food-inflation": {
    ontario: [
      { label: "Restaurant food", value: "8.1%", numeric: 8.1, note: "service labour and rent costs" },
      { label: "Meat", value: "6.7%", numeric: 6.7, note: "protein pressure" },
      { label: "Bakery and grains", value: "6.1%", numeric: 6.1, note: "staples up" },
      { label: "Vegetables", value: "5.2%", numeric: 5.2, note: "import volatility" },
    ],
    alberta: [
      { label: "Restaurant food", value: "7.2%", numeric: 7.2, note: "service inflation" },
      { label: "Meat", value: "5.8%", numeric: 5.8, note: "regional supply offset" },
      { label: "Bakery and grains", value: "5.3%", numeric: 5.3, note: "grain products" },
      { label: "Dairy and eggs", value: "3.6%", numeric: 3.6, note: "sticky essentials" },
    ],
    "british-columbia": [
      { label: "Restaurant food", value: "8.0%", numeric: 8, note: "high operating costs" },
      { label: "Vegetables", value: "5.9%", numeric: 5.9, note: "import and freight" },
      { label: "Meat", value: "6.2%", numeric: 6.2, note: "protein shock" },
      { label: "Dairy and eggs", value: "4.1%", numeric: 4.1, note: "sticky essentials" },
    ],
    quebec: [
      { label: "Restaurant food", value: "7.1%", numeric: 7.1, note: "services pressure" },
      { label: "Bakery and grains", value: "5.4%", numeric: 5.4, note: "staples" },
      { label: "Meat", value: "5.1%", numeric: 5.1, note: "below national demo" },
      { label: "Vegetables", value: "4.2%", numeric: 4.2, note: "less severe" },
    ],
  },
  "rent-burden": {
    ontario: [
      { label: "Rent", value: "$2,572", numeric: 2572, note: "modeled average" },
      { label: "Utilities", value: "$244", numeric: 244, note: "monthly basics" },
      { label: "Transit/commute", value: "$310", numeric: 310, note: "GTA drag" },
      { label: "Insurance", value: "$62", numeric: 62, note: "renter cost" },
    ],
    "british-columbia": [
      { label: "Rent", value: "$2,878", numeric: 2878, note: "highest demo rent" },
      { label: "Utilities", value: "$238", numeric: 238, note: "monthly basics" },
      { label: "Transit/commute", value: "$284", numeric: 284, note: "metro cost" },
      { label: "Insurance", value: "$68", numeric: 68, note: "renter cost" },
    ],
    alberta: [
      { label: "Rent", value: "$1,940", numeric: 1940, note: "income offset stronger" },
      { label: "Utilities", value: "$285", numeric: 285, note: "energy and delivery" },
      { label: "Commute", value: "$340", numeric: 340, note: "car-heavy" },
      { label: "Insurance", value: "$70", numeric: 70, note: "renter cost" },
    ],
  },
  "population-vs-housing": {
    ontario: [
      { label: "Population growth", value: "+3.2%", numeric: 3.2, note: "large absolute flow" },
      { label: "Housing completions", value: "75k", numeric: 75, note: "supply response" },
      { label: "Non-permanent residents", value: "1.1M", numeric: 1100, note: "stock pressure" },
      { label: "Youth unemployment", value: "14.6%", numeric: 14.6, note: "jobs absorption" },
    ],
    alberta: [
      { label: "Population growth", value: "+4.4%", numeric: 4.4, note: "in-migration surge" },
      { label: "Housing completions", value: "44k", numeric: 44, note: "building response" },
      { label: "Interprovincial migration", value: "High", numeric: 80, note: "domestic inflow" },
      { label: "Youth unemployment", value: "12.1%", numeric: 12.1, note: "labour absorption" },
    ],
    "nova-scotia": [
      { label: "Population growth", value: "+3.8%", numeric: 3.8, note: "fast for market size" },
      { label: "Housing completions", value: "6.8k", numeric: 6.8, note: "supply constrained" },
      { label: "Rent burden", value: "38%", numeric: 38, note: "rental stress" },
      { label: "Healthcare capacity", value: "Tight", numeric: 72, note: "system pressure" },
    ],
  },
  "tax-receipt": {
    ontario: [
      { label: "Healthcare", value: "36%", numeric: 36, note: "largest provincial spend" },
      { label: "Education", value: "18%", numeric: 18, note: "schools and postsecondary" },
      { label: "Debt interest", value: "10%", numeric: 10, note: "cost of debt" },
      { label: "Social services", value: "15%", numeric: 15, note: "income and community support" },
    ],
    alberta: [
      { label: "Healthcare", value: "38%", numeric: 38, note: "largest provincial spend" },
      { label: "Education", value: "20%", numeric: 20, note: "schools and postsecondary" },
      { label: "Infrastructure", value: "13%", numeric: 13, note: "capital buildout" },
      { label: "Debt interest", value: "5%", numeric: 5, note: "lower burden" },
    ],
    quebec: [
      { label: "Healthcare", value: "35%", numeric: 35, note: "largest provincial spend" },
      { label: "Social services", value: "18%", numeric: 18, note: "program-heavy model" },
      { label: "Education", value: "16%", numeric: 16, note: "schools and postsecondary" },
      { label: "Debt interest", value: "8%", numeric: 8, note: "cost of debt" },
    ],
  },
  "equalization-epp": {
    alberta: [
      { label: "Equalization received", value: "$0 / 0%", numeric: 0, note: "not a 2026-27 recipient" },
      { label: "Contribution context", value: "High", numeric: 92, note: "fiscal-capacity / resource context" },
      { label: "Program total", value: "$27.2B", numeric: 27.16, note: "financed from federal general revenues" },
      { label: "Important caveat", value: "No direct cheque", numeric: 1, note: "provinces do not directly pay other provinces" },
    ],
    ontario: [
      { label: "Equalization received", value: "$406M / 1%", numeric: 0.406, note: "small 2026-27 recipient" },
      { label: "Contribution context", value: "#1", numeric: 100, note: "largest absolute federal tax-base proxy" },
      { label: "Program total", value: "$27.2B", numeric: 27.16, note: "financed from federal general revenues" },
      { label: "Important caveat", value: "No direct cheque", numeric: 1, note: "provinces do not directly pay other provinces" },
    ],
    quebec: [
      { label: "Equalization received", value: "$13.9B / 51%", numeric: 13.907, note: "largest 2026-27 recipient" },
      { label: "Total major transfers", value: "$30.3B", numeric: 30.256, note: "CHT + CST + Equalization" },
      { label: "Share of pool", value: "51%", numeric: 51, note: "absolute and percentage view" },
      { label: "Important caveat", value: "General revenue", numeric: 1, note: "funded federally, not by province-to-province cheques" },
    ],
    manitoba: [
      { label: "Equalization received", value: "$5.0B / 19%", numeric: 5.044, note: "second-largest 2026-27 recipient" },
      { label: "Total major transfers", value: "$7.8B", numeric: 7.781, note: "CHT + CST + Equalization" },
      { label: "Share of pool", value: "19%", numeric: 19, note: "pool share" },
      { label: "Important caveat", value: "General revenue", numeric: 1, note: "funded federally, not by province-to-province cheques" },
    ],
  },
};

componentProfiles["equalization-epp"] = {
  ...(componentProfiles["equalization-epp"] ?? {}),
  ...Object.fromEntries(
    equalizationRecipients.map((item) => [
      item.slug,
      [
        {
          label: "Equalization received",
          value: `${formatEqualizationAmount(item.amount)} / ${equalizationShare(item.amount)}%`,
          numeric: item.amount / 1_000,
          note: `${equalizationProgram.fiscalYear} federal transfer amount`,
        },
        {
          label: "Program total",
          value: "$27.2B",
          numeric: 27.16,
          note: "total Equalization envelope",
        },
        {
          label: "Funding caveat",
          value: "Federal general revenues",
          numeric: 1,
          note: "not province-to-province transfers",
        },
      ],
    ]),
  ),
  ...Object.fromEntries(
    equalizationNonRecipients.map((item) => [
      item.slug,
      [
        { label: "Equalization received", value: "$0 / 0%", numeric: 0, note: item.note },
        {
          label: "Program total",
          value: "$27.2B",
          numeric: 27.16,
          note: "total Equalization envelope",
        },
        {
          label: "Funding caveat",
          value: "Federal general revenues",
          numeric: 1,
          note: "not province-to-province transfers",
        },
      ],
    ]),
  ),
  ...Object.fromEntries(
    equalizationContributionContext.map((item) => [
      item.slug,
      [
        ...(componentProfiles["equalization-epp"]?.[item.slug] ?? []),
        {
          label: "Contributor context",
          value: item.value,
          numeric: item.numeric,
          note: item.signal,
        },
      ],
    ]),
  ),
};

componentProfiles["tax-receipt"] = {
  ...(componentProfiles["tax-receipt"] ?? {}),
  ...Object.fromEntries(
    taxProfiles
      .filter((profile) => profile.slug !== "canada")
      .map((profile) => [
        profile.slug,
        profile.spending.map((item) => ({
          label: item.label,
          value: `${item.share}%`,
          numeric: item.share,
          note: `${profile.name} spending mix`,
        })),
      ]),
  ),
};

const defaultComponents = Object.fromEntries(issues.map((issue) => [issue.slug, issue.components]));

for (const issue of issues) {
  issue.provinceComponents = {
    ...Object.fromEntries(issue.provinceValues.map((province) => [province.slug, defaultComponents[issue.slug]])),
    ...(componentProfiles[issue.slug] ?? {}),
  };
}

export function getIssue(slug: string) {
  return issues.find((issue) => issue.slug === slug);
}

export function getIssueProvince(issueSlug: string, provinceSlug: string) {
  const issue = getIssue(issueSlug);
  const province = issue?.provinceValues.find((item) => item.slug === provinceSlug);
  const components = issue?.provinceComponents?.[provinceSlug] ?? issue?.components;

  if (!issue || !province || !components) {
    return null;
  }

  return { issue, province, components };
}
