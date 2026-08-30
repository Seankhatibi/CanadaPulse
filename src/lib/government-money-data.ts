import { equalizationNonRecipients, equalizationProgram, equalizationRecipients } from "@/lib/equalization-data";
import { provinces } from "@/lib/province-directory";
import type { NormalizedRelease } from "@/lib/release-hub";

export type EqualizationProvinceValue = {
  province: string;
  slug: string;
  abbr: string;
  value: number;
  display: string;
  share: number;
  rank: number | null;
  intensity: number;
  receives: boolean;
};

export type EqualizationExplorerData = {
  label: string;
  lowColor: string;
  highColor: string;
  fiscalYear: string;
  total: number;
  totalDisplay: string;
  source: string;
  sourceUrl: string;
  note: string;
  values: EqualizationProvinceValue[];
};

function moneyMillions(amount: number) {
  return amount >= 1_000 ? `$${(amount / 1_000).toFixed(1)}B` : amount > 0 ? `$${amount}M` : "$0";
}

export function buildEqualizationExplorerData(): EqualizationExplorerData {
  const recipientBySlug = new Map(equalizationRecipients.map((item) => [item.slug, item]));
  const nonRecipientSlugs = new Set(equalizationNonRecipients.map((item) => item.slug));
  const rankedRecipients = equalizationRecipients.slice().sort((left, right) => right.amount - left.amount);
  const maximum = rankedRecipients[0]?.amount ?? 1;

  return {
    label: "Equalization receipts",
    lowColor: "#155e75",
    highColor: "#f59e0b",
    fiscalYear: equalizationProgram.fiscalYear,
    total: equalizationProgram.total,
    totalDisplay: moneyMillions(equalizationProgram.total),
    source: equalizationProgram.source,
    sourceUrl: equalizationProgram.sourceUrl,
    note: equalizationProgram.note,
    values: provinces
      .filter((province) => recipientBySlug.has(province.slug) || nonRecipientSlugs.has(province.slug))
      .map((province) => {
        const recipient = recipientBySlug.get(province.slug);
        const amount = recipient?.amount ?? 0;
        const recipientRank = recipient ? rankedRecipients.findIndex((item) => item.slug === province.slug) + 1 : null;
        return {
          province: province.name,
          slug: province.slug,
          abbr: province.abbr,
          value: amount,
          display: moneyMillions(amount),
          share: Number(((amount / equalizationProgram.total) * 100).toFixed(1)),
          rank: recipientRank,
          intensity: recipient ? 0.22 + (amount / maximum) * 0.78 : 0.08,
          receives: Boolean(recipient),
        };
      }),
  };
}

export function findFiscalMetric(release: NormalizedRelease, pattern: RegExp) {
  return release.chartPayloads.flatMap((chart) => chart.points).find((point) => pattern.test(point.label));
}
