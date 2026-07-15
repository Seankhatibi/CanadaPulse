const sourceUrl = "https://www.cihi.ca/en/national-health-expenditure-trends";

function textContent(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function numberAfter(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  const value = Number(match?.[1]?.replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

const lastVerified = {
  period: "2025",
  total: 399,
  perPerson: 9626,
  gdpShare: 12.7,
  totalGrowth: 4.2,
  hospitalGrowth: 4.0,
  physicianGrowth: 3.1,
  realPerCapitaGrowth: 0.6,
};

export async function fetchCihiHealthSnapshot() {
  let status: "live" | "fallback" = "live";
  let text = "";
  try {
    const response = await fetch(sourceUrl, { next: { revalidate: 60 * 60 * 12, tags: ["canada-pulse-cihi"] }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`CIHI returned ${response.status}`);
    text = textContent(await response.text());
  } catch {
    status = "fallback";
  }

  const parsed = {
    period: text.match(/spending in Canada is expected to reach[^.]*in (20\d{2})/i)?.[1] ?? null,
    total: numberAfter(text, /reach \$([\d,.]+) billion/i),
    perPerson: numberAfter(text, /or \$([\d,]+) per Canadian/i),
    gdpShare: numberAfter(text, /represent ([\d.]+)% of Canada(?:'|’)s gross domestic product/i),
    totalGrowth: numberAfter(text, /expected to grow by ([\d.]+)% in 2025/i),
    hospitalGrowth: numberAfter(text, /Hospital spending is projected to grow by ([\d.]+)%/i),
    physicianGrowth: numberAfter(text, /physician services is forecast to grow by ([\d.]+)%/i),
    realPerCapitaGrowth: numberAfter(text, /real per capita health expenditure in the public sector is expected to rebound to ([\d.-]+)%/i),
  };
  if (Object.values(parsed).some((value) => value === null)) status = "fallback";
  const period = parsed.period ?? lastVerified.period;
  const total = parsed.total ?? lastVerified.total;
  const perPerson = parsed.perPerson ?? lastVerified.perPerson;
  const gdpShare = parsed.gdpShare ?? lastVerified.gdpShare;
  const totalGrowth = parsed.totalGrowth ?? lastVerified.totalGrowth;
  const hospitalGrowth = parsed.hospitalGrowth ?? lastVerified.hospitalGrowth;
  const physicianGrowth = parsed.physicianGrowth ?? lastVerified.physicianGrowth;
  const realPerCapitaGrowth = parsed.realPerCapitaGrowth ?? lastVerified.realPerCapitaGrowth;

  return {
    source: "Canadian Institute for Health Information",
    sourceUrl,
    period,
    status,
    dataNote: status === "live" ? "All displayed values were parsed from the current CIHI source page." : "One or more current values could not be confirmed; the last verified CIHI snapshot is shown.",
    fetchedAt: new Date().toISOString(),
    summary: `Health spending is expected to reach $${total.toFixed(0)}B, or $${perPerson.toLocaleString("en-CA")} per Canadian, in ${period}.`,
    metrics: [
      { label: "Total health spending", value: `$${total.toFixed(0)}B`, numeric: total, change: `+${totalGrowth.toFixed(1)}%`, note: `Expected current-dollar spending in ${period}` },
      { label: "Spending per Canadian", value: `$${perPerson.toLocaleString("en-CA")}`, numeric: perPerson, change: "annual estimate", note: `Expected per-person spending in ${period}` },
      { label: "Share of GDP", value: `${gdpShare.toFixed(1)}%`, numeric: gdpShare, change: "economic burden", note: `Health expenditure as a share of GDP in ${period}` },
      { label: "Hospital spending growth", value: `${hospitalGrowth.toFixed(1)}%`, numeric: hospitalGrowth, change: "projected", note: `Projected hospital-spending growth in ${period}` },
      { label: "Physician spending growth", value: `${physicianGrowth.toFixed(1)}%`, numeric: physicianGrowth, change: "forecast", note: `Forecast growth in physician services in ${period}` },
      { label: "Real public spending per person", value: `${realPerCapitaGrowth.toFixed(1)}%`, numeric: realPerCapitaGrowth, change: "after inflation", note: `Expected real per-capita public-sector growth in ${period}` },
    ],
  };
}
