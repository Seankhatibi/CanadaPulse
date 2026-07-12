const sourceUrl = "https://www.cihi.ca/en/national-health-expenditure-trends";

function textContent(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function numberAfter(text: string, pattern: RegExp, fallback: number) {
  const match = text.match(pattern);
  const value = Number(match?.[1]?.replace(/,/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

export async function fetchCihiHealthSnapshot() {
  let status: "live" | "fallback" = "live";
  let text = "";
  try {
    const response = await fetch(sourceUrl, { next: { revalidate: 60 * 60 * 12 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`CIHI returned ${response.status}`);
    text = textContent(await response.text());
  } catch {
    status = "fallback";
  }

  const period = text.match(/spending in Canada is expected to reach[^.]*in (20\d{2})/i)?.[1] ?? "2025";
  const total = numberAfter(text, /reach \$([\d,.]+) billion/i, 399);
  const perPerson = numberAfter(text, /or \$([\d,]+) per Canadian/i, 9626);
  const gdpShare = numberAfter(text, /represent ([\d.]+)% of Canada(?:'|’)s gross domestic product/i, 12.7);
  const totalGrowth = numberAfter(text, /expected to grow by ([\d.]+)% in 2025/i, 4.2);
  const hospitalGrowth = numberAfter(text, /Hospital spending is projected to grow by ([\d.]+)%/i, 4.0);
  const physicianGrowth = numberAfter(text, /physician services is forecast to grow by ([\d.]+)%/i, 3.1);
  const realPerCapitaGrowth = numberAfter(text, /real per capita health expenditure in the public sector is expected to rebound to ([\d.-]+)%/i, 0.6);

  return {
    source: "Canadian Institute for Health Information",
    sourceUrl,
    period,
    status,
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
