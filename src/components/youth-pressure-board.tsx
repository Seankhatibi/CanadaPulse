import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, BriefcaseBusiness, CircleDollarSign, Home, Landmark, Minus } from "lucide-react";
import { buildReleaseIntelligence, type ResearchMetric } from "@/lib/release-intelligence";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import type { NormalizedRelease } from "@/lib/release-hub";

type WatchDefinition = {
  id: "jobs" | "rent" | "prices" | "rates";
  label: string;
  question: string;
  icon: typeof Home;
  accent: string;
  findRelease: (release: NormalizedRelease) => boolean;
  findMetric: (metric: ResearchMetric) => boolean;
};

const definitions: WatchDefinition[] = [
  {
    id: "jobs",
    label: "Jobs",
    question: "Is the job market opening or closing?",
    icon: BriefcaseBusiness,
    accent: "bg-cyan-500",
    findRelease: (release) => /labour force survey/i.test(release.title),
    findMetric: (metric) => /unemployment rate/i.test(metric.label),
  },
  {
    id: "rent",
    label: "Rent",
    question: "What does a place cost before life begins?",
    icon: Home,
    accent: "bg-amber-400",
    findRelease: (release) => release.releaseType === "cmhc-rental-market",
    findMetric: (metric) => /average two-bedroom rent|two-bedroom rent/i.test(metric.label),
  },
  {
    id: "prices",
    label: "Prices",
    question: "Are everyday costs accelerating?",
    icon: CircleDollarSign,
    accent: "bg-red-500",
    findRelease: (release) => release.releaseType === "statcan-cpi-watch",
    findMetric: (metric) => /all-items/i.test(metric.label),
  },
  {
    id: "rates",
    label: "Rates",
    question: "How expensive is borrowed money?",
    icon: Landmark,
    accent: "bg-emerald-500",
    findRelease: (release) => release.id === "bank-of-canada-valet-rate-watch" || (release.source.startsWith("bank-of-canada") && release.releaseType === "valet-rate-observation"),
    findMetric: (metric) => /policy rate|overnight rate/i.test(metric.label),
  },
];

function buildWatchItems(releases: NormalizedRelease[]) {
  return definitions.flatMap((definition) => {
    const release = releases.find((candidate) => candidate.status === "live" && definition.findRelease(candidate));
    if (!release) return [];
    const intelligence = buildReleaseIntelligence(release);
    const metric = intelligence.metrics.find(definition.findMetric) ?? intelligence.metrics[0];
    if (!metric) return [];
    return [{ definition, release, metric }];
  });
}

function ChangeVisual({ metric, accent }: { metric: ResearchMetric; accent: string }) {
  const current = Math.abs(metric.value);
  const previous = metric.previous === null || metric.previous === undefined ? null : Math.abs(metric.previous);
  const max = Math.max(current, previous ?? 0, 1);
  const Icon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;
  const tone = metric.meaning === "positive" ? "text-emerald-700" : metric.meaning === "negative" ? "text-red-700" : "text-amber-700";

  if (previous === null) {
    return (
      <div className="mt-5 flex items-center gap-3 border-y border-stone-200 py-4">
        <span className={`grid size-9 place-items-center rounded-md ${accent} text-white`}><Icon className="size-4" aria-hidden="true" /></span>
        <div><p className={`font-mono text-sm font-black ${tone}`}>{metric.changeDisplay ?? "Latest official value"}</p><p className="mt-1 text-xs text-stone-500">No comparable previous value loaded</p></div>
      </div>
    );
  }

  return (
    <div className="mt-5 grid h-28 grid-cols-2 items-end gap-3 border-b border-stone-200 pb-3" aria-label={`${metric.label} previous and current values`}>
      <div className="flex h-full flex-col justify-end">
        <div className="min-h-2 rounded-t bg-stone-300" style={{ height: `${Math.max(10, previous / max * 72)}%` }} />
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-stone-500"><span>Before</span><span className="font-mono">{metric.previousDisplay ?? metric.previous}</span></div>
      </div>
      <div className="flex h-full flex-col justify-end">
        <div className={`min-h-2 rounded-t ${accent}`} style={{ height: `${Math.max(10, current / max * 72)}%` }} />
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-black text-stone-800"><span>Now</span><span className="font-mono">{metric.display}</span></div>
      </div>
    </div>
  );
}

export function YouthPressureBoard({ releases }: { releases: NormalizedRelease[] }) {
  const items = buildWatchItems(releases);

  return (
    <section className="-mx-3 bg-[#f8f4ec] px-3 py-8 text-stone-950 sm:-mx-6 sm:px-6 sm:py-12" aria-labelledby="youth-pressure-heading">
      <div className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Your future, without a mystery score</p>
        <h2 id="youth-pressure-heading" className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-5xl">Four numbers shaping your next move</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">Each signal stands on its own official release. Canada Pulse shows the direction and source instead of hiding unlike measures inside a made-up grade.</p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map(({ definition, release, metric }) => {
          const Icon = definition.icon;
          const DirectionIcon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;
          const tone = metric.meaning === "positive" ? "text-emerald-700" : metric.meaning === "negative" ? "text-red-700" : "text-amber-700";
          return (
            <article key={definition.id} className="overflow-hidden border border-stone-200 bg-white shadow-sm">
              <div className={`h-1.5 ${definition.accent}`} />
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-stone-500"><Icon className="size-4" aria-hidden="true" />{definition.label}</span>
                  <span className={`inline-flex items-center gap-1 font-mono text-xs font-black ${tone}`}><DirectionIcon className="size-3.5" aria-hidden="true" />{metric.changeDisplay ?? "Current"}</span>
                </div>
                <h3 className="mt-4 text-2xl font-black leading-tight text-stone-950">{definition.question}</h3>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                  <p className="font-mono text-5xl font-black text-stone-950">{metric.display}</p>
                  <p className="max-w-48 text-right text-xs leading-5 text-stone-500">{metric.label}</p>
                </div>
                <ChangeVisual metric={metric} accent={definition.accent} />
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600">{metric.plainEnglish || release.plainEnglishSummary}</p>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 pt-4">
                  <p className="text-[11px] font-bold leading-5 text-stone-500">{release.publisher}<br />{formatReferencePeriod(metric.period ?? release.referencePeriod)} · released {formatReleaseDate(release.releaseDate)}</p>
                  <Link href={release.href} className="inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">See the breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-7 grid gap-4 border-y border-stone-300 py-6 sm:grid-cols-3">
        <div><p className="font-black text-stone-950">No causal shortcuts</p><p className="mt-2 text-sm leading-6 text-stone-600">The app shows what changed. It does not claim one release proves why.</p></div>
        <div><p className="font-black text-stone-950">Same-table comparisons</p><p className="mt-2 text-sm leading-6 text-stone-600">Province rankings only use rows from the same source period and unit.</p></div>
        <div><p className="font-black text-stone-950">Missing stays missing</p><p className="mt-2 text-sm leading-6 text-stone-600">Canada Pulse does not fill official gaps with a modeled youth score.</p></div>
      </div>
    </section>
  );
}
