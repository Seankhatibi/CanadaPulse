import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { DirectionBarChart, PressureMeter } from "@/components/homepage/data-visuals";
import type { HomepageFeed } from "@/lib/homepage-feed";

export function HeroPulsePanel({ hero }: { hero: HomepageFeed["hero"] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[#fffaf2] shadow-2xl shadow-stone-300/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(215,25,32,0.18),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(14,165,233,0.16),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-700">Canada Pulse Reality Check</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.92] text-stone-950 sm:text-6xl lg:text-7xl">
            Can young Canadians still build a life here?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
            Rent, wages, taxes, jobs, food, rates, and housing supply in one visual scoreboard.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={hero.href}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500"
            >
              Check your province
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/tax-dollar"
              className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-stone-50"
            >
              Where does my money go?
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white/86 p-5 shadow-xl shadow-stone-300/40 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Canada Stress Index</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-mono text-7xl font-black leading-none text-stone-950 sm:text-8xl">74</span>
                <span className="pb-2 font-mono text-2xl font-black text-stone-500">/100</span>
              </div>
            </div>
            <div className="rounded-md bg-red-100 p-3 text-red-700">
              <TrendingDown className="size-7" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            High pressure: housing, youth affordability, rates, food, and taxes are dragging the signal.
          </p>
          <div className="mt-5">
            <PressureMeter value={74} label="National stress" detail="A blended public-facing pressure score for affordability, housing, food, jobs, rates and taxes." />
          </div>
          <div className="mt-6 grid gap-4">
            {hero.signals.map((signal) => (
              <Link
                key={signal.id}
                href={signal.href}
                className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-lg"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{signal.topic}</p>
                    <p className="mt-1 text-base font-black text-stone-950 group-hover:text-red-700">
                      {signal.headline}
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-mono text-2xl font-black text-stone-950">{signal.metric}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{signal.metricLabel}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <DirectionBarChart points={signal.visualPoints} maxItems={2} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
