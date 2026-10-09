import { cache } from "react";
export type PolicyBill = { id: string; number: string; title: string; status: string; stage: string; updated: string | null; introduced: string | null; assent: string | null; url: string; sponsor: string; parliament: number; session: number; topics: string[] };
export type PolicyFeed = { bills: PolicyBill[]; checkedAt: string; status: "loaded" | "unavailable" };
type OfficialBill = { Id?: number; NumberCode?: string; LongTitleEn?: string; ShortTitleEn?: string; StatusNameEn?: string; LatestCompletedMajorStageNameEn?: string; LatestCompletedBillStageDateTime?: string; LatestBillEventDateTime?: string; ReceivedRoyalAssentDateTime?: string; PassedHouseFirstReadingDateTime?: string; PassedHouseSecondReadingDateTime?: string; PassedHouseThirdReadingDateTime?: string; PassedSenateSecondReadingDateTime?: string; PassedSenateThirdReadingDateTime?: string; PassedSenateFirstReadingDateTime?: string; SponsorPersonName?: string; ParliamentNumber?: number; SessionNumber?: number };
function validDate(value?: string) { return value && /^20\d{2}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null; }
export function normalizeBill(bill: OfficialBill): PolicyBill | null {
  if (!bill.Id || !bill.NumberCode || !bill.LongTitleEn || !bill.ParliamentNumber || !bill.SessionNumber) return null;
  const title = bill.ShortTitleEn || bill.LongTitleEn;
  const topics = [
    ["Housing", /hous|rent|mortgage/i], ["Money", /tax|budget|income|afford|financial|benefit/i], ["Work & education", /employ|labour|education|student|training/i], ["Health & community", /health|care|disabil|safety|criminal/i], ["Future & environment", /energy|environment|climate|trade|digital|privacy|artificial/i],
  ].flatMap(([topic, pattern]) => (pattern as RegExp).test(`${title} ${bill.LongTitleEn}`) ? [topic as string] : []);
  return { id: String(bill.Id), number: bill.NumberCode, title, status: bill.StatusNameEn || "See official record", stage: bill.LatestCompletedMajorStageNameEn || "Stage not supplied", updated: [bill.LatestBillEventDateTime, bill.LatestCompletedBillStageDateTime, bill.ReceivedRoyalAssentDateTime, bill.PassedHouseFirstReadingDateTime, bill.PassedSenateFirstReadingDateTime, bill.PassedHouseSecondReadingDateTime, bill.PassedHouseThirdReadingDateTime, bill.PassedSenateSecondReadingDateTime, bill.PassedSenateThirdReadingDateTime].map(validDate).filter((date): date is string => Boolean(date)).sort().at(-1) ?? null, introduced: validDate(bill.PassedHouseFirstReadingDateTime) || validDate(bill.PassedSenateFirstReadingDateTime), assent: validDate(bill.ReceivedRoyalAssentDateTime), sponsor: bill.SponsorPersonName?.trim() || "See official record", parliament: bill.ParliamentNumber, session: bill.SessionNumber, topics, url: `https://www.parl.ca/legisinfo/en/bill/${bill.ParliamentNumber}-${bill.SessionNumber}/${bill.NumberCode.toLowerCase()}` };
}
export const getPolicyFeed = cache(async (): Promise<PolicyFeed> => {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch("https://www.parl.ca/legisinfo/en/bills/json", { signal: AbortSignal.timeout(10000), next: { revalidate: 1800, tags: ["canada-pulse-policy"] } });
    if (!response.ok) throw new Error("Legislative source unavailable");
    const raw: OfficialBill[] = await response.json();
    if (!Array.isArray(raw)) throw new Error("Unexpected legislative response");
    const bills = raw.flatMap((bill) => { const normalized = normalizeBill(bill); return normalized ? [normalized] : []; }).sort((a, b) => (b.updated ?? b.introduced ?? "").localeCompare(a.updated ?? a.introduced ?? ""));
    return { bills, checkedAt, status: bills.length ? "loaded" : "unavailable" };
  } catch { return { bills: [], checkedAt, status: "unavailable" }; }
});
