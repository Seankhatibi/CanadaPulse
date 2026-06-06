import Link from "next/link";
import { ArrowRight, Flame, Gauge, House, Landmark, Radio, Share2, Sparkles, Users } from "lucide-react";
import { issues } from "@/lib/issue-data";
import { livePressureTrackers } from "@/lib/canada-pulse-data";
import { getWeeklyPulseSummary } from "@/lib/economic-releases";
import { gasWizardFallbackPulse, getGasWizardPulse } from "@/lib/gaswizard";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";
import { shareCards } from "@/lib/viral-data";
import {
  AppShell,
  GlassPanel,
  ProvinceMiniMap,
  SectionHeader,
  StatusPill,
} from "@/components/app-shell";
import { IssueCard } from "@/components/issues/issue-card";
import { ShareStatButton } from "@/components/share-stat-button";
import { GlossaryStrip } from "@/components/term-tip";
import { HomepageCommandPanel } from "@/components/homepage-command-panel";

export const dynamic = "force-dynamic";

const publicSourceNotes: Record<string, string> = {
  "Statistics Canada": "Jobs, prices, GDP, productivity, trade and population releases",
  CMHC: "Housing construction, supply and rental-market signals",
  "Bank of Canada": "Rates, bond yields, currency and household credit pressure",
  "IRCC / Open Government": "Immigration, temporary resident and newcomer data",
  "CER / NRCan": "Energy production, electricity, resources and cost pressure",
  PBO: "Budget watchdog reports and fiscal-risk signals",
};

function publicStatus(status: string) {
  if (status === "live") return "Live";
  if (status === "summary_only") return "Tracked";
  if (status === "source_linked") return "Watching";
  return "Watching";
}

