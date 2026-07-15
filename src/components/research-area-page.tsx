import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Clock3, Database, Minus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import { countStructuredMetrics, hasQualitativeAnalysis } from "@/lib/release-hub";
import type { getResearchAreaBrief } from "@/lib/research-area";

type AreaBrief = Awaited<ReturnType<typeof getResearchAreaBrief>>;

export function ResearchAreaPage({ brief }: { brief: AreaBrief }) {
  const metrics = brief.lead?.intelligence.metrics.slice(0, 6) ?? [];

  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.13em]">
            <span className="rounded-md bg-red-700 px-2.5 py-1 text-white">{brief.eyebrow}</span>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">Official-source feed</span>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight text-stone-950 sm:text-6xl">{brief.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{brief.description}</p>
        </section>

        {brief.lead ? (
          <section className="grid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-300/30 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="bg-stone-950 p-5 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">Latest relevant evidence</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{brief.lead.release.title}</h2>
              <p className="mt-4 text-lg font-bold leading-7 text-white">{brief.lead.intelligence.verdict}</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">{brief.lead.release.plainEnglishSummary}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-stone-400">
                <span>{brief.lead.release.publisher}</span>
                <span>•</span>
                <span>{formatReleaseDate(brief.lead.release.releaseDate)}</span>
                <span>•</span>
                <span>{formatReferencePeriod(brief.lead.release.referencePeriod)}</span>
              </div>
              <Link href={brief.lead.release.href} className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-stone-950 hover:bg-red-50">
                Open full breakdown
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;
                const tone = metric.meaning === "positive" ? "text-emerald-700" : metric.meaning === "negative" ? "text-red-700" : "text-amber-700";
                return (
                  <article key={`${metric.label}-${metric.display}`} className="min-h-40 bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black uppercase leading-4 tracking-[0.08em] text-stone-500">{metric.label}</p>
                      <Icon className={`size-4 shrink-0 ${tone}`} aria-hidden="true" />
                    </div>
                    <p className="mt-5 font-mono text-3xl font-black text-stone-950">{metric.display}</p>
                    <p className={`mt-2 font-mono text-xs font-black ${tone}`}>{metric.changeDisplay ?? "Latest value"}</p>
                    <p className="mt-3 text-xs text-stone-500">{metric.period ?? "Latest official period"}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Evidence stream</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">Recent official releases</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {brief.releases.map((release) => {
              const metricCount = countStructuredMetrics(release);
              const evidenceLabel = metricCount
                ? `${metricCount} values`
                : hasQualitativeAnalysis(release) ? "report analysis" : "summary only";
              return (
                <Link key={release.id} href={release.href} className="group rounded-xl border border-stone-200 bg-white p-5 transition hover:border-red-300 hover:shadow-lg">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-black uppercase tracking-[0.1em] text-stone-700">{release.publisher}</span>
                    <span className="text-stone-400">{formatReleaseDate(release.releaseDate)}</span>
                    <span className={`ml-auto rounded-md px-2 py-1 font-black ${release.status === "live" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                      {release.status === "live" ? evidenceLabel : "summary only"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-black leading-snug text-stone-950 group-hover:text-red-800">{release.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{release.plainEnglishSummary}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-700">View evidence <ArrowRight className="size-4" aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        {brief.lead?.intelligence.provinceRank.length ? (
          <section className="rounded-2xl bg-stone-950 p-5 text-white sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">Provincial evidence</p>
            <h2 className="mt-2 text-3xl font-black">Where the latest release hits differently</h2>
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {brief.lead.intelligence.provinceRank.slice(0, 10).map((province) => (
                <div key={province.province} className="flex items-center gap-3 border-t border-white/10 py-3">
                  <span className="font-mono text-xs text-red-300">{String(province.comparableRank).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 font-bold">{province.province}</span>
                  <span className="font-mono font-black">{province.value}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Keep exploring</p>
            <h2 className="mt-2 text-3xl font-black text-stone-950">Questions behind the headline</h2>
            <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
              {brief.questions.map(([label, href]) => (
                <Link key={label} href={href} className="flex items-center justify-between gap-4 py-4 text-lg font-black text-stone-950 hover:text-red-800">
                  {label}
                  <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <aside className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-stone-950">Coverage and trust</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">Only releases with loaded official values receive metric cards. Detected releases without parsed tables remain clearly marked as summary only.</p>
            <div className="mt-4 space-y-3">
              {brief.sourceStatuses.map((source) => (
                <div key={source.source} className="flex items-start gap-3 border-t border-stone-100 pt-3">
                  {source.status === "live" ? <CheckCircle2 className="mt-0.5 size-4 text-emerald-700" aria-hidden="true" /> : <Clock3 className="mt-0.5 size-4 text-amber-700" aria-hidden="true" />}
                  <div><p className="text-sm font-black text-stone-950">{source.source}</p><p className="mt-1 text-xs leading-5 text-stone-500">{source.note}</p></div>
                </div>
              ))}
            </div>
            <Link href="/data-status" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">See all source freshness <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
