import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, Home, Landmark } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";
import { countStructuredMetrics, getMultiSourceReleaseHub, hasQualitativeAnalysis } from "@/lib/release-hub";
import { formatReleaseDate } from "@/lib/release-format";

export const dynamic = "force-dynamic";

export default async function WeeklyPulsePage() {
  const releaseHub = await getMultiSourceReleaseHub();
  const weekly = buildLiveWeeklyPulseSummary(releaseHub);
  const promoted = releaseHub.promotedRelease;
  const leadIntelligence = promoted ? buildReleaseIntelligence(promoted) : null;
  const leadMetrics = leadIntelligence?.metrics.slice(0, 6) ?? [];
  const housingItems = weekly.releases.filter((release) => release.affectedAreas.includes("housing")).slice(0, 3);
  const bankItems = weekly.releases.filter((release) => release.publisher === "Bank of Canada").slice(0, 3);

  return (
    <AppShell variant="light">
      <div className="space-y-10">
        <section className="border-b border-stone-300 pb-9 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
            <span className="rounded-md bg-red-700 px-2.5 py-1 text-white">
              {weekly.publishMode === "friday-weekly-summary" ? "Friday Weekly Pulse" : "Rolling seven-day brief"}
            </span>
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-stone-700">{weekly.generatedFor}</span>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight text-stone-950 sm:text-6xl">Canada in 60 Seconds</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">The most consequential official releases from the last seven days, translated into comparable facts without losing the source trail.</p>
          <div className="mt-7 grid gap-px overflow-hidden rounded-lg bg-stone-200 sm:grid-cols-3">
            {[
              ["Official releases", weekly.releaseCount.toString(), "in the rolling brief"],
              ["Structured releases", weekly.structuredReleaseCount.toString(), "with parsed values"],
              ["Live source families", weekly.liveSourceCount.toString(), "checked automatically"],
            ].map(([label, value, note]) => (
              <div key={label} className="bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">{label}</p>
                <p className="mt-2 font-mono text-3xl font-black text-stone-950">{value}</p>
                <p className="mt-1 text-xs text-stone-500">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {promoted ? (
          <section className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl shadow-stone-300/30 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-stone-950 p-5 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-300">The national story to carry forward</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{promoted.title}</h2>
              <p className="mt-4 text-lg font-bold leading-7 text-white">{leadIntelligence?.verdict}</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">{promoted.plainEnglishSummary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span>{promoted.publisher}</span><span>·</span><span>{formatReleaseDate(promoted.releaseDate)}</span><span>·</span><span>{promoted.referencePeriod}</span>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href={promoted.href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-stone-950 hover:bg-red-50">Open research brief <ArrowRight className="size-4" aria-hidden="true" /></Link>
                <ShareStatButton text={promoted.socialSummary} />
              </div>
            </div>
            <div className="grid gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
              {leadMetrics.map((metric) => (
                <article key={`${metric.label}-${metric.display}`} className="min-h-40 bg-white p-5">
                  <p className="text-xs font-black uppercase leading-4 tracking-[0.08em] text-stone-500">{metric.label}</p>
                  <p className="mt-5 font-mono text-3xl font-black text-stone-950">{metric.display}</p>
                  <p className={`mt-2 font-mono text-xs font-black ${metric.meaning === "positive" ? "text-emerald-700" : metric.meaning === "negative" ? "text-red-700" : "text-amber-700"}`}>{metric.changeDisplay ?? "latest value"}</p>
                  <p className="mt-3 text-xs text-stone-500">{metric.period ?? "Latest official period"}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">The briefing</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">What changed, in plain language</h2>
          <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
            {weekly.highlights.map((highlight, index) => (
              <div key={highlight} className="grid gap-2 py-4 sm:grid-cols-[2.5rem_1fr] sm:items-start">
                <span className="font-mono text-sm font-black text-red-700">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-base font-semibold leading-7 text-stone-800">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">Release ledger</p><h2 className="mt-2 text-3xl font-black text-stone-950">The week&apos;s official evidence</h2></div>
            <Link href="/releases" className="inline-flex items-center gap-2 text-sm font-black text-red-700">Search the release feed <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {weekly.releases.map((release) => {
              const metricCount = countStructuredMetrics(release);
              const evidence = metricCount ? `${metricCount} official metrics` : hasQualitativeAnalysis(release) ? "Narrative report analysis" : "Official summary";
              return (
                <Link key={release.id} href={release.href} className="group rounded-lg border border-stone-200 bg-white p-5 transition hover:border-red-300 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3 text-xs"><span className="font-black uppercase tracking-[0.1em] text-stone-700">{release.publisher}</span><span className="inline-flex items-center gap-1.5 text-stone-500"><CalendarDays className="size-3.5" aria-hidden="true" />{formatReleaseDate(release.releaseDate)}</span></div>
                  <h3 className="mt-4 text-xl font-black leading-snug text-stone-950 group-hover:text-red-800">{release.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{release.plainEnglishSummary}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-xs font-black text-emerald-800"><CheckCircle2 className="size-4" aria-hidden="true" />{evidence}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-y border-stone-300 py-8 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2"><Home className="size-5 text-red-700" aria-hidden="true" /><h2 className="text-2xl font-black text-stone-950">Housing watch</h2></div>
            <div className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
              {housingItems.map((release) => <Link key={release.id} href={release.href} className="flex items-center justify-between gap-4 py-4 font-bold text-stone-900 hover:text-red-800"><span>{release.title}</span><ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2"><Landmark className="size-5 text-red-700" aria-hidden="true" /><h2 className="text-2xl font-black text-stone-950">Rates and Bank reports</h2></div>
            <div className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
              {bankItems.map((release) => <Link key={release.id} href={release.href} className="flex items-center justify-between gap-4 py-4 font-bold text-stone-900 hover:text-red-800"><span>{release.title}</span><ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
            </div>
          </div>
        </section>

        {promoted ? (
          <section className="pb-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">Lead source trail</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {promoted.sourceLinks.map((link, index) => <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-800 hover:border-red-300">{link.label}<ExternalLink className="size-3.5" aria-hidden="true" /></a>)}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
