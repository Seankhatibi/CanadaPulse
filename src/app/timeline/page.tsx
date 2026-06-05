import Link from "next/link";
import { ArrowRight, Clock3, Play } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { timelineReplay } from "@/lib/viral-data";

const series = [
  { key: "housing", label: "Housing stress", color: "bg-red-500" },
  { key: "wages", label: "Wage index", color: "bg-sky-400" },
  { key: "population", label: "Population pressure", color: "bg-amber-300" },
  { key: "debt", label: "Debt load", color: "bg-fuchsia-400" },
  { key: "health", label: "Health pressure", color: "bg-emerald-400" },
] as const;

export default function TimelinePage() {
  return (
    <AppShell>
      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <GlassPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>Timeline Replay</StatusPill>
            <StatusPill>1990 to 2026</StatusPill>
          </div>
          <div className="mt-7">
            <SectionHeader
              eyebrow="Replay Canada"
              title="Watch the pressure build over time."
              body="A timeline view for the social-media story: housing moved faster than wages, population capacity became a national argument, and healthcare pressure became harder to ignore."
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
            <ShareStatButton text="Canada Pulse Timeline Replay shows housing, wages, population, debt, and health pressure from 1990 to 2026." />
            <Link
              href="/weekly-pulse"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/10 px-2.5 text-xs font-semibold text-stone-200 transition hover:bg-white/15"
            >
              Weekly Pulse
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Play className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-white">Pressure index replay</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Source-ready demo values use a 0-100 index so the visual story works before every official
              historical feed is connected.
            </p>
          </div>
          <div className="grid gap-px bg-white/10">
            {timelineReplay.map((point) => (
              <div key={point.year} className="bg-black/45 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 text-red-300" aria-hidden="true" />
                      <p className="font-mono text-2xl font-semibold text-white">{point.year}</p>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{point.note}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {series.map((item) => {
                    const value = point[item.key];

                    return (
                      <div key={item.key} className="grid gap-2 sm:grid-cols-[10rem_1fr_3rem] sm:items-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-stone-500">
                          {item.label}
                        </p>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${value}%` }} />
                        </div>
                        <p className="font-mono text-sm font-semibold text-stone-200 sm:text-right">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
