"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, BriefcaseBusiness, Building2, CircleDollarSign, Home, Minus, Users } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { ProvinceExplorerCategoryId, ProvinceExplorerData } from "@/lib/province-explorer-data";

const Canada3DMap = dynamic(() => import("@/components/homepage/canada-3d-map").then((module) => module.Canada3DMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#0b1b1e]" aria-label="Loading Canada map" />,
});

const icons = {
  jobs: BriefcaseBusiness,
  rent: Home,
  prices: CircleDollarSign,
  homes: Building2,
  newcomers: Users,
} satisfies Record<ProvinceExplorerCategoryId, typeof Home>;

const youthSignalLabels: Partial<Record<ProvinceExplorerCategoryId, string>> = {
  jobs: "Job pressure",
  rent: "Rent pressure",
  prices: "Price pressure",
  homes: "Home pipeline",
};

function categoryMeaning(highMeaning: "pressure" | "positive" | "neutral") {
  if (highMeaning === "pressure") return { low: "Less pressure", high: "More pressure" };
  if (highMeaning === "positive") return { low: "Fewer", high: "More" };
  return { low: "Lower flow", high: "Higher flow" };
}

function checkedAt(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProvinceExplorer({ data }: { data: ProvinceExplorerData }) {
  const [categoryId, setCategoryId] = useState<ProvinceExplorerCategoryId>(data.categories[0]?.id ?? "jobs");
  const [provinceSlug, setProvinceSlug] = useState(data.defaultProvince);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const category = data.categories.find((item) => item.id === categoryId) ?? data.categories[0];

  const selected = useMemo(() => {
    if (!category) return null;
    return category.values.find((value) => value.slug === provinceSlug)
      ?? category.values.find((value) => value.slug === hoveredSlug)
      ?? category.values[0];
  }, [category, hoveredSlug, provinceSlug]);
  const hovered = category?.values.find((value) => value.slug === hoveredSlug) ?? null;
  const visible = hovered ?? selected;

  if (!category || !selected || !visible) return null;

  const selectedValue = selected;
  const DirectionIcon = selectedValue.direction === "up" ? ArrowUp : selectedValue.direction === "down" ? ArrowDown : Minus;
  const legend = categoryMeaning(category.highMeaning);
  const selectedProvinceValues = data.categories.flatMap((item) => {
    const value = item.values.find((candidate) => candidate.slug === selected.slug);
    return value ? [{ category: item, value }] : [];
  });
  const youthSignals = selectedProvinceValues.filter(({ category: item }) => youthSignalLabels[item.id]);

  function renderHeader() {
    return (
      <div className="px-4 py-6 sm:px-8 lg:px-9 lg:py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" aria-hidden="true" />
          Official province rows | checked {checkedAt(data.generatedAt)} ET
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-red-300">Your Canada right now</p>
        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl lg:text-5xl">Can you build a life in your province?</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Work, rent, prices, new homes and population, compared with the same official yardstick across Canada.</p>

        <div className="mt-6 grid grid-cols-2 gap-2" aria-label="Map data category">
          {data.categories.map((item) => {
            const Icon = icons[item.id];
            const active = item.id === category.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategoryId(item.id)}
                aria-pressed={active}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-2.5 text-xs font-black transition last:col-span-2 sm:text-sm ${active ? "border-white bg-white text-stone-950" : "border-white/15 bg-white/5 text-slate-300 hover:border-white/40 hover:bg-white/10"}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetails(selectId: string) {
    return (
      <div className="border-t border-white/10 px-4 py-6 sm:px-8 lg:px-9 lg:py-7">
        <p className="text-sm font-black text-cyan-300">{category.question}</p>
        <label htmlFor={selectId} className="mt-5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Province</label>
        <select
          id={selectId}
          value={selectedValue.slug}
          onChange={(event) => setProvinceSlug(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm font-black text-white outline-none focus:border-cyan-300"
        >
          {category.values.slice().sort((left, right) => left.province.localeCompare(right.province)).map((value) => (
            <option key={value.slug} value={value.slug}>{value.province}</option>
          ))}
        </select>

        <div className="mt-5 border-y border-white/10 py-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{selectedValue.province}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <p className="font-mono text-5xl font-black">{selectedValue.display}</p>
            <p className="pb-1 font-mono text-sm font-black text-slate-300">#{selectedValue.rank} of {selectedValue.rankOutOf}</p>
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
            <DirectionIcon className="mt-1 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <span>{selectedValue.note}</span>
          </div>
        </div>

        {youthSignals.length > 0 ? (
          <div className="mt-5" aria-label={`${selectedValue.province} youth reality check`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-300">Youth reality check</p>
              <p className="font-mono text-[11px] font-black text-slate-500">Ranked nationally</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {youthSignals.map(({ category: item, value }) => (
                <div key={item.id} className="border-t border-white/10 pt-2.5">
                  <p className="text-[11px] font-bold text-slate-400">{youthSignalLabels[item.id]}</p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <p className="font-mono text-base font-black text-white">{value.display}</p>
                    <p className={`font-mono text-xs font-black ${item.highMeaning === "positive" ? "text-emerald-300" : value.rank <= 3 ? "text-red-300" : "text-cyan-300"}`}>#{value.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-slate-300">{category.context}</p>
        <p className="mt-3 text-[11px] font-semibold text-slate-500">{category.source} | {category.period}</p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={selectedValue.href} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500">
            Explore {selectedValue.abbr}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <ShareStatButton
            text={`${selectedValue.province}: ${selectedValue.display} for ${category.label.toLowerCase()}, ranked #${selectedValue.rank} of ${selectedValue.rankOutOf}. ${selectedValue.note}`}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="-mx-3 overflow-hidden bg-[#071315] text-white sm:-mx-6" aria-label="Province explorer">
      <div className="lg:grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="hidden min-h-[760px] border-r border-white/10 lg:block">
          {renderHeader()}
          {renderDetails("explorer-province-desktop")}
        </div>

        <div>
          <div className="border-b border-white/10 lg:hidden">{renderHeader()}</div>
          <div className="relative h-[430px] sm:h-[560px] lg:h-[760px]">
            <Canada3DMap category={category} selectedProvince={selectedValue.slug} onSelect={setProvinceSlug} onHover={setHoveredSlug} />
            <div className="pointer-events-none absolute left-4 top-4 bg-[#071315]/88 px-3 py-2 backdrop-blur-sm sm:left-6 sm:top-6">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{visible.province}</p>
              <p className="mt-1 font-mono text-2xl font-black">{visible.display}</p>
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 sm:inset-x-6 sm:bottom-6">
              <span>{legend.low}</span>
              <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${category.lowColor}, ${category.highColor})` }} />
              <span>{legend.high}</span>
            </div>
          </div>
          <div className="lg:hidden">{renderDetails("explorer-province-mobile")}</div>
        </div>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-5">
        {selectedProvinceValues.map(({ category: item, value }) => {
          const Icon = icons[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategoryId(item.id)}
              className={`flex min-h-28 items-start justify-between gap-3 border-b border-white/10 px-4 py-5 text-left transition hover:bg-white/5 sm:px-6 lg:border-b-0 lg:border-r ${item.id === category.id ? "bg-white/10" : ""}`}
            >
              <span>
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-slate-400"><Icon className="size-3.5" aria-hidden="true" />{item.label}</span>
                <span className="mt-3 block font-mono text-2xl font-black text-white">{value.display}</span>
              </span>
              <span className="font-mono text-xs font-black text-cyan-300">#{value.rank}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
