import Link from "next/link";
import { ArrowRight, Banknote, BriefcaseBusiness, CircleDollarSign, Flame, HeartPulse, Home, Landmark, Users } from "lucide-react";
import { DirectionBarChart, PressureMeter, ProvinceRankChart } from "@/components/homepage/data-visuals";
import type { HomepageFeedItem } from "@/lib/homepage-feed";

const topicIcons = {
  Housing: Home,
  Food: Flame,
  Jobs: BriefcaseBusiness,
  Taxes: Banknote,
  Rates: CircleDollarSign,
  Energy: Flame,
  "Government money": Landmark,
  Health: HeartPulse,
  Population: Users,
};

function trustCopy(status: HomepageFeedItem["trustStatus"]) {
  if (status === "live") return "live";
  if (status === "source-linked") return "source-linked";
  return "import pending";
}

export function DebateBoard({ items }: { items: HomepageFeedItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">The Numbers People Argue About</p>
        <h2 className="mt-2 text-2xl font-black text-stone-950 sm:text-4xl">Controversial questions, visual evidence</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Every card needs a chart, a source line, and a plain-English reason to care.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = topicIcons[item.topic as keyof typeof topicIcons] ?? Flame;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-h-[330px] flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-xl"
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-800">
                    <Icon className="size-3.5 text-red-700" aria-hidden="true" />
                    {item.topic}
                  </div>
                  <ArrowRight className="size-4 text-stone-400 transition group-hover:text-red-700" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black leading-snug text-stone-950">{item.headline}</h3>
                <div className="mt-4">
                  <p className="font-mono text-4xl font-black text-stone-950">{item.metric}</p>
                  <p className="mt-1 line-clamp-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    {item.metricLabel}
                  </p>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{item.whyItMatters ?? item.dek}</p>
                <div className="mt-5">
                  {item.provincePoints.length >= 4 ? (
                    <ProvinceRankChart points={item.provincePoints} maxItems={3} />
                  ) : item.visualType === "meter" ? (
                    <PressureMeter value={item.severity ?? 70} label={item.metricLabel} detail={item.dek} />
                  ) : (
                    <DirectionBarChart points={item.visualPoints} maxItems={3} />
                  )}
                </div>
              </div>
              <p className="mt-5 text-[11px] font-semibold text-stone-500">
                {item.source} | {item.period} | {trustCopy(item.trustStatus)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