export default async function Home() {
  const featuredIssues = issues.slice(0, 7);
  const weeklySummary = getWeeklyPulseSummary();
  const releaseHub = await getMultiSourceReleaseHub();
  const promotedRelease = releaseHub.promotedRelease;
  const PromotedIcon = promotedRelease?.icon ?? Radio;
  const HousingIcon = releaseHub.housingWatch.icon;
  const dataDropGroups = [
    {
      label: "Housing",
      tone: "from-red-500 to-amber-300",
      href: releaseHub.housingWatch.href,
      releases: releaseHub.todayQueue.filter((release) => release.affectedAreas.includes("housing")),
      promise: "Starts, supply, mortgage pressure and rent-sensitive signals.",
    },
    {
      label: "Rates & inflation",
      tone: "from-amber-300 to-emerald-300",
      href: "/pulse-release/bank-of-canada/bank-of-canada-rate-watch",
      releases: releaseHub.todayQueue.filter((release) =>
        release.affectedAreas.some((area) => area === "rates" || area === "inflation"),
      ),
      promise: "Policy rate, yields, currency, inflation language and household pressure.",
    },
    {
      label: "Population",
      tone: "from-sky-400 to-cyan-200",
      href: "/population",
      releases: releaseHub.todayQueue.filter((release) =>
        release.affectedAreas.some((area) => area === "population" || area === "immigration"),
      ),
      promise: "Immigration, temporary residents, students, labour and housing capacity.",
    },
    {
      label: "Government money",
      tone: "from-emerald-300 to-white",
      href: "/government",
      releases: releaseHub.todayQueue.filter((release) => release.affectedAreas.includes("fiscal")),
      promise: "Debt pressure, budget watchdog reports, public accounts and tax-dollar signals.",
    },
    {
      label: "Energy",
      tone: "from-orange-400 to-sky-400",
      href: "/energy",
      releases: releaseHub.todayQueue.filter((release) => release.affectedAreas.includes("energy")),
      promise: "Oil, gas, electricity, grid mix, resource exports and cost pressure.",
    },
    {
      label: "Economy",
      tone: "from-white to-red-400",
      href: "/weekly-pulse",
      releases: releaseHub.todayQueue.filter((release) =>
        release.affectedAreas.some((area) => area === "labour" || area === "trade"),
      ),
      promise: "GDP, productivity, jobs, wages, trade and business outlook.",
    },
  ];
  const gasWizardPulse = await getGasWizardPulse().catch(() => gasWizardFallbackPulse);
  const gasTrackerValue = gasWizardPulse.highest ? `${gasWizardPulse.highest.price.toFixed(1)}¢/L` : "Loading";
  const gasTrackerChange = gasWizardPulse.highest?.city ?? "GasWizard";
  const homepageTrackers = livePressureTrackers.map((tracker) =>
    tracker.label === "Gas and energy"
      ? {
          ...tracker,
          value: gasTrackerValue,
          change: gasTrackerChange,
          question: gasWizardPulse.lowest?.currentAverage
            ? `Highest tracked gas vs ${gasWizardPulse.lowest.city} at $${gasWizardPulse.lowest.currentAverage.toFixed(3)}/L.`
            : "Which Canadian city is getting hit hardest at the pump?",
          cadence: "GasWizard hourly/daily",
          source: "GasWizard.ca",
          href: "/energy",
          external: false,
        }
      : tracker,
  );
  const routedHomepageTrackers = homepageTrackers.map((tracker) =>
    tracker.label === "Healthcare access"
      ? {
          ...tracker,
          href: "/health",
        }
      : tracker,
  );
  const issueBySlug = new Map(issues.map((issue) => [issue.slug, issue]));
  const hotFrontCards = [
    {
      eyebrow: "Grocery pressure",
      issue: issueBySlug.get("food-inflation"),
      href: "/issue/food-inflation",
      share: "Food inflation is still the grocery-cart pressure point Canadians notice first.",
    },
    {
      eyebrow: "Rent squeeze",
      issue: issueBySlug.get("rent-burden"),
      href: "/issue/rent-burden",
      share: "Rent burden turns housing into a monthly paycheque problem.",
    },
    {
      eyebrow: "Population capacity",
      issue: issueBySlug.get("population-vs-housing"),
      href: "/issue/population-vs-housing",
      share: "Population growth vs housing supply is the chart Canadians keep arguing about.",
    },
    {
      eyebrow: "Youth future",
      issue: issueBySlug.get("youth-jobs"),
      href: "/issue/youth-jobs",
      share: "Youth unemployment, rent and down-payment years belong in the same future conversation.",
    },
    {
      eyebrow: "Tax receipt",
      title: "Same salary, different province",
      value: "$5,437",
      label: "Ontario vs Alberta tax spread",
      href: "/compare?left=ontario&right=alberta&income=92000",
      share: "Same salary, different province: the tax receipt gap is big enough to feel personal.",
    },
    {
      eyebrow: "National stress",
      title: "Canada Pulse Score",
      value: "61/100",
      label: "declining stress signal",
      href: "/#pulse-score",
      share: "Canada Pulse Score: 61/100 and declining across affordability, housing, debt and youth outlook.",
    },
  ];

  return (
    <AppShell>
      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.5))] shadow-2xl">
        <div className="grid gap-px bg-white/10 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-black/45 p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Live public data monitor</StatusPill>
              <StatusPill>{releaseHub.generatedAt.slice(0, 10)}</StatusPill>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              Today&apos;s Canada Data Drops
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Canada Pulse watches Canadian public data and turns new releases into the numbers people actually
              feel: jobs, prices, housing, rates, population, energy and public money.
            </p>
            <HomepageCommandPanel />
            <div className="mt-6 grid gap-2 min-[480px]:grid-cols-2">
              {releaseHub.sourceStatuses.slice(0, 6).map((source) => (
                <div key={source.source} className="rounded-md border border-white/10 bg-black/35 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-white">{source.source}</p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        source.status === "live"
                          ? "bg-emerald-400/15 text-emerald-100"
                          : source.status === "summary_only"
                            ? "bg-amber-400/15 text-amber-100"
                            : "bg-white/10 text-stone-300"
                      }`}
                    >
                      {publicStatus(source.status)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-stone-500">
                    {publicSourceNotes[source.source] ?? "Canadian public-data releases"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/35 p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dataDropGroups.map((group) => {
                const topRelease = group.releases[0];
                const latestPoint = topRelease?.chartPayloads[0]?.points[0];

                return (
                  <Link
                    key={group.label}
                    href={topRelease?.href ?? group.href}
                    className="group min-w-0 rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-300/50 hover:bg-white/10"
                  >
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${group.tone}`} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {group.releases.length} update{group.releases.length === 1 ? "" : "s"}
                        </p>
                        <h2 className="mt-1 truncate text-xl font-semibold text-white">{group.label}</h2>
                      </div>
                      <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 font-mono text-xs font-semibold text-stone-300">
                        {topRelease ? publicStatus(topRelease.status) : "Watching"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{group.promise}</p>
                    {topRelease ? (
                      <div className="mt-4 rounded-md border border-white/10 bg-black/35 p-3">
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{topRelease.title}</p>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <p className="font-mono text-lg font-semibold text-red-100">
                            {latestPoint?.display ?? topRelease.releaseDate}
                          </p>
                          <p className="text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                            {topRelease.publisher}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-md border border-white/10 bg-black/35 p-3 text-sm text-stone-500">
                        No major update yet.
                      </div>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
                      Open breakdown
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-black/45">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                <Flame className="size-4" aria-hidden="true" />
                Front-page pulse
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                The numbers Canadians understand in one glance.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
                These are the fastest paths into Canada Pulse: affordability, housing capacity, youth future,
                tax differences and the national stress score.
              </p>
            </div>
            <ShareStatButton text="Canada Pulse front-page pulse: food, rent, population vs housing, youth jobs, tax spread and national stress in one glance." />
          </div>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
          {hotFrontCards.map((card) => {
            const title = card.issue?.title ?? card.title ?? "";
            const value = card.issue?.nationalValue ?? card.value ?? "";
            const label = card.issue?.nationalLabel ?? card.label ?? "";
            const question = card.issue?.question ?? card.share;

            return (
              <article
                key={card.eyebrow}
                className="min-w-0 bg-black/45 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-white">{title}</h3>
                  </div>
                  <ShareStatButton text={`${title}: ${value}. ${card.share}`} />
                </div>
                <p className="mt-5 font-mono text-4xl font-semibold text-white">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.13em] text-stone-500">{label}</p>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-stone-200">{question}</p>
                <Link href={card.href} className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
                  Open breakdown
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {promotedRelease ? (
        <section className="mb-5 overflow-hidden rounded-lg border border-amber-300/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.42))]">
          <div className="grid gap-px bg-white/10 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="bg-black/45 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <StatusPill>Latest major release</StatusPill>
                <StatusPill>{promotedRelease.publisher}</StatusPill>
                <StatusPill>{publicStatus(promotedRelease.status)}</StatusPill>
              </div>
              <PromotedIcon className="mt-5 size-8 text-amber-200" aria-hidden="true" />
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                {promotedRelease.title}
              </h1>
              <p className="mt-3 font-mono text-xs text-stone-500">
                {promotedRelease.releaseDate} · {promotedRelease.referencePeriod}
              </p>
            </div>
            <div className="bg-black/35 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                What it means
              </p>
              <p className="mt-3 text-base leading-7 text-stone-200">{promotedRelease.plainEnglishSummary}</p>
              {promotedRelease.chartPayloads[0]?.points.length ? (
                <div className="mt-5 rounded-md border border-white/10 bg-black/35 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                      {promotedRelease.chartPayloads[0].title}
                    </p>
                    <p className="font-mono text-xs text-stone-500">
                      {promotedRelease.affectedAreas.join(" · ")}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {promotedRelease.chartPayloads[0].points.slice(0, 5).map((point) => {
                      const width = `${Math.max(12, Math.min(100, Math.abs(point.value) * 24))}%`;
                      const isDown = point.direction === "down";
                      const isNeutral = point.direction === "neutral";

                      return (
                        <div key={point.label} className="grid gap-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-stone-200">{point.label}</p>
                            <p className={`font-mono text-xs font-semibold ${isNeutral ? "text-amber-200" : isDown ? "text-red-200" : "text-emerald-200"}`}>
                              {point.display}
                            </p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${isNeutral ? "bg-amber-300" : isDown ? "bg-red-500" : "bg-emerald-400"}`}
                              style={{ width }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={promotedRelease.href}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                >
                  Open full breakdown
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href={promotedRelease.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Official source
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <ShareStatButton text={promotedRelease.socialSummary} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {releaseHub.todayQueue.length ? (
        <section className="mb-5">
          <GlassPanel className="overflow-hidden">
            <div className="border-b border-white/10 bg-black/45 p-5 sm:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>Today&apos;s official queue</StatusPill>
                    <StatusPill>{releaseHub.generatedAt.slice(0, 10)}</StatusPill>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    The releases Canadians should not miss.
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
                    The app ranks new public data by household impact, then sends people to a Canada Pulse
                    breakdown before the official source.
                  </p>
                </div>
                <Link
                  href="/weekly-pulse"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  See all releases
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid gap-px bg-white/10 md:grid-cols-3">
              {releaseHub.todayQueue.slice(0, 3).map((release, index) => {
                const isPromoted = release.id === promotedRelease?.id;
                const latestPoint = release.chartPayloads[0]?.points[0];

                return (
                  <Link
                    key={release.id}
                    href={release.href}
                    className="group min-w-0 bg-black/35 p-4 transition hover:bg-white/10 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold ${
                          isPromoted ? "bg-amber-300 text-stone-950" : "bg-white/10 text-stone-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                        {publicStatus(release.status)}
                      </span>
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                      {release.publisher}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-white">
                      {release.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">
                      {release.plainEnglishSummary}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-lg font-semibold text-amber-100">
                          {latestPoint?.display ?? release.releaseDate}
                        </p>
                        <p className="mt-1 truncate text-xs text-stone-500">{release.referencePeriod}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-amber-100">
                        Breakdown
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassPanel>
        </section>
      ) : null}

      <section className="mb-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 via-amber-300 to-sky-400" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill>Housing Watch</StatusPill>
                  <StatusPill>Supply pressure</StatusPill>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{releaseHub.housingWatch.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">{releaseHub.housingWatch.plainEnglishSummary}</p>
              </div>
              <HousingIcon className="size-6 shrink-0 text-red-200" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {releaseHub.housingWatch.chartPayloads[0]?.points.slice(0, 4).map((point) => (
                <div key={point.label} className="rounded-md border border-white/10 bg-black/35 px-3 py-3">
                  <p className="text-sm font-semibold text-white">{point.label}</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-red-200">{point.display}</p>
                </div>
              ))}
            </div>
            <Link
              href={releaseHub.housingWatch.href}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Open housing breakdown
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>
      </section>

      {releaseHub.provinceImpact.length ? (
        <section className="mb-5">
          <GlassPanel className="overflow-hidden">
            <div className="grid gap-px bg-white/10 lg:grid-cols-[0.62fr_1.38fr]">
              <div className="bg-black/45 p-5">
                <div className="flex flex-wrap gap-2">
                  <StatusPill>Province impact map</StatusPill>
                  <StatusPill>{releaseHub.housingWatch.publisher}</StatusPill>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Which provinces feel the newest data first?
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-400">
                  National releases hit provinces differently. This view highlights where the newest housing,
                  jobs, rates and population signals are likely to matter first.
                </p>
              </div>
              <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
                {releaseHub.provinceImpact.map((item) => (
                  <Link
                    key={item.province}
                    href={releaseHub.housingWatch.href}
                    className="group bg-black/35 p-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.province}</p>
                      <p className="font-mono text-xl font-semibold text-red-200">{item.score}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, item.score)}%` }} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-400">{item.label}</p>
                    <p className="mt-3 text-xs font-semibold text-red-200">
                      {item.source}
                      <ArrowRight className="ml-1 inline size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </GlassPanel>
        </section>
      ) : null}

      <section className="mb-5">
        <GlassPanel className="overflow-hidden">
          <div className="grid gap-px bg-white/10 lg:grid-cols-[0.74fr_1.26fr]">
            <div className="bg-black/45 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                {weeklySummary.publishMode === "friday-weekly-summary" ? "Friday Weekly Pulse" : "Today’s release watch"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{weeklySummary.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">{weeklySummary.generatedFor}</p>
            </div>
            <div className="bg-black/35 p-5">
              <p className="text-sm leading-6 text-stone-300">{weeklySummary.summary}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/weekly-pulse"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                >
                  Open Weekly Pulse
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <ShareStatButton text={`${weeklySummary.title}: ${weeklySummary.summary}`} />
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="mb-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Start here</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Three clicks to understand the country.</h2>
            </div>
            <ShareStatButton text="Canada Pulse starts with the pressure point, compares provinces, then breaks down what is driving the number." />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Pick the stress",
                body: "Food, rent, taxes, population pressure, gas, healthcare, or youth jobs.",
                href: "/issue/food-inflation",
              },
              {
                step: "2",
                title: "Compare provinces",
                body: "See who feels it most and where the same salary has a different life.",
                href: "/compare",
              },
              {
                step: "3",
                title: "Open the receipt",
                body: "Break the headline into components, sources, and plain-English meaning.",
                href: "/tax-dollar",
              },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/10"
              >
                <span className="grid size-9 place-items-center rounded-md bg-red-600 font-mono text-sm font-semibold text-white">
                  {item.step}
                </span>
                <p className="mt-4 font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                  Start
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-red-500 to-sky-400" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Stat of the day
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">$5,437 tax spread</h2>
              </div>
              <ShareStatButton text="Stat of the day: Ontario vs Alberta shows a modeled $5,437 tax spread on a $92,000 income." />
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              On a modeled $92,000 income, the Ontario-Alberta tax receipt gap is large enough to make province
              comparison feel personal, not abstract.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/compare"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open Province Battle
                <Sparkles className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/tax-dollar?province=alberta&income=92000"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Open tax receipt
                <Landmark className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.33),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.36))] shadow-2xl backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border-b border-white/10 bg-black/45 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              Canada&apos;s economic nervous system
            </p>
            <div className="mt-6 flex items-end gap-4">
              <p className="font-mono text-7xl font-semibold leading-none text-white sm:text-8xl">61</p>
              <div className="pb-2">
                <p className="font-mono text-2xl font-semibold text-stone-400">/100</p>
                <p className="mt-1 rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                  Declining
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-stone-300">
              A simple national stress score combining affordability, housing, taxes, population pressure,
              healthcare access, wages, debt, and youth outlook.
            </p>
            <div className="mt-5">
              <ShareStatButton text="Canada Pulse Score: 61/100 and declining across affordability, housing, healthcare, debt, and youth outlook." />
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Affordability", "F", "worsening"],
                ["Healthcare", "C-", "strained"],
                ["Wages", "C", "flat"],
                ["Migration pressure", "High", "rising"],
                ["Debt interest", "D", "rising"],
                ["Youth outlook", "F", "critical"],
              ].map(([label, value, trend]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="font-mono text-xl font-semibold text-red-200">{value}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-500">{trend}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">Glossary for normal people</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Clear definitions appear beside the numbers, so people can understand the point without hunting
            through policy documents.
          </p>
          <div className="mt-4">
            <GlossaryStrip />
          </div>
        </GlassPanel>
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">Built to share</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["13", "regions"],
              ["7", "hot issues"],
              ["1", "share flow"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/35 p-3">
                <p className="font-mono text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs text-stone-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-400">
            Built for Reddit threads, newsroom screenshots, creator clips, and province-vs-province debates.
          </p>
        </GlassPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-600 via-white to-red-600" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Start with the issue</StatusPill>
              <StatusPill>Then compare provinces</StatusPill>
              <StatusPill>Then see the breakdown</StatusPill>
            </div>

            <div className="mt-8">
              <SectionHeader
                eyebrow="Canada Pulse"
                title="Pick the pressure point. See who feels it most."
                body="Start with the issue people feel first: food inflation, rent burden, population pressure, youth jobs, productivity or taxes. Then open the province comparison and component breakdown."
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {featuredIssues.slice(0, 4).map((issue) => (
                <Link
                  key={issue.slug}
                  href={`/issue/${issue.slug}`}
                  className="rounded-md border border-white/10 bg-black/35 p-4 shadow-sm transition hover:border-red-400/50 hover:bg-white/10"
                >
                  <p className="text-xs font-medium text-stone-400">{issue.title}</p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-white">{issue.nationalValue}</p>
                  <p className="mt-2 text-xs text-stone-500">{issue.nationalLabel}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/issue/food-inflation"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Open food inflation
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/housing#survive"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-200"
              >
                Can I survive here?
                <House className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/tax-dollar"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
              >
                Tax receipt
                <Landmark className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                Today&apos;s concern board
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Start with what people feel.
              </h2>
            </div>
            <Gauge className="size-5 text-red-300" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            {featuredIssues.slice(0, 4).map((issue) => {
              const Icon = issue.icon;
              return (
                <Link
                  key={issue.slug}
                  href={`/issue/${issue.slug}`}
                  className="flex flex-col gap-3 rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-red-400/50 hover:bg-white/10 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-red-600 text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{issue.title}</p>
                      <p className="text-xs text-stone-500">{issue.nationalLabel}</p>
                    </div>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white min-[420px]:text-right sm:text-2xl">{issue.nationalValue}</p>
                </Link>
              );
            })}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5">
        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                  Live pressure trackers
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  The numbers Canadians check before arguing online.
                </h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">
                <Radio className="size-4" aria-hidden="true" />
                Live and monitored
              </div>
              <ShareStatButton text="Canada Pulse live pressure trackers cover food inflation, rent burden, population pressure, youth jobs, mortgage stress, tax receipt, equalization, gas, and healthcare access." />
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-stone-400">
              These are the front-page trackers with viral potential: they connect directly to affordability,
              youth anxiety, immigration capacity, taxes, energy bills, and healthcare access.
            </p>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
            {routedHomepageTrackers.map((tracker) => {
              const Icon = tracker.icon;

              return (
                <Link
                  key={tracker.label}
                  href={tracker.href}
                  target={"external" in tracker && tracker.external ? "_blank" : undefined}
                  rel={"external" in tracker && tracker.external ? "noreferrer" : undefined}
                  className="group min-w-0 bg-black/45 p-4 transition hover:bg-white/10"
                >
                  <div className={`h-1.5 rounded-full bg-gradient-to-r ${tracker.tone}`} />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white/10 text-red-200">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-semibold text-stone-300">
                      {tracker.cadence}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {tracker.label}
                  </p>
                  <div className="mt-2 flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
                    <p className="font-mono text-3xl font-semibold text-white">{tracker.value}</p>
                    <p className="font-mono text-sm font-semibold text-red-200">{tracker.change}</p>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">{tracker.question}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-500">
                    <span>{tracker.source}</span>
                    <span className="inline-flex items-center gap-1 text-red-200">
                      Open
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                Built for the screenshot
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                The share loop is question, ranking, receipt.
              </h2>
            </div>
            <Share2 className="size-5 text-red-300" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Same income, different province",
                body: "Tax receipt now compares every province and territory from one salary.",
                href: "/tax-dollar",
              },
              {
                title: "Who feels population pressure most?",
                body: "Population flows open into housing, jobs, and healthcare capacity.",
                href: "/population",
              },
              {
                title: "Can I survive here?",
                body: "Rent, taxes, groceries, childcare, and down payment years in one screen.",
                href: "/housing#survive",
              },
              {
                title: "Which province is carrying what?",
                body: "Equalization, productivity, rent burden, and food inflation become rankings.",
                href: "/issue/equalization-epp",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/10"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                  Open view
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-600 via-white to-sky-500" />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Canada in 60 seconds</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {featuredIssues.slice(0, 5).map((issue) => (
                <Link
                  key={issue.slug}
                  href={`/issue/${issue.slug}`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-red-400/50 hover:bg-white/10"
                >
                  <p className="text-xs text-stone-500">{issue.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-white">
                    {issue.question}
                  </p>
                  <p className="mt-2 font-mono text-xl font-semibold text-red-200">{issue.nationalValue}</p>
                </Link>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5">
        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                  Shareable stories
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  One number, one debate, one shareable card.
                </h2>
              </div>
              <Link
                href="/weekly-pulse"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open Weekly Pulse
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-stone-400">
              Weekly briefs, myth-vs-reality checks, timeline replay and screenshot-sized cards turn official
              data into something people can actually talk about.
            </p>
          </div>
          <div className="grid gap-px bg-white/10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { title: "Canada in 60 seconds", href: "/weekly-pulse", body: "Fast weekly read on the numbers people care about." },
                { title: "Myth vs Reality", href: "/myth-vs-reality", body: "Hot claims reframed as inspectable charts." },
                { title: "Timeline Replay", href: "/timeline", body: "Watch housing, wages, population, debt, and health pressure change." },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group bg-black/45 p-4 transition hover:bg-white/10">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                    Open
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {shareCards.slice(0, 4).map((card) => (
                <Link
                  key={card.id}
                  href={`/share/${card.id}`}
                  className={`group bg-gradient-to-br ${card.tone} p-px transition hover:brightness-110`}
                >
                  <div className="h-full bg-black/72 p-4">
                    <p className="text-sm font-semibold text-white">{card.title}</p>
                    <p className="mt-3 font-mono text-3xl font-semibold text-white">{card.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.13em] text-stone-400">{card.subtitle}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-100">
                      Share card
                      <Share2 className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              What Canadians actually click
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              National headline first. Province split second.
            </h2>
          </div>
          <StatusPill>Shareable issue cards</StatusPill>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredIssues.map((issue, index) => (
            <IssueCard key={issue.slug} issue={issue} featured={index === 0} />
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">How to read Canada Pulse</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              "Start with a national concern people recognize instantly.",
              "Show the province comparison in one glance.",
              "Break down the components driving the headline.",
              "Check the official source and latest update date.",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-black/30 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-red-600 font-mono text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-stone-300">{item}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold text-white">Province pulse board</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Every province has its own pulse, symbols and pressure points.
            </p>
          </div>
          <div className="p-4">
            <ProvinceMiniMap />
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
