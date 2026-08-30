import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, BadgeDollarSign, BriefcaseBusiness, ChartNoAxesCombined, CircleGauge, Minus, ReceiptText } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { EconomySection, NationalEconomyData } from "@/lib/national-economy-data";
import type { ResearchMetric } from "@/lib/release-intelligence";

const icons = {
  growth: ChartNoAxesCombined,
  jobs: BriefcaseBusiness,
  prices: ReceiptText,
  spending: BadgeDollarSign,
  rates: CircleGauge,
} satisfies Record<EconomySection["id"], typeof ChartNoAxesCombined>;

function metricColour(metric: ResearchMetric) {
  if (metric.meaning === "positive") return "text-emerald-700";
  if (metric.meaning === "negative") return "text-red-700";
  return "text-cyan-800";
}

function Movement({ metric }: { metric: ResearchMetric }) {
  const Icon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-black ${metricColour(metric)}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {metric.changeDisplay ?? (metric.direction === "neutral" ? "No change" : "Latest")}
    </span>
  );
}

function SourceLine({ section }: { section: EconomySection }) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-stone-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] font-bold text-stone-500">{section.release.publisher} | {section.release.referencePeriod} | released {section.release.releaseDate}</p>
      <Link href={section.release.href} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-stone-950 px-3 text-xs font-black text-white hover:bg-stone-800">
        Full breakdown <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function GrowthBand({ section }: { section: EconomySection }) {
  const supporting = section.metrics.filter((metric) => metric !== section.lead).slice(0, 5);
  const maximum = Math.max(...supporting.map((metric) => Math.abs(metric.change ?? metric.value)), 1);
  return (
    <section className="bg-[#f7f2ea] px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12" aria-labelledby="economy-heading">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-700"><ChartNoAxesCombined className="size-4" aria-hidden="true" /> Canada&apos;s economy now</div>
            <h1 id="economy-heading" className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">The numbers behind work, prices and growth.</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">A current, official read on whether Canada is growing, whether jobs are opening up, and what a paycheque has to fight through.</p>
          </div>
          <div className="border-y border-stone-300 py-6 lg:border-l lg:border-y-0 lg:py-2 lg:pl-10">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-stone-500">Latest real GDP move</p>
            <div className="mt-3 flex flex-wrap items-end gap-4"><p className={`font-mono text-7xl font-black sm:text-8xl ${metricColour(section.lead)}`}>{section.lead.display}</p><div className="pb-2"><Movement metric={section.lead} /></div></div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{section.lead.plainEnglish}</p>
          </div>
        </div>

        {supporting.length ? (
          <div className="mt-10 border-y border-stone-300 py-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-2xl font-black">What moved underneath GDP?</h2><p className="text-xs font-bold text-stone-500">Official income-account levels and changes</p></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {supporting.map((metric) => {
                const width = Math.max(5, (Math.abs(metric.change ?? metric.value) / maximum) * 100);
                return <div key={`${metric.label}-${metric.display}`}><div className="flex flex-wrap items-baseline justify-between gap-3"><p className="text-sm font-black">{metric.label}</p><div className="flex items-baseline gap-3"><span className="font-mono text-xl font-black">{metric.display}</span><Movement metric={metric} /></div></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full ${metric.meaning === "positive" ? "bg-emerald-600" : metric.meaning === "negative" ? "bg-red-600" : "bg-cyan-700"}`} style={{ width: `${width}%` }} /></div></div>;
              })}
            </div>
          </div>
        ) : null}
        <SourceLine section={section} />
      </div>
    </section>
  );
}

function SignalBand({ section, index }: { section: EconomySection; index: number }) {
  const Icon = icons[section.id];
  const metrics = section.metrics.slice(0, 5);
  const background = index % 2 === 0 ? "bg-[#dff5f2]" : "bg-white";
  return (
    <section className={`${background} px-4 py-11 text-stone-950 sm:px-8 sm:py-14 lg:px-12`} aria-labelledby={`${section.id}-heading`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-700"><Icon className="size-4" aria-hidden="true" />{section.eyebrow}</div>
            <h2 id={`${section.id}-heading`} className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{section.title}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">{section.question}</p>
            <div className="mt-6 border-l-4 border-red-600 pl-4"><p className={`font-mono text-5xl font-black ${metricColour(section.lead)}`}>{section.lead.display}</p><p className="mt-1 text-sm font-black text-stone-700">{section.lead.label}</p><div className="mt-2"><Movement metric={section.lead} /></div></div>
          </div>
          <div className="border-y border-stone-300">
            {metrics.map((metric) => {
              const width = Math.max(7, Math.min(100, Math.abs(metric.change ?? metric.value) / Math.max(...metrics.map((item) => Math.abs(item.change ?? item.value)), 1) * 100));
              return <div key={`${metric.label}-${metric.display}`} className="grid gap-3 border-b border-stone-300 py-4 last:border-b-0 sm:grid-cols-[minmax(150px,0.75fr)_minmax(220px,1.25fr)] sm:items-center sm:gap-6"><div className="flex items-baseline justify-between gap-3 sm:block"><p className="text-sm font-black leading-5">{metric.label}</p><p className="shrink-0 font-mono text-xl font-black sm:mt-1">{metric.display}</p></div><div><div className="flex items-center gap-3"><div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full ${metric.meaning === "positive" ? "bg-emerald-600" : metric.meaning === "negative" ? "bg-red-600" : "bg-cyan-700"}`} style={{ width: `${width}%` }} /></div><Movement metric={metric} /></div><p className="mt-2 text-xs leading-5 text-stone-600">{metric.plainEnglish}</p></div></div>;
            })}
          </div>
        </div>
        <SourceLine section={section} />
      </div>
    </section>
  );
}

export function NationalEconomyBoard({ data }: { data: NationalEconomyData }) {
  const growth = data.sections.find((section) => section.id === "growth");
  const rest = data.sections.filter((section) => section.id !== "growth");
  if (!growth && !rest.length) return null;

  return (
    <div className="-mx-3 overflow-hidden sm:-mx-6">
      {growth ? <GrowthBand section={growth} /> : null}
      {rest.map((section, index) => <SignalBand key={section.id} section={section} index={index} />)}
      <section className="bg-stone-950 px-4 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Put your province under the lens</p><h2 className="mt-2 text-3xl font-black">Now see where your life is different.</h2></div><ShareStatButton text={`Canada's latest economy dashboard: growth, jobs, inflation, retail spending and rates, backed by Statistics Canada and the Bank of Canada.`} /></div>
      </section>
    </div>
  );
}
