import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Database, ExternalLink, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProvinceResearchControls } from "@/components/province-research-controls";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import type { getProvinceResearchBrief } from "@/lib/province-research";

type ProvinceBrief = NonNullable<Awaited<ReturnType<typeof getProvinceResearchBrief>>>;

export function ProvinceResearchPage({ brief }: { brief: ProvinceBrief }) {
  return (
    <AppShell variant="light">
      <div className="space-y-10">
        <section>
          <Link href="/canada" className="inline-flex items-center gap-2 text-sm font-black text-stone-600 hover:text-red-800">
            <ArrowLeft className="size-4" aria-hidden="true" /> Canada overview
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.13em]">
            <span className="rounded-md bg-red-700 px-2.5 py-1 text-white">{brief.province.abbr}</span>
            <span className="rounded-md bg-stone-200 px-2.5 py-1 text-stone-800">{brief.areaLabel}</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">
              <CheckCircle2 className="size-3.5" aria-hidden="true" /> Verified official rows
            </span>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight text-stone-950 sm:text-6xl">{brief.province.name} data briefing</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
                The latest official tables that report a verified {brief.province.name} value, with national context kept clearly separate.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-stone-600 lg:justify-end">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-red-700" aria-hidden="true" /> {brief.symbol?.land}</span>
              <span>{brief.symbol?.symbol}</span>
            </div>
          </div>
          <div className="mt-7">
            <ProvinceResearchControls province={brief.province.slug} area={brief.area} />
          </div>
        </section>

        <section aria-labelledby="province-signals-title">
          <div className="flex flex-col gap-4 border-b border-stone-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Provincial evidence</p>
              <h2 id="province-signals-title" className="mt-2 text-3xl font-black text-stone-950">What the latest tables show</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
              <div><p className="font-mono text-2xl font-black text-stone-950">{brief.provincialFacts.length}</p><p className="text-xs text-stone-500">verified signals</p></div>
              <div><p className="font-mono text-2xl font-black text-stone-950">{brief.liveSources.length}</p><p className="text-xs text-stone-500">official publishers</p></div>
            </div>
          </div>

          {brief.provincialFacts.length ? (
            <div className="divide-y divide-stone-300">
              {brief.provincialFacts.map((fact) => (
                <article key={`${fact.release.id}-${fact.value}`} className="grid gap-6 py-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(21rem,1.18fr)] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-stone-500">
                      <span className="uppercase tracking-[0.1em] text-red-700">{fact.release.affectedAreas[0] ?? "Economy"}</span>
                      <span>{fact.release.publisher}</span>
                      <span>{formatReferencePeriod(fact.release.referencePeriod)}</span>
                    </div>
                    <p className="mt-4 font-mono text-4xl font-black text-stone-950 sm:text-5xl">{fact.value}</p>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">{fact.note}</p>
                    <p className="mt-4 text-sm font-black text-stone-950">
                      Rank {fact.rank} of {fact.peerCount} reported jurisdictions
                      {" "}<span className="font-normal text-stone-500">by this table&apos;s measure, not an overall score</span>
                    </p>
                    <Link href={fact.release.href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">
                      Open full {fact.release.title} breakdown <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="border-l-2 border-stone-200 pl-4 sm:pl-6" aria-label={`Selected peers from ${fact.release.title}`}>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">Selected peer values</p>
                    <div className="mt-4 space-y-3">
                      {fact.peerRows.map((peer) => {
                        const selected = peer.province === brief.province.name;
                        return (
                          <div key={peer.province}>
                            <div className="mb-1.5 flex items-end justify-between gap-3 text-xs sm:text-sm">
                              <span className={selected ? "font-black text-red-800" : "font-bold text-stone-700"}>{peer.province}</span>
                              <span className={`shrink-0 font-mono font-black ${selected ? "text-red-800" : "text-stone-950"}`}>{peer.value}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                              <div className={`h-full rounded-full ${selected ? "bg-red-700" : "bg-stone-500"}`} style={{ width: `${peer.width}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 border-l-4 border-amber-500 bg-amber-50 p-5 text-amber-950">
              <p className="font-black">No verified province row is loaded for this topic yet.</p>
              <p className="mt-2 text-sm leading-6">Canada Pulse will not estimate a provincial value from a national headline. Relevant national releases remain available below.</p>
            </div>
          )}
        </section>

        {brief.lead ? (
          <section className="overflow-hidden bg-stone-950 text-white lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-5 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">National context</p>
              <h2 className="mt-3 text-3xl font-black leading-tight">{brief.lead.release.title}</h2>
              <p className="mt-4 text-lg font-bold">{brief.lead.intelligence.verdict}</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">{brief.lead.release.plainEnglishSummary}</p>
              <p className="mt-5 text-xs text-stone-400">{brief.lead.release.publisher} · {formatReleaseDate(brief.lead.release.releaseDate)} · {formatReferencePeriod(brief.lead.release.referencePeriod)}</p>
              <Link href={brief.lead.release.href} className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-stone-950 hover:bg-red-50">
                Open national breakdown <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {brief.lead.intelligence.metrics.slice(0, 4).map((metric) => (
                <div key={`${metric.label}-${metric.display}`} className="min-h-36 bg-white/5 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-stone-400">{metric.label}</p>
                  <p className="mt-3 font-mono text-3xl font-black">{metric.display}</p>
                  <p className="mt-2 font-mono text-xs text-red-300">{metric.changeDisplay ?? "Latest value"}</p>
                  <p className="mt-3 text-xs text-stone-400">{metric.period ?? brief.lead?.release.referencePeriod}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-7 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Release trail</p>
            <h2 className="mt-2 text-3xl font-black text-stone-950">Relevant official evidence</h2>
            <div className="mt-4 divide-y divide-stone-300 border-y border-stone-300">
              {brief.releases.map((release) => (
                <Link key={release.id} href={release.href} className="group flex items-start gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-black leading-6 text-stone-950 group-hover:text-red-800">{release.title}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{release.publisher} · {formatReleaseDate(release.releaseDate)} · {formatReferencePeriod(release.referencePeriod)}</p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-red-700" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <aside className="self-start border-t-4 border-red-700 bg-white p-5 shadow-sm">
            <Database className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-stone-950">How to read this page</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">A provincial number appears only when the imported official table contains a matching row. National policy and market signals stay in the national context section.</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">Rankings compare one release and one unit. A high rank can be good, bad or neutral depending on the indicator.</p>
            {brief.lead?.release.sourceUrl ? (
              <a href={brief.lead.release.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">
                Latest official source <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
