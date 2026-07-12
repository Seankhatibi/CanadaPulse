import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, ExternalLink, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { formatReleaseDate } from "@/lib/release-format";
import type { getProvinceResearchBrief } from "@/lib/province-research";

type ProvinceBrief = NonNullable<Awaited<ReturnType<typeof getProvinceResearchBrief>>>;

export function ProvinceResearchPage({ brief }: { brief: ProvinceBrief }) {
  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8">
          <Link href="/canada" className="inline-flex items-center gap-2 text-sm font-black text-stone-600 hover:text-red-800"><ArrowLeft className="size-4" aria-hidden="true" /> Canada</Link>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.13em]">
            <span className="rounded-md bg-red-700 px-2.5 py-1 text-white">{brief.province.abbr}</span>
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-stone-700">{brief.areaLabel}</span>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">Official evidence only</span>
          </div>
          <h1 className="mt-5 text-4xl font-black text-stone-950 sm:text-6xl">{brief.province.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">The latest national releases with a verified {brief.province.name} value, plus the federal signals that affect the province.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-500">
            <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-red-700" aria-hidden="true" /> {brief.symbol?.land}</span>
            <span>{brief.symbol?.symbol}</span>
          </div>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Verified provincial values</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">What the latest tables say about {brief.province.name}</h2>
          {brief.provincialFacts.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {brief.provincialFacts.map((fact) => (
                <Link key={`${fact.release.id}-${fact.value}`} href={fact.release.href} className="rounded-xl border border-stone-200 bg-white p-5 hover:border-red-300 hover:shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-stone-500">{fact.release.affectedAreas[0] ?? "Economy"}</p>
                  <p className="mt-4 font-mono text-4xl font-black text-stone-950">{fact.value}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{fact.note}</p>
                  <p className="mt-4 text-xs font-bold text-red-700">{fact.release.title}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <p className="font-black">No verified province row is loaded for this topic yet.</p>
              <p className="mt-2 text-sm leading-6">Canada Pulse will not estimate a provincial value from a national headline. Relevant national releases remain available below.</p>
            </div>
          )}
        </section>

        {brief.lead ? (
          <section className="grid gap-5 rounded-2xl bg-stone-950 p-5 text-white sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">Latest national signal</p>
              <h2 className="mt-3 text-3xl font-black">{brief.lead.release.title}</h2>
              <p className="mt-4 text-lg font-bold">{brief.lead.intelligence.verdict}</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">{brief.lead.release.plainEnglishSummary}</p>
              <Link href={brief.lead.release.href} className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-stone-950">Open breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {brief.lead.intelligence.metrics.slice(0, 4).map((metric) => (
                <div key={`${metric.label}-${metric.display}`} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-stone-400">{metric.label}</p>
                  <p className="mt-3 font-mono text-3xl font-black">{metric.display}</p>
                  <p className="mt-2 font-mono text-xs text-red-300">{metric.changeDisplay ?? "Latest value"}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Relevant releases</p>
            <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
              {brief.releases.map((release) => (
                <Link key={release.id} href={release.href} className="flex items-start gap-4 py-4 group">
                  <div className="min-w-0 flex-1"><p className="font-black text-stone-950 group-hover:text-red-800">{release.title}</p><p className="mt-1 text-xs text-stone-500">{release.publisher} · {formatReleaseDate(release.releaseDate)}</p></div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-red-700" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <aside className="rounded-xl border border-stone-200 bg-white p-5">
            <Database className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-stone-950">Evidence rule</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Provincial cards appear only when the official imported table includes a matching province row. National policy effects are shown separately and are never relabelled as province statistics.</p>
            <a href={brief.lead?.release.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">Latest official source <ExternalLink className="size-4" aria-hidden="true" /></a>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
