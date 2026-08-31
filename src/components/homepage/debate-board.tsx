"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Banknote, BriefcaseBusiness, CircleDollarSign, Flame, HeartPulse, Home, Landmark, Users } from "lucide-react";
import { DirectionBarChart, PressureMeter, ProvinceRankChart } from "@/components/homepage/data-visuals";
import { ShareStatButton } from "@/components/share-stat-button";
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
  Prices: CircleDollarSign,
  Trade: Landmark,
};

const topicColours: Record<string, string> = {
  Housing: "bg-red-700",
  Jobs: "bg-violet-700",
  Rates: "bg-amber-500 text-stone-950",
  Population: "bg-cyan-700",
  Prices: "bg-orange-600",
  Trade: "bg-blue-700",
  Energy: "bg-emerald-700",
  "Government money": "bg-stone-950",
};

function trustCopy(status: HomepageFeedItem["trustStatus"]) {
  if (status === "live") return "official values loaded";
  if (status === "source-linked") return "official source linked";
  return "source import pending";
}

export function DebateBoard({ items }: { items: HomepageFeedItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);
  if (!selected) return null;

  const Icon = topicIcons[selected.topic as keyof typeof topicIcons] ?? Flame;

  return (
    <section className="mx-auto max-w-7xl py-9 sm:py-12" aria-labelledby="debate-board-heading">
      <div className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">The numbers people argue about</p>
        <h2 id="debate-board-heading" className="mt-2 text-3xl font-black leading-tight text-stone-950 dark:text-white sm:text-5xl">Pick the argument. See the evidence.</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300 sm:text-base">Jobs, rent, prices, newcomers, rates and public money, translated from the latest official releases.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Choose a Canadian data topic">
        {items.map((item) => {
          const TopicIcon = topicIcons[item.topic as keyof typeof topicIcons] ?? Flame;
          const active = item.id === selected.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(item.id)}
              className={`min-h-20 border px-3 py-3 text-left transition ${active ? `${topicColours[item.topic] ?? "bg-red-700"} border-transparent text-white shadow-lg` : "border-stone-300 bg-white/70 text-stone-800 hover:border-red-300 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"}`}
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.09em]"><TopicIcon className="size-3.5" aria-hidden="true" />{item.topic}</span>
              <span className="mt-2 block font-mono text-lg font-black">{item.metric}</span>
            </button>
          );
        })}
      </div>

      <article className="mt-3 overflow-hidden border border-stone-300 bg-white shadow-xl shadow-stone-300/30" role="tabpanel">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="p-5 sm:p-8 lg:p-9">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-800"><Icon className="size-4" aria-hidden="true" />{selected.topic}</div>
            <h3 className="mt-4 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">{selected.headline}</h3>
            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2 border-y border-stone-200 py-5">
              <p className="font-mono text-5xl font-black text-stone-950">{selected.metric}</p>
              <p className="max-w-48 pb-1 text-xs font-black uppercase leading-5 tracking-[0.12em] text-stone-500">{selected.metricLabel}</p>
            </div>
            <p className="mt-5 text-base font-bold leading-7 text-stone-800">{selected.whyItMatters ?? selected.dek}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{selected.dek}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link href={selected.href} className="inline-flex h-10 items-center justify-center gap-2 bg-stone-950 px-4 text-sm font-black text-white hover:bg-red-800">Open the full breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <ShareStatButton text={selected.shareText} variant="light" />
            </div>
            <p className="mt-5 text-[11px] font-semibold text-stone-500">{selected.source} | {selected.period} | {trustCopy(selected.trustStatus)}</p>
          </div>

          <div className="bg-[#eef6f5] p-5 sm:p-8 lg:p-9">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-900">Visual evidence</p>
            <div className="mt-5">
              {selected.provincePoints.length >= 4 ? (
                <ProvinceRankChart points={selected.provincePoints} maxItems={6} />
              ) : selected.visualType === "meter" ? (
                <PressureMeter value={selected.severity ?? 70} label={selected.metricLabel} detail={selected.dek} />
              ) : (
                <DirectionBarChart points={selected.visualPoints} maxItems={6} />
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
