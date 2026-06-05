import Link from "next/link";
import { Activity, ArrowRight, CalendarClock, ExternalLink, Sparkles } from "lucide-react";
import { GlassPanel, StatusPill } from "@/components/app-shell";
import { getStatusClass, isCanadaReleaseToday, latestMajorEconomicRelease } from "@/lib/economic-releases";

export function EconomicReleaseHero() {
  const release = latestMajorEconomicRelease;
  const releaseLabel = isCanadaReleaseToday(release.releaseDate) ? "Major release today" : "Major GDP release";
  const maxImpact = Math.max(...release.chartPoints.map((item) => Math.abs(item.value)));

  return (
    <GlassPanel className="mb-5 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-white to-sky-500" />
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          <StatusPill>{releaseLabel}</StatusPill>
          <StatusPill>{release.source}</StatusPill>
          <StatusPill>{release.releaseDate}</StatusPill>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-md bg-red-600 text-white">
                <Activity className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                  GDP shock board
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                  Canada&apos;s economy stalled in Q1.
                </h1>
              </div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-stone-300">{release.headline}</p>
            <div className="mt-5 rounded-md border border-red-300/20 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                Plain English read
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{release.readerTakeaway}</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">{release.plainEnglishSummary}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {release.metrics.map((metric) => (
              <div key={metric.label} className={`rounded-md border p-4 ${getStatusClass(metric.status)}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">{metric.label}</p>
                <p className="mt-2 font-mono text-4xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-xs leading-5 opacity-85">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-black/35">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                Release impact bars
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">What grew vs. what shrank?</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-emerald-300/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-100">
                Growing
              </span>
              <span className="rounded-md border border-red-300/20 bg-red-500/10 px-2.5 py-1 text-red-100">
                Shrinking
              </span>
              <span className="rounded-md border border-amber-300/20 bg-amber-500/10 px-2.5 py-1 text-amber-100">
                Watch
              </span>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div
              role="img"
              aria-label="Bar chart showing growing GDP components to the right and declining components to the left"
              className="relative overflow-hidden rounded-md border border-white/10 bg-[radial-gradient(circle_at_24%_20%,rgba(239,68,68,0.18),transparent_28%),radial-gradient(circle_at_76%_20%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4"
            >
              <div className="pointer-events-none absolute bottom-4 top-4 left-1/2 w-px bg-white/25" />
              <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className="text-right text-red-200">Declining</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-white">0</span>
                <span className="text-emerald-200">Growing</span>
              </div>

              <div className="grid gap-3">
                {release.chartPoints.map((item) => {
                  const width = `${Math.max(44, (Math.abs(item.value) / maxImpact) * 100)}%`;
                  const isDeclining = item.value < 0;

                  return (
                    <div
                      key={item.label}
                      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2"
                    >
                      <div className="min-w-0">
                        {isDeclining ? (
                          <div
                            className="ml-auto flex min-h-12 max-w-full items-center justify-end rounded-l-2xl bg-gradient-to-l from-red-400 to-red-700 px-3 py-2 text-right shadow-[0_0_24px_rgba(248,113,113,0.22)] transition group-hover:brightness-125"
                            style={{ width }}
                          >
                            <span className="min-w-0 text-[11px] font-semibold leading-tight text-white sm:text-xs">
                              {item.label}
                            </span>
                          </div>
                        ) : (
                          <p className="hidden text-right text-[11px] leading-tight text-stone-500 sm:block">
                            {item.plainEnglish}
                          </p>
                        )}
                      </div>

                      <div className="relative z-10 rounded-md border border-white/10 bg-black px-2 py-1 text-center font-mono text-xs font-semibold text-white">
                        {item.display}
                      </div>

                      <div className="min-w-0">
                        {isDeclining ? (
                          <p className="hidden text-[11px] leading-tight text-stone-500 sm:block">{item.plainEnglish}</p>
                        ) : (
                          <div
                            className="flex min-h-12 max-w-full items-center rounded-r-2xl bg-gradient-to-r from-emerald-400 to-teal-700 px-3 py-2 shadow-[0_0_24px_rgba(52,211,153,0.2)] transition group-hover:brightness-125"
                            style={{ width }}
                          >
                            <span className="min-w-0 text-[11px] font-semibold leading-tight text-white sm:text-xs">
                              {item.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-md border border-amber-300/20 bg-amber-500/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-amber-100">Watch signal</p>
                  <p className="font-mono text-sm font-semibold text-amber-50">GDP 0.0% | April advance +0.4%</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-amber-50/75">
                  The quarter stalled, but the preliminary April estimate hints at a rebound. The next monthly GDP drop
                  decides whether this was a pause or a deeper slowdown.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-md border border-emerald-300/15 bg-emerald-500/10 p-4 lg:col-span-2">
                <p className="text-sm font-semibold text-emerald-100">What people should notice</p>
                <p className="mt-2 text-xs leading-5 text-emerald-50/75">{release.readerTakeaway}</p>
              </div>
              <div className="rounded-md border border-amber-300/15 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">Next thing to watch</p>
                <p className="mt-2 text-xs leading-5 text-amber-50/75">{release.nextRelease}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.62fr]">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <h2 className="text-lg font-semibold text-white">Fast analysis</h2>
            <div className="mt-3 grid gap-2">
              {release.analysis.map((item) => (
                <p key={item} className="text-sm leading-6 text-stone-300">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Release monitor</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Canada Pulse checks official release feeds daily. When a major economic release lands, this top module
              becomes the first thing Canadians see.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/api/economic-releases"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-stone-950"
              >
                Release API
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/weekly-pulse"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white"
              >
                Weekly Pulse
                <Sparkles className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={release.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white"
              >
                Source
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
