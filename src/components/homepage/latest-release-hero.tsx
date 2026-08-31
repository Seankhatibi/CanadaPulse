import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, Minus, Radio } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import type { NormalizedRelease } from "@/lib/release-hub";
import { buildReleaseStory } from "@/lib/release-story";

function tone(meaning: "positive" | "negative" | "mixed") {
  if (meaning === "positive") return { text: "text-emerald-800", bar: "bg-emerald-600", soft: "bg-emerald-100" };
  if (meaning === "negative") return { text: "text-red-800", bar: "bg-red-600", soft: "bg-red-100" };
  return { text: "text-amber-900", bar: "bg-amber-500", soft: "bg-amber-100" };
}

export function LatestReleaseHero({ release }: { release: NormalizedRelease }) {
  const story = buildReleaseStory(release);
  const max = Math.max(...story.points.map((point) => Math.abs(point.value)), 1);

  return (
    <section className="-mx-3 overflow-hidden border-y border-red-200 bg-[#fff8ef] text-stone-950 sm:-mx-6" aria-labelledby="latest-data-drop">
      <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
        <div className="px-4 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.13em]">
            <span className="inline-flex items-center gap-2 bg-red-700 px-2.5 py-1.5 text-white">
              <Radio className="size-3.5" aria-hidden="true" /> Latest data drop
            </span>
            <span className="bg-white px-2.5 py-1.5 text-stone-700">{release.publisher}</span>
            <span className="text-stone-500">{formatReleaseDate(release.releaseDate)}</span>
          </div>

          <p className="mt-7 max-w-2xl text-xs font-black uppercase tracking-[0.16em] text-red-800">What changed in Canada</p>
          <h1 id="latest-data-drop" className="mt-2 max-w-4xl text-4xl font-black leading-[1.04] sm:text-5xl lg:text-6xl">{story.headline}</h1>
          <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-stone-700 sm:text-lg">{story.summary}</p>

          <div className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-3 border-y border-stone-300 py-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em] text-stone-500">{story.mainLabel}</p>
              <p className="mt-1 font-mono text-5xl font-black sm:text-6xl">{story.mainMetric}</p>
            </div>
            <div className="pb-1">
              <p className="text-xs font-black uppercase tracking-[0.13em] text-stone-500">Movement</p>
              <p className={`mt-2 font-mono text-xl font-black ${tone(story.mainMeaning).text}`}>{story.mainChange ?? "Latest official value"}</p>
            </div>
            <div className="pb-1">
              <p className="text-xs font-black uppercase tracking-[0.13em] text-stone-500">Reference period</p>
              <p className="mt-2 text-sm font-black">{formatReferencePeriod(release.referencePeriod)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={release.href} className="inline-flex h-11 items-center justify-center gap-2 bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-red-800">
              See every number <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <ShareStatButton text={release.socialSummary} variant="light" />
            <a href={release.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 border border-stone-300 bg-white px-4 text-sm font-black text-stone-700 hover:border-red-400 hover:text-red-800">
              Official release <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="bg-[#102c36] px-4 py-7 text-white sm:px-8 sm:py-10 lg:px-9 lg:py-12" aria-label="Release movement chart">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">What moved underneath</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">The release, crunched</h2>
          <div className="mt-7 grid gap-5">
            {story.points.slice(0, 5).map((point, index) => {
              const Direction = point.direction === "up" ? ArrowUp : point.direction === "down" ? ArrowDown : Minus;
              const colours = tone(point.meaning);
              const width = Math.max(8, Math.min(100, Math.abs(point.value) / max * 100));
              return (
                <div key={`${point.label}-${point.display}-${index}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center ${colours.soft} ${colours.text}`}><Direction className="size-3.5" aria-hidden="true" /></span>
                      <p className="text-sm font-black leading-5 text-white">{point.label}</p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-black text-white">{point.display}</p>
                  </div>
                  <div className="mt-2 ml-8 h-2 overflow-hidden bg-white/10"><div className={`h-full ${colours.bar}`} style={{ width: `${width}%` }} /></div>
                </div>
              );
            })}
          </div>

          <div className="mt-9 border-t border-white/15 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Canada Pulse read</p>
            <div className="mt-3 grid gap-3">
              {story.read.map((item, index) => <p key={item} className="flex gap-3 text-sm leading-6 text-slate-200"><span className="shrink-0 whitespace-nowrap font-mono text-xs font-black text-red-300">0{index + 1}</span>{item}</p>)}
            </div>
          </div>
          <p className="mt-7 text-[11px] leading-5 text-slate-400">Official values only. Colours describe direction and household pressure; they do not imply causation.</p>
        </aside>
      </div>
    </section>
  );
}
