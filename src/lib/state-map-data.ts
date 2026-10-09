import { buildProvinceExplorerData, type MapTheme, type ProvinceExplorerCategory, type ProvinceExplorerData } from "@/lib/province-explorer-data";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";
import { lifeContext } from "@/lib/life-context";
import { hasStructuredMetrics, type NormalizedRelease, type ReleaseHubPayload } from "@/lib/release-hub";
import type { LifeSeries } from "@/lib/life-series";
import type { PolicyFeed } from "@/lib/policy-data";

function releaseTheme(release: NormalizedRelease): MapTheme {
  const text = `${release.title} ${release.releaseType} ${release.source}`;
  if (/immigra|citizen|refugee|population|ircc/i.test(text)) return "immigration";
  if (/fiscal|budget|finance-canada|public accounts|government/i.test(text)) return "government";
  if (/housing|rental|mortgage|cmhc/i.test(text)) return "housing";
  if (/energy|cer-nrcan|oil|gas |electric|climate|environment/i.test(text)) return "energy";
  if (/international.*trade|merchandise.*trade|export|import/i.test(text)) return "trade";
  if (/health|poverty|food insecurity|social|crime|community|wellbeing|quality.of.life/i.test(text)) return "society";
  return "economy";
}

export function newestVerifiedReleases(releases: NormalizedRelease[]): NormalizedRelease[] {
  return releases.filter((release) => release.status === "live" && !release.archiveFallback && hasStructuredMetrics(release) && /^\d{4}-\d{2}-\d{2}$/.test(release.releaseDate))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || b.importanceScore - a.importanceScore || b.youthImpactScore - a.youthImpactScore || a.id.localeCompare(b.id));
}

export function buildStateOfCanadaMap(hub: ReleaseHubPayload, series: LifeSeries[], policy: PolicyFeed): ProvinceExplorerData {
  const base = buildProvinceExplorerData(hub, series);
  const verified = newestVerifiedReleases(hub.todayQueue);
  const updates = verified.flatMap((release): ProvinceExplorerCategory[] => {
    // Reuse established, single-measure province mappings. Unknown regional rows
    // cannot be assigned a metric or common colour scale just from their numbers.
    const mapped = base.categories.find((category) => category.releaseHref === release.href && category.values.length >= 4);
    const context = lifeContext(release);
    if (mapped) return [{ ...mapped, measureId: mapped.id, id: `release:${release.id}`, label: release.title, headline: release.title, theme: releaseTheme(release), whyItMatters: context.impact }];
    const metrics = buildReleaseIntelligence(release).metrics.filter((metric) => Number.isFinite(metric.value) && metric.provenance !== "qualitative");
    const lead = metrics[0];
    if (!lead) return [];
    return [{
      id: `release:${release.id}`, label: release.title, headline: release.title, theme: releaseTheme(release),
      question: lead.label, context: `${release.plainEnglishSummary} ${context.limitation}`, whyItMatters: context.impact,
      source: release.publisher, sourceUrl: release.sourceUrl, period: lead.period ?? release.referencePeriod,
      releaseDate: release.releaseDate, releaseHref: release.href, highMeaning: "neutral", lowColor: "#164e63", highColor: "#22d3ee", values: [],
      national: { kind: "metric", display: lead.display, label: lead.label, note: lead.plainEnglish, href: release.href, changeDisplay: lead.changeDisplay, changePeriod: lead.changePeriod,
        metrics: metrics.slice(0, 4).map(({ label, display, changeDisplay }) => ({ label, display, changeDisplay })) },
    }];
  });
  const reports: ProvinceExplorerCategory[] = hub.todayQueue.filter((release) => ["live", "summary_only"].includes(release.status) && !release.archiveFallback && !hasStructuredMetrics(release)).map((release) => ({
    id: `release:${release.id}`, label: release.title, headline: release.title, theme: releaseTheme(release), question: "What does the official report say?",
    context: release.plainEnglishSummary, whyItMatters: lifeContext(release).impact, source: release.publisher, sourceUrl: release.sourceUrl,
    period: release.referencePeriod, releaseDate: release.releaseDate, releaseHref: release.href, highMeaning: "neutral", lowColor: "#164e63", highColor: "#22d3ee", values: [],
    national: { kind: "report", display: "Official report", label: "Report context · no numeric province comparison", note: release.headlineFacts[0] ?? release.plainEnglishSummary, href: release.href },
  }));
  const bills: ProvinceExplorerCategory[] = policy.bills.filter((bill) => Boolean(bill.updated)).slice(0, 18).map((bill) => ({
    id: `bill:${bill.id}`, label: `${bill.number} · ${bill.title}`, headline: bill.title, theme: "government",
    question: `${bill.number} · ${bill.title}`, context: `Last completed major stage: ${bill.stage}. ${bill.assent ? "Royal assent has been received. Effective dates, eligibility and implementation still need separate evidence." : "This parliamentary status does not establish that a change is law or in effect."}`,
    whyItMatters: "Government decisions can change services, rights and household costs. Check what the bill actually proposes, who is covered and when provisions take effect.",
    source: "Parliament of Canada · LEGISinfo", sourceUrl: bill.url, period: "Current legislative record", releaseDate: bill.updated!, releaseHref: `/policy/${bill.id}`,
    highMeaning: "neutral", lowColor: "#312e81", highColor: "#a78bfa", values: [],
    national: { kind: "legislation", display: bill.assent ? "Royal assent" : "Parliamentary bill", label: bill.number, note: bill.status, href: `/policy/${bill.id}` },
  }));
  const latest = [...updates, ...reports, ...bills].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  return { ...base, defaultCategory: updates[0]?.id ?? base.categories[0]?.id, categories: [...latest, ...base.categories] };
}
