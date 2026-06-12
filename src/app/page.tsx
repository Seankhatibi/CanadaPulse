import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Flame,
  Gauge,
  Home as HomeIcon,
  House,
  Radio,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import { issues, type Issue } from "@/lib/issue-data";
import { livePressureTrackers } from "@/lib/canada-pulse-data";
import { getWeeklyPulseSummary } from "@/lib/economic-releases";
import { gasWizardFallbackPulse, getGasWizardPulse } from "@/lib/gaswizard";
import { getMultiSourceReleaseHub, type NormalizedRelease } from "@/lib/release-hub";
import { shareCards } from "@/lib/viral-data";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { HomepageCommandPanel } from "@/components/homepage-command-panel";

export const dynamic = "force-dynamic";

type VisualPoint = {
  label: string;
  value: number;
  display: string;
  note: string;
  direction?: "up" | "down" | "neutral";
};

type HomepageStory = {
  topic: string;
  headline: string;
  mainStat: string;
  statLabel: string;
  plainEnglish: string;
  href: string;
  sourceLabel: string;
  sourceDate: string;
  shareText: string;
  tone: string;
  icon: typeof HomeIcon;
  visualBreakdown: VisualPoint[];
  provinceComparison: VisualPoint[];
  status?: string;
};

const topicTones: Record<string, string> = {
  housing: "from-red-600 via-amber-400 to-orange-300",
  prices: "from-orange-500 via-amber-300 to-yellow-200",
  jobs: "from-violet-500 via-sky-400 to-cyan-200",
  population: "from-cyan-400 via-sky-500 to-red-500",
  money: "from-white via-emerald-300 to-green-500",
  rates: "from-amber-300 via-white to-sky-300",
  energy: "from-emerald-400 via-amber-300 to-sky-400",
  youth: "from-fuchsia-500 via-violet-500 to-sky-400",
};

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

function issuePointToVisual(point: Issue["components"][number]): VisualPoint {
  return {
    label: point.label,
    value: point.numeric,
    display: point.value,
    note: point.note,
    direction: point.numeric < 0 ? "down" : "up",
  };
}

function provinceToVisual(point: Issue["provinceValues"][number]): VisualPoint {
  return {
    label: point.abbr,
    value: point.numeric,
    display: point.value,
    note: point.province,
    direction: point.numeric < 0 ? "down" : "up",
  };
}

function storyFromIssue({
  issue,
  topic,
  headline,
  href,
  tone,
  sourceDate,
}: {
  issue: Issue;
  topic: string;
  headline: string;
  href?: string;
  tone: string;
  sourceDate: string;
}): HomepageStory {
  return {
    topic,
    headline,
    mainStat: issue.nationalValue,
    statLabel: issue.nationalLabel,
    plainEnglish: issue.question,
    href: href ?? `/issue/${issue.slug}`,
    sourceLabel: issue.source,
    sourceDate,
    shareText: `${headline} ${issue.nationalValue} ${issue.nationalLabel}. Source: ${issue.source}.`,
    tone,
    icon: issue.icon,
    visualBreakdown: issue.components.slice(0, 5).map(issuePointToVisual),
    provinceComparison: issue.provinceValues.slice(0, 5).map(provinceToVisual),
  };
}

function sourceLine(sourceLabel: string, sourceDate: string, status?: string) {
  return `${sourceLabel} - ${sourceDate}${status ? ` - ${publicStatus(status)}` : ""}`;
}

function SourceFooter({
  sourceLabel,
  sourceDate,
  status,
}: {
  sourceLabel: string;
  sourceDate: string;
  status?: string;
}) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
      {sourceLine(sourceLabel, sourceDate, status)}
    </p>
  );
}

