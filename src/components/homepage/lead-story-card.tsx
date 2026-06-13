import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DirectionBarChart, ProvinceRankChart, SplitImpactChart } from "@/components/homepage/data-visuals";
import { ShareStatButton } from "@/components/share-stat-button";
import type { HomepageFeedItem } from "@/lib/homepage-feed";

function trustLabel(status: HomepageFeedItem["trustStatus"]) {
  if (status === "live") return "live source data";
  if (status === "source-linked") return "source-linked";
  return "source import pending";
}

export function LeadStoryCard({ story }: { story: HomepageFeedItem }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Today&apos;s Big Data Story</p>
          <h2 className="mt-2 text-2xl font-black text-stone-950 sm:text-4xl">The visual people should see first</h2>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/50">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-400 p-6 text-white sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-100/80">{story.topic}</p>
            <h3 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">{story.headline}</h3>
            <div className="mt-8">
              <p className="font-mono text-6xl font-black leading-none text-white sm:text-7xl">{story.metric}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-red-100/75">{story.metricLabel}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="max-w-3xl text-lg leading-8 text-stone-700">{story.dek}</p>
            <div className="mt-7 grid gap-5">
              <SplitImpactChart points={story.visualPoints} />
              <DirectionBarChart points={story.visualPoints} maxItems={5} />
            </div>
            {story.provincePoints.length ? (
              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {story.provincePoints.slice(0, 3).map((province) => (
                  <div key={province.label} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{province.label}</p>
                    <p className="mt-1 font-mono text-xl font-black text-stone-950">{province.display}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-stone-500">{province.note}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {story.provincePoints.length ? (
              <div className="mt-4">
                <ProvinceRankChart points={story.provincePoints} maxItems={4} />
              </div>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-stone-500">
                {story.source} | {story.period} | {trustLabel(story.trustStatus)}
              </p>
              <div className="flex gap-2">
                <ShareStatButton text={story.shareText} />
                <Link
                  href={story.href}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-stone-950 px-2.5 text-xs font-black text-white transition hover:bg-red-700"
                >
                  Breakdown
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
