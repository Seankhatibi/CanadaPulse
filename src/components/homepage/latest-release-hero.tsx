import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, Minus } from "lucide-react";
import type { NormalizedRelease } from "@/lib/release-hub";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";

export function LatestReleaseHero({ release }: { release: NormalizedRelease }) {
  const intelligence = buildReleaseIntelligence(release);
  const metrics = intelligence.metrics.slice(0, 4);
  const showSummary = release.plainEnglishSummary.trim().toLowerCase() !== intelligence.verdict.trim().toLowerCase();

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/40">
      <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
            <span className="rounded-md bg-red-700 px-2.5 py-1 text-white">Latest major release</span>
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-stone-700">{release.publisher}</span>
            <span className="text-stone-500">{formatReleaseDate(release.releaseDate)}</span>
          </div>
          <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-stone-950 sm:text-6xl">{release.title}</h2>
          <p className="mt-5 max-w-3xl text-xl font-bold leading-8 text-stone-800">{intelligence.verdict}</p>
          {showSummary ? <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">{release.plainEnglishSummary}</p> : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;
              const tone = metric.meaning === "positive" ? "text-emerald-700" : metric.meaning === "negative" ? "text-red-700" : "text-amber-700";
              return (
                <div key={`${metric.label}-${metric.display}`} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex min-h-8 items-start justify-between gap-2">
                    <p className="text-[11px] font-black uppercase leading-4 tracking-[0.08em] text-stone-500">{metric.label}</p>
                    <Icon className={`size-4 ${tone}`} aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-mono text-3xl font-black text-stone-950">{metric.display}</p>
                  <p className={`mt-2 font-mono text-xs font-black ${tone}`}>{metric.changeDisplay ?? "Latest value"}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Link href={release.href} className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-red-800">
              Open full research brief
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={release.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-3 text-sm font-black text-stone-700 hover:border-red-300">
              Official source
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="bg-stone-950 p-5 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Research read</p>
          <h2 className="mt-3 text-2xl font-black">What matters underneath the headline</h2>
          <div className="mt-6 space-y-3">
            {(intelligence.takeaways.length ? intelligence.takeaways : release.headlineFacts).slice(0, 4).map((takeaway, index) => (
              <div key={takeaway} className="flex gap-3 border-t border-white/10 pt-3">
                <span className="font-mono text-xs font-black text-red-300">0{index + 1}</span>
                <p className="text-sm leading-6 text-stone-300">{takeaway}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-black uppercase tracking-[0.13em] text-stone-400">Reference period</p>
            <p className="mt-2 text-sm font-bold text-white">{formatReferencePeriod(release.referencePeriod)}</p>
            <p className="mt-2 text-xs leading-5 text-stone-400">{intelligence.evidenceLevel}. Values stay attached to the official source trail.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
