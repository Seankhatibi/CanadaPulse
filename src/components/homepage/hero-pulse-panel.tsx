import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { MiniDataVisual } from "@/components/homepage/mini-data-visual";
import type { HomepageFeed } from "@/lib/homepage-feed";

export function HeroPulsePanel({ hero }: { hero: HomepageFeed["hero"] }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.13),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Canada Pulse</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">{hero.dek}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={hero.href}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500"
            >
              Open today&apos;s breakdown
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/weekly-pulse"
              className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-stone-100 transition hover:bg-white/10"
            >
              Canada in 60 seconds
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-red-950/25 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">National Pulse Score</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-mono text-7xl font-black leading-none text-white sm:text-8xl">{hero.score}</span>
                <span className="pb-2 font-mono text-2xl font-black text-stone-500">/100</span>
              </div>
            </div>
            <div className="rounded-md bg-red-500/15 p-3 text-red-200">
              <TrendingDown className="size-7" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-300">{hero.scoreTrend}</p>
          <div className="mt-6 grid gap-4">
            {hero.signals.map((signal) => (
              <Link
                key={signal.id}
                href={signal.href}
                className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{signal.topic}</p>
                    <p className="mt-1 text-base font-black text-white group-hover:text-red-100">
                      {signal.headline}
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-mono text-2xl font-black text-white">{signal.metric}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{signal.metricLabel}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <MiniDataVisual points={signal.visualPoints} tone={signal.tone} maxItems={2} compact />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
