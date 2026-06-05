import { Scale } from "lucide-react";

export const equalizationProgram = {
  fiscalYear: "2026-27",
  total: 27_160,
  source: "Government of Canada major federal transfers",
  sourceUrl: "https://www.canada.ca/en/department-finance/programs/federal-transfers/major-federal-transfers.html",
  note:
    "Equalization is financed by the federal government from general revenues, not by one province writing cheques to another.",
};

export const equalizationRecipients = [
  { province: "Quebec", abbr: "QC", slug: "quebec", amount: 13_907 },
  { province: "Manitoba", abbr: "MB", slug: "manitoba", amount: 5_044 },
  { province: "Nova Scotia", abbr: "NS", slug: "nova-scotia", amount: 3_538 },
  { province: "New Brunswick", abbr: "NB", slug: "new-brunswick", amount: 3_360 },
  { province: "Prince Edward Island", abbr: "PE", slug: "prince-edward-island", amount: 723 },
  { province: "Ontario", abbr: "ON", slug: "ontario", amount: 406 },
  { province: "Newfoundland and Labrador", abbr: "NL", slug: "newfoundland-and-labrador", amount: 182 },
];

export const equalizationNonRecipients = [
  { province: "Alberta", abbr: "AB", slug: "alberta", note: "No Equalization payment in 2026-27" },
  { province: "British Columbia", abbr: "BC", slug: "british-columbia", note: "No Equalization payment in 2026-27" },
  { province: "Saskatchewan", abbr: "SK", slug: "saskatchewan", note: "No Equalization payment in 2026-27" },
];

export const equalizationContributionContext = [
  {
    province: "Ontario",
    abbr: "ON",
    slug: "ontario",
    signal: "Largest absolute federal tax-base proxy",
    value: "#1",
    numeric: 100,
  },
  {
    province: "Alberta",
    abbr: "AB",
    slug: "alberta",
    signal: "Highest fiscal-capacity / resource context",
    value: "High",
    numeric: 92,
  },
  {
    province: "British Columbia",
    abbr: "BC",
    slug: "british-columbia",
    signal: "Large federal tax-base proxy, no Equalization receipt",
    value: "No receipt",
    numeric: 74,
  },
  {
    province: "Saskatchewan",
    abbr: "SK",
    slug: "saskatchewan",
    signal: "Resource fiscal-capacity context, no Equalization receipt",
    value: "No receipt",
    numeric: 68,
  },
];

export const equalizationTracker = {
  label: "Equalization / EPP",
  value: "$27.2B",
  change: "2026-27",
  question: "Quebec receives the most: $13.9B, about 51% of the pool.",
  cadence: "Annual federal transfer table",
  source: "Government of Canada transfers",
  href: "/issue/equalization-epp",
  tone: "from-red-700 to-blue-700",
  icon: Scale,
};

export function formatEqualizationAmount(amount: number) {
  return amount >= 1_000 ? `$${(amount / 1_000).toFixed(1)}B` : `$${amount}M`;
}

export function equalizationShare(amount: number) {
  return Math.round((amount / equalizationProgram.total) * 100);
}
