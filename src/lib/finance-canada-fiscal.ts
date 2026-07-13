export type FiscalMetric = {
  label: string;
  value: number;
  previous: number;
  display: string;
  previousDisplay: string;
  change: number;
  changeDisplay: string;
  direction: "up" | "down" | "neutral";
  explanation: string;
};

export type FinanceCanadaFiscalSnapshot = {
  title: string;
  sourceUrl: string;
  releaseDate: string;
  referencePeriod: string;
  metrics: FiscalMetric[];
  summary: string;
};

const publicationsUrl = "https://www.canada.ca/en/department-finance/services/publications.html";

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function readMeta(html: string, name: string) {
  return html.match(new RegExp(`<meta[^>]+name=["']${name.replace(".", "\\.")}["'][^>]+content=["']([^"']+)`, "i"))?.[1] ?? "";
}

function readTitle(html: string) {
  const value = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "The Fiscal Monitor";
  return cleanHtml(value);
}

function rowValues(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}\\s+(-?[\\d,]+)\\s+(-?[\\d,]+)\\s+(-?[\\d,]+)\\s+(-?[\\d,]+)`, "i"));
  if (!match) throw new Error(`Fiscal Monitor row not found: ${label}`);
  return match.slice(1, 5).map((value) => Number(value.replace(/,/g, "")));
}

function billions(value: number) {
  return `$${(Math.abs(value) / 1_000).toFixed(1)}B`;
}

function metric(label: string, current: number, previous: number, explanation: string): FiscalMetric {
  const change = current - previous;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";
  const signedChange = `${change > 0 ? "+" : change < 0 ? "-" : ""}${billions(change)}`;
  return {
    label,
    value: Math.abs(current) / 1_000,
    previous: Math.abs(previous) / 1_000,
    display: billions(current),
    previousDisplay: billions(previous),
    change: Number((Math.abs(current) / 1_000 - Math.abs(previous) / 1_000).toFixed(1)),
    changeDisplay: signedChange,
    direction,
    explanation,
  };
}

export async function fetchFinanceCanadaFiscalSnapshot(): Promise<FinanceCanadaFiscalSnapshot> {
  const indexResponse = await fetch(publicationsUrl, {
    headers: { "User-Agent": "Canada Pulse Finance Canada importer" },
    next: { revalidate: 6 * 60 * 60 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!indexResponse.ok) throw new Error(`Finance Canada publications fetch failed: ${indexResponse.status}`);
  const indexHtml = await indexResponse.text();
  const latest = indexHtml.match(/<a href="([^"]*\/fiscal-monitor\/20\d{2}\/\d{2}\.html)">The Fiscal Monitor - ([^<]+)<\/a>[\s\S]*?<time datetime="(\d{4}-\d{2}-\d{2})"/i);
  if (!latest) throw new Error("Latest Finance Canada Fiscal Monitor link not found.");
  const sourceUrl = new URL(latest[1], publicationsUrl).toString();
  const response = await fetch(sourceUrl, {
    headers: { "User-Agent": "Canada Pulse Finance Canada importer" },
    next: { revalidate: 6 * 60 * 60 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Finance Canada Fiscal Monitor fetch failed: ${response.status}`);
  const html = await response.text();
  const text = cleanHtml(html);
  const title = readTitle(html);
  const releaseDate = latest[3] || readMeta(html, "dcterms.modified") || readMeta(html, "dcterms.date") || new Date().toISOString().slice(0, 10);
  const titlePeriod = title.match(/-\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i);
  const month = titlePeriod?.[1] ?? "latest month";
  const year = Number(titlePeriod?.[2] ?? new Date().getFullYear());
  const fiscalStart = /January|February|March/i.test(month) ? year - 1 : year;
  const referencePeriod = `April to ${month} ${fiscalStart}-${String(fiscalStart + 1).slice(-2)}`;

  const revenues = rowValues(text, "Revenues");
  const programExpenses = rowValues(text, "Program expenses, excluding net actuarial losses");
  const debtCharges = rowValues(text, "Public debt charges");
  const balance = rowValues(text, "Budgetary balance (deficit/surplus)");
  const currentDeficit = Math.abs(balance[3]);
  const previousDeficit = Math.abs(balance[2]);
  const debtShare = Number(((Math.abs(debtCharges[3]) / revenues[3]) * 100).toFixed(1));

  const metrics: FiscalMetric[] = [
    metric("Fiscal-year deficit", currentDeficit, previousDeficit, `The federal deficit widened by ${billions(currentDeficit - previousDeficit)} from the comparable prior fiscal year.`),
    metric("Federal revenue", revenues[3], revenues[2], `Revenue increased by ${billions(revenues[3] - revenues[2])} year over year.`),
    metric("Program expenses", Math.abs(programExpenses[3]), Math.abs(programExpenses[2]), `Program expenses excluding actuarial losses increased by ${billions(Math.abs(programExpenses[3]) - Math.abs(programExpenses[2]))}.`),
    metric("Public debt charges", Math.abs(debtCharges[3]), Math.abs(debtCharges[2]), `Debt charges consumed ${debtShare}% of federal revenue in the period.`),
    metric("Monthly deficit", Math.abs(balance[1]), Math.abs(balance[0]), `The latest monthly deficit was ${billions(balance[1])}, versus ${billions(balance[0])} one year earlier.`),
    {
      label: "Debt charges as share of revenue",
      value: debtShare,
      previous: Number(((Math.abs(debtCharges[2]) / revenues[2]) * 100).toFixed(1)),
      display: `${debtShare}%`,
      previousDisplay: `${((Math.abs(debtCharges[2]) / revenues[2]) * 100).toFixed(1)}%`,
      change: Number((debtShare - (Math.abs(debtCharges[2]) / revenues[2]) * 100).toFixed(1)),
      changeDisplay: `${debtShare >= (Math.abs(debtCharges[2]) / revenues[2]) * 100 ? "+" : ""}${(debtShare - (Math.abs(debtCharges[2]) / revenues[2]) * 100).toFixed(1)} pts`,
      direction: debtShare > (Math.abs(debtCharges[2]) / revenues[2]) * 100 ? "up" : "down",
      explanation: `About ${debtShare} cents of every federal revenue dollar went to public debt charges.`,
    },
  ];

  return {
    title,
    sourceUrl,
    releaseDate,
    referencePeriod,
    metrics,
    summary: `Ottawa recorded a ${billions(currentDeficit)} deficit in ${referencePeriod}. Revenue reached ${billions(revenues[3])}, while public debt charges reached ${billions(debtCharges[3])}.`,
  };
}