function MiniBarList({ points, tone = "bg-red-500" }: { points: VisualPoint[]; tone?: string }) {
  const max = Math.max(1, ...points.map((point) => Math.abs(point.value)));

  return (
    <div className="grid gap-3">
      {points.map((point) => {
        const width = `${Math.max(10, Math.min(100, (Math.abs(point.value) / max) * 100))}%`;
        const isDown = point.direction === "down";
        const color = isDown ? "bg-red-500" : tone;

        return (
          <div key={`${point.label}-${point.display}`} className="grid gap-1">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs font-semibold text-stone-200">{point.label}</p>
              <p className={`shrink-0 font-mono text-xs font-semibold ${isDown ? "text-red-200" : "text-emerald-200"}`}>
                {point.display}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${color}`} style={{ width }} />
            </div>
            <p className="line-clamp-1 text-[11px] text-stone-500">{point.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function ProvinceTiles({ points }: { points: VisualPoint[] }) {
  const max = Math.max(1, ...points.map((point) => Math.abs(point.value)));

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
      {points.map((point, index) => {
        const intensity = Math.max(0.18, Math.min(0.9, Math.abs(point.value) / max));

        return (
          <div
            key={`${point.label}-${point.note}`}
            className="rounded-md border border-white/10 p-3"
            style={{ background: `rgba(220, 38, 38, ${intensity})` }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs font-semibold text-white">#{index + 1}</p>
              <p className="font-mono text-sm font-semibold text-white">{point.label}</p>
            </div>
            <p className="mt-3 font-mono text-xl font-semibold text-white">{point.display}</p>
            <p className="mt-1 truncate text-[11px] text-red-50/80">{point.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function DataStoryCard({ story, featured = false }: { story: HomepageStory; featured?: boolean }) {
  const Icon = story.icon;

  return (
    <article
      className={`overflow-hidden rounded-lg border border-white/10 bg-black/45 shadow-2xl ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${story.tone}`} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">{story.topic}</p>
            <h2 className={`${featured ? "text-3xl sm:text-5xl" : "text-2xl"} mt-3 font-semibold leading-tight text-white`}>
              {story.headline}
            </h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white/10 text-red-100">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className={`mt-6 grid gap-5 ${featured ? "lg:grid-cols-[0.8fr_1.2fr]" : ""}`}>
          <div>
            <p className={`${featured ? "text-7xl sm:text-8xl" : "text-5xl"} font-mono font-semibold leading-none text-white`}>
              {story.mainStat}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{story.statLabel}</p>
            <p className="mt-4 text-sm font-semibold leading-6 text-stone-200">{story.plainEnglish}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={story.href}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open breakdown
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ShareStatButton text={story.shareText} />
            </div>
          </div>

          <div className="grid gap-4">
            {story.visualBreakdown.length ? (
              <div className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">What is driving it</p>
                  <Sparkles className="size-4 text-red-200" aria-hidden="true" />
                </div>
                <MiniBarList points={story.visualBreakdown} tone="bg-emerald-400" />
              </div>
            ) : null}
            {story.provinceComparison.length ? (
              <div className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Province split</p>
                  <Gauge className="size-4 text-red-200" aria-hidden="true" />
                </div>
                <ProvinceTiles points={story.provinceComparison} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <SourceFooter sourceLabel={story.sourceLabel} sourceDate={story.sourceDate} status={story.status} />
        </div>
      </div>
    </article>
  );
}

function ReleaseLead({ release }: { release: NormalizedRelease }) {
  const points = release.chartPayloads[0]?.points.slice(0, 5).map((point) => ({
    label: point.label,
    value: point.value,
    display: point.display,
    note: point.plainEnglish,
    direction: point.direction,
  }));
  const latestPoint = points?.[0];
  const Icon = release.icon;

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-amber-300/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.55))] shadow-2xl">
      <div className="grid gap-px bg-white/10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-black/50 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>Lead data drop</StatusPill>
            <StatusPill>{release.publisher}</StatusPill>
            <StatusPill>{publicStatus(release.status)}</StatusPill>
          </div>
          <Icon className="mt-7 size-9 text-amber-200" aria-hidden="true" />
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            What changed in Canada today?
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-7 text-stone-200">{release.title}</p>
          <p className="mt-3 font-mono text-xs text-stone-500">
            {release.releaseDate} - {release.referencePeriod}
          </p>
          <HomepageCommandPanel />
        </div>

        <div className="bg-black/35 p-5 sm:p-7">
          <div className="rounded-lg border border-white/10 bg-black/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Why it matters</p>
            <p className="mt-3 text-base leading-7 text-stone-200">{release.plainEnglishSummary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[0.72fr_1.28fr]">
              <div className="rounded-md border border-white/10 bg-black/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Main signal</p>
                <p className="mt-3 font-mono text-5xl font-semibold text-white">{latestPoint?.display ?? release.releaseDate}</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">{latestPoint?.label ?? release.releaseType}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/40 p-4">
                {points?.length ? (
                  <MiniBarList points={points} tone="bg-emerald-400" />
                ) : (
                  <div className="grid gap-3">
                    {release.headlineFacts.slice(0, 4).map((fact) => (
                      <p key={fact} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-6 text-stone-300">
                        {fact}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={release.href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open Canada Pulse breakdown
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ShareStatButton text={release.socialSummary} />
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <SourceFooter sourceLabel={release.publisher} sourceDate={release.releaseDate} status={release.status} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const weeklySummary = getWeeklyPulseSummary();
  const releaseHub = await getMultiSourceReleaseHub();
  const promotedRelease = releaseHub.promotedRelease;
  const issueBySlug = new Map(issues.map((issue) => [issue.slug, issue]));
  const sourceDate = releaseHub.generatedAt.slice(0, 10);
  const gasWizardPulse = await getGasWizardPulse().catch(() => gasWizardFallbackPulse);
  const gasTrackerValue = gasWizardPulse.highest ? `${gasWizardPulse.highest.price.toFixed(1)}c/L` : "Loading";
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

  const foodInflation = issueBySlug.get("food-inflation");
  const rentBurden = issueBySlug.get("rent-burden");
  const populationHousing = issueBySlug.get("population-vs-housing");
  const youthJobs = issueBySlug.get("youth-jobs");
  const taxReceipt = issueBySlug.get("tax-receipt");
  const equalization = issueBySlug.get("equalization-epp");
  const productivity = issueBySlug.get("productivity");
  const ratesRelease = releaseHub.todayQueue.find((release) => release.affectedAreas.includes("rates"));
  const ratesValue = ratesRelease?.chartPayloads[0]?.points[0]?.display ?? "Watching";

  const stories = [
    foodInflation &&
      storyFromIssue({
        issue: foodInflation,
        topic: "Prices",
        headline: "What is still making the grocery bill feel heavier?",
        tone: topicTones.prices,
        sourceDate,
      }),
    rentBurden &&
      storyFromIssue({
        issue: rentBurden,
        topic: "Housing",
        headline: "How much of the paycheque disappears into rent?",
        tone: topicTones.housing,
        sourceDate,
      }),
    populationHousing &&
      storyFromIssue({
        issue: populationHousing,
        topic: "Population",
        headline: "Are Canadians adding people faster than homes?",
        tone: topicTones.population,
        sourceDate,
      }),
    taxReceipt &&
      storyFromIssue({
        issue: taxReceipt,
        topic: "Money",
        headline: "Your $92k salary changes by province.",
        href: "/compare?left=ontario&right=alberta&income=92000",
        tone: topicTones.money,
        sourceDate,
      }),
    youthJobs &&
      storyFromIssue({
        issue: youthJobs,
        topic: "Youth",
        headline: "Can young Canadians still get a foothold?",
        tone: topicTones.youth,
        sourceDate,
      }),
    productivity &&
      storyFromIssue({
        issue: productivity,
        topic: "Economy",
        headline: "Is Canada getting richer per hour worked?",
        tone: "from-emerald-400 via-amber-300 to-red-500",
        sourceDate,
      }),
  ].filter(Boolean) as HomepageStory[];

  const pressureStrip = [
    foodInflation && { label: "Food", value: foodInflation.nationalValue, href: "/issue/food-inflation", tone: "bg-amber-300" },
    rentBurden && { label: "Rent", value: rentBurden.nationalValue, href: "/issue/rent-burden", tone: "bg-red-500" },
    youthJobs && { label: "Youth jobs", value: youthJobs.nationalValue, href: "/issue/youth-jobs", tone: "bg-sky-400" },
    populationHousing && { label: "Pop. growth", value: populationHousing.nationalValue, href: "/issue/population-vs-housing", tone: "bg-cyan-400" },
    taxReceipt && { label: "Tax receipt", value: "$5,437", href: "/compare?left=ontario&right=alberta&income=92000", tone: "bg-emerald-300" },
    { label: "Rates", value: ratesValue, href: ratesRelease?.href ?? "/weekly-pulse", tone: "bg-white" },
    { label: "Gas", value: gasTrackerValue, href: "/energy", tone: "bg-orange-400" },
    { label: "Pulse Score", value: "61/100", href: "/#pulse-score", tone: "bg-red-500" },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string; tone: string }>;

  const housingPoints = releaseHub.housingWatch.chartPayloads[0]?.points.slice(0, 5).map((point) => ({
    label: point.label,
    value: point.value,
    display: point.display,
    note: point.plainEnglish,
    direction: point.direction,
  })) ?? [];

  return (
    <AppShell>
      {promotedRelease ? <ReleaseLead release={promotedRelease} /> : null}

      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-black/45">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                <Flame className="size-4" aria-hidden="true" />
                Canada pressure strip
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                The numbers people notice before they read the report.
              </h2>
            </div>
            <ShareStatButton text="Canada Pulse pressure strip: food, rent, youth jobs, population growth, tax spread and gas in one glance." />
          </div>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {pressureStrip.map((item) => (
            <Link key={item.label} href={item.href} className="group bg-black/45 p-4 transition hover:bg-white/10">
              <div className={`h-1.5 rounded-full ${item.tone}`} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{item.label}</p>
              <p className="mt-2 font-mono text-4xl font-semibold text-white">{item.value}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
                Open
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="pulse-score"
        className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.3),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.38))]"
      >
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="bg-black/45 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Canada Pulse Score</p>
            <div className="mt-5 flex items-end gap-4">
              <p className="font-mono text-7xl font-semibold leading-none text-white sm:text-8xl">61</p>
              <div className="pb-2">
                <p className="font-mono text-2xl font-semibold text-stone-400">/100</p>
                <p className="mt-1 rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                  Declining
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-300">
              The fast national stress read: affordability, housing, healthcare, wages, population pressure,
              debt and youth outlook in one screenshot.
            </p>
            <div className="mt-5">
              <ShareStatButton text="Canada Pulse Score: 61/100 and declining across affordability, housing, debt and youth outlook." />
            </div>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Affordability", "F", "worsening"],
              ["Housing", "D", "strained"],
              ["Youth outlook", "F", "critical"],
              ["Healthcare", "C-", "strained"],
              ["Debt interest", "D", "rising"],
              ["Energy", "A-", "strong"],
            ].map(([label, value, trend]) => (
              <div key={label} className="bg-black/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="font-mono text-2xl font-semibold text-red-200">{value}</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-500">{trend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-2">
        {stories.slice(0, 2).map((story, index) => (
          <DataStoryCard key={story.headline} story={story} featured={index === 0} />
        ))}
      </section>

      <section className="mb-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-300 to-orange-300" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Housing Watch</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">{releaseHub.housingWatch.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">{releaseHub.housingWatch.plainEnglishSummary}</p>
              </div>
              <House className="size-7 shrink-0 text-red-200" aria-hidden="true" />
            </div>
            <div className="mt-6 rounded-md border border-white/10 bg-black/35 p-4">
              <MiniBarList points={housingPoints} tone="bg-amber-300" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={releaseHub.housingWatch.href}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open housing breakdown
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ShareStatButton text={releaseHub.housingWatch.socialSummary} />
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <SourceFooter sourceLabel={releaseHub.housingWatch.publisher} sourceDate={releaseHub.housingWatch.releaseDate} status={releaseHub.housingWatch.status} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Province shock map</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Which provinces feel the newest data first?</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              A fast ranking for where housing, jobs, rates and population signals hit hardest.
            </p>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {releaseHub.provinceImpact.slice(0, 6).map((item, index) => (
              <Link key={item.province} href={releaseHub.housingWatch.href} className="group bg-black/35 p-4 transition hover:bg-white/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    #{index + 1} {item.province}
                  </p>
                  <p className="font-mono text-2xl font-semibold text-red-200">{item.score}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, item.score)}%` }} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{item.label}</p>
                <p className="mt-3 text-xs font-semibold text-red-200">
                  {item.source}
                  <ArrowRight className="ml-1 inline size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </p>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-2">
        {stories.slice(2, 6).map((story) => (
          <DataStoryCard key={story.headline} story={story} />
        ))}
      </section>

      <section className="mb-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-white via-emerald-300 to-red-500" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Money flow</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Where does the public money go?</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Tax receipt, equalization and federal transfers need to be shown as receipts, rankings and flow,
                  not buried as accounting tables.
                </p>
              </div>
              <Banknote className="size-7 shrink-0 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Same salary, different province", value: "$5,437", label: "Ontario vs Alberta modeled tax spread", href: "/compare?left=ontario&right=alberta&income=92000" },
                { title: "Equalization pool", value: equalization?.nationalValue ?? "$27.2B", label: equalization?.nationalLabel ?? "federal transfers", href: "/issue/equalization-epp" },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="group rounded-md border border-white/10 bg-black/35 p-4 transition hover:bg-white/10">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-3 font-mono text-4xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-xs text-stone-500">{item.label}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
                    Open receipt
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Youth future</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Can young Canadians build a life here?</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Youth jobs, rent burden and down-payment years belong in one front-page story.
                </p>
              </div>
              <BriefcaseBusiness className="size-7 shrink-0 text-sky-200" aria-hidden="true" />
            </div>
            <div className="mt-6 grid gap-3">
              {(youthJobs?.components ?? []).slice(0, 4).map((point) => (
                <div key={point.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{point.label}</p>
                    <p className="text-xs text-stone-500">{point.note}</p>
                  </div>
                  <p className="font-mono text-2xl font-semibold text-white">{point.value}</p>
                </div>
              ))}
            </div>
            <Link
              href="/youth"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Open youth future
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>
      </section>

      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-black/45">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                {weeklySummary.publishMode === "friday-weekly-summary" ? "Friday Weekly Pulse" : "Canada in 60 seconds"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{weeklySummary.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">{weeklySummary.generatedFor}</p>
            </div>
            <ShareStatButton text={`${weeklySummary.title}: ${weeklySummary.summary}`} />
          </div>
        </div>
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="bg-black/35 p-5">
            <p className="text-base leading-7 text-stone-200">{weeklySummary.summary}</p>
            <Link
              href="/weekly-pulse"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Open Weekly Pulse
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {releaseHub.todayQueue.slice(0, 4).map((release, index) => (
              <Link key={release.id} href={release.href} className="group bg-black/35 p-4 transition hover:bg-white/10">
                <p className="font-mono text-xs font-semibold text-red-200">0{index + 1}</p>
                <p className="mt-3 line-clamp-2 font-semibold text-white">{release.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{release.plainEnglishSummary}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {release.publisher} - {release.releaseDate}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-black/45">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Shareable stories</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                One number, one debate, one card.
              </h2>
            </div>
            <Share2 className="size-5 text-red-300" aria-hidden="true" />
          </div>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {shareCards.slice(0, 4).map((card) => (
            <Link key={card.id} href={`/share/${card.id}`} className={`group bg-gradient-to-br ${card.tone} p-px transition hover:brightness-110`}>
              <div className="h-full bg-black/75 p-5">
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-4 font-mono text-4xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.13em] text-stone-400">{card.subtitle}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-300">{card.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-100">
                  Share card
                  <Share2 className="size-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Radio className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Source monitor</h2>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {releaseHub.sourceStatuses.slice(0, 6).map((source) => (
              <div key={source.source} className="rounded-md border border-white/10 bg-black/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-white">{source.source}</p>
                  <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-semibold text-stone-300">
                    {publicStatus(source.status)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">
                  {publicSourceNotes[source.source] ?? source.note}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Live pressure trackers</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {homepageTrackers.slice(0, 4).map((tracker) => {
              const Icon = tracker.icon;

              return (
                <Link
                  key={tracker.label}
                  href={tracker.href}
                  className="group flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-3 transition hover:bg-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/10 text-red-200">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{tracker.label}</p>
                      <p className="truncate text-xs text-stone-500">{tracker.source}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-lg font-semibold text-white">{tracker.value}</p>
                    <p className="font-mono text-xs text-red-200">{tracker.change}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
