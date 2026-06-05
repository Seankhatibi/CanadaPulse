import Link from "next/link";
import { ArrowRight, ExternalLink, Radio, Sparkles, Zap } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { getWeeklyPulseSummary } from "@/lib/economic-releases";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";
import { shareCards } from "@/lib/viral-data";

export const dynamic = "force-dynamic";

function statusCopy(status: string) {
  if (status === "live") return "Live";
  if (status === "summary_only") return "Tracked";
  if (status === "source_linked") return "Watching";
  return "Watching";
}

export default async function WeeklyPulsePage() {
  const weeklySummary = getWeeklyPulseSummary();
  const releaseHub = await getMultiSourceReleaseHub();
  const promoted = releaseHub.promotedRelease ?? releaseHub.todayQueue[0];
  const hotChart = promoted?.chartPayloads[0];
  const maxImpact = Math.max(...(hotChart?.points.map((item) => Math.abs(item.value)) ?? [1]), 1);
  const liveSources = releaseHub.sourceStatuses.filter((source) => source.status === "live").length;
  const monitoredSources = releaseHub.sourceStatuses.length;
  const housingItems = releaseHub.todayQueue.filter((release) => release.affectedAreas.includes("housing")).slice(0, 4);
  const bankItems = releaseHub.todayQueue
    .filter((release) => release.publisher === "Bank of Canada")
    .slice(0, 4);

  return (
    <AppShell>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.34),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.42))]">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-black/45 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid size-10 place-items-center rounded-md bg-red-600 text-white">
                <Radio className="size-5" aria-hidden="true" />
              </span>
              <StatusPill>{weeklySummary.publishMode === "friday-weekly-summary" ? "Friday Weekly Pulse" : "Daily release watch"}</StatusPill>
              <StatusPill>{releaseHub.generatedAt.slice(0, 10)}</StatusPill>
            </div>
            <h1 className="mt-7 max-w-xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              Canada&apos;s newest data, translated.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300">
              Weekly Pulse turns the newest Canadian data into a plain-English briefing: what changed, why it
              matters, and which chart to open next.
            </p>
            <div className="mt-6 grid gap-3 min-[480px]:grid-cols-3">
              {[
                ["Sources", monitoredSources.toString(), `${liveSources} live now`],
                ["Queue", releaseHub.todayQueue.length.toString(), "ranked by impact"],
                ["Housing", housingItems.length.toString(), "CMHC priority"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/35 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-stone-500">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/35 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Current promoted release</p>
            {promoted ? (
              <>
                <h2 className="mt-3 text-3xl font-semibold text-white">{promoted.title}</h2>
                <p className="mt-2 font-mono text-xs text-stone-500">
                  {promoted.publisher} · {promoted.releaseDate} · {statusCopy(promoted.status)}
                </p>
                <p className="mt-4 text-base leading-7 text-stone-200">{promoted.plainEnglishSummary}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={promoted.href}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                  >
                    Open visual breakdown
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <ShareStatButton text={promoted.socialSummary} />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-stone-400">
                The release hub is waiting for the next official source refresh.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-white">One-glance visual read</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
            This chart is generated from the promoted release&apos;s normalized facts. Green means a positive or rising
            component, red means a declining or pressure component, amber means watch.
          </p>
          <div className="mt-5 grid gap-3">
            {hotChart?.points.length ? (
              hotChart.points.slice(0, 8).map((point) => {
                const isDown = point.direction === "down";
                const isNeutral = point.direction === "neutral";
                const width = `${Math.max(12, (Math.abs(point.value) / maxImpact) * 100)}%`;

                return (
                  <div key={point.label} className="grid gap-2 rounded-md border border-white/10 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{point.label}</p>
                      <p className={`font-mono text-sm font-semibold ${isNeutral ? "text-amber-200" : isDown ? "text-red-200" : "text-emerald-200"}`}>
                        {point.display}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${isNeutral ? "bg-amber-300" : isDown ? "bg-red-500" : "bg-emerald-400"}`}
                        style={{ width }}
                      />
                    </div>
                    <p className="text-xs leading-5 text-stone-500">{point.plainEnglish}</p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-white/10 bg-black/35 p-4 text-sm text-stone-400">
                This release is being monitored. A visual breakdown will appear once enough comparable facts are available.
              </div>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-amber-200" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">Watching now</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Canada Pulse keeps the source visible so readers know whether a release is live, tracked or being watched
            for the next update.
          </p>
          <div className="mt-5 grid gap-3">
            {releaseHub.sourceStatuses.map((source) => (
              <div key={source.source} className="rounded-md border border-white/10 bg-black/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{source.source}</p>
                  <span
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      source.status === "live"
                        ? "bg-emerald-400/15 text-emerald-100"
                        : source.status === "summary_only"
                          ? "bg-amber-400/15 text-amber-100"
                          : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {statusCopy(source.status)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  {source.source === "Statistics Canada"
                    ? "Jobs, prices, GDP, productivity, trade and population releases"
                    : source.source === "CMHC"
                      ? "Housing construction, supply and rental-market signals"
                      : source.source === "Bank of Canada"
                        ? "Rates, bond yields, currency and household credit pressure"
                        : "Canadian public-data releases"}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Housing Watch from CMHC</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Housing remains the emotional core of the product. CMHC releases stay visible even when another source has
            the top national headline.
          </p>
          <div className="mt-5 grid gap-3">
            {housingItems.map((release) => (
              <Link
                key={release.id}
                href={release.href}
                className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-200">{release.publisher}</p>
                <p className="mt-2 font-semibold leading-6 text-white">{release.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{release.plainEnglishSummary}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
                  Open housing breakdown
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Bank of Canada reports</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Rate data and Bank reports are translated into mortgage pressure, inflation pressure, growth/jobs, and
            financial stability signals.
          </p>
          <div className="mt-5 grid gap-3">
            {bankItems.map((release) => (
              <Link
                key={release.id}
                href={release.href}
                className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-amber-300/50 hover:bg-white/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">{release.releaseType}</p>
                <p className="mt-2 font-semibold leading-6 text-white">{release.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{release.plainEnglishSummary}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-100">
                  Open Bank of Canada breakdown
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Plain-English explanation layer</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Canada Pulse separates facts from interpretation: first the official numbers are checked, then the
            summary explains what changed in everyday language.
          </p>
          <div className="mt-4 grid gap-2">
            {[
              "Confirm the release date, source and reference period",
              "Identify what moved up, down or stayed flat",
              "Turn the facts into charts and province comparisons",
              "Explain the result in plain English",
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border border-white/10 bg-black/35 p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-red-600 font-mono text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm text-stone-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Share cards ready for launch</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Share cards turn complicated data into one clean screenshot: a number, a claim and a next click.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {shareCards.slice(0, 4).map((card) => (
              <Link
                key={card.id}
                href={`/share/${card.id}`}
                className={`group overflow-hidden rounded-md border border-white/10 bg-gradient-to-br ${card.tone} p-px transition hover:border-white/40`}
              >
                <div className="h-full rounded-[7px] bg-black/72 p-4">
                  <p className="text-sm font-semibold text-white">{card.title}</p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-white">{card.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">{card.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </section>

      {promoted ? (
        <section className="mt-5">
          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Official source trail</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {promoted.sourceLinks.map((link, index) => (
                <a
                  key={`${link.label}-${link.url}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/15"
                >
                  {link.label}
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                </a>
              ))}
            </div>
          </GlassPanel>
        </section>
      ) : null}
    </AppShell>
  );
}
