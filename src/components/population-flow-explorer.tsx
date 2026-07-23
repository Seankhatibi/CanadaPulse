"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, BriefcaseBusiness, GraduationCap, Minus, UsersRound } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { PopulationExplorerData, PopulationFlowId } from "@/lib/population-explorer-data";

const Canada3DMap = dynamic(() => import("@/components/homepage/canada-3d-map").then((module) => module.Canada3DMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#09181b]" aria-label="Loading Canada map" />,
});

const icons = {
  "permanent-residents": UsersRound,
  "study-permits": GraduationCap,
  tfwp: BriefcaseBusiness,
} satisfies Record<PopulationFlowId, typeof UsersRound>;

function checkedAt(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PopulationFlowExplorer({
  data,
  initialFlow,
  initialProvince,
}: {
  data: PopulationExplorerData;
  initialFlow?: PopulationFlowId;
  initialProvince?: string;
}) {
  const startingCategory = data.categories.find((item) => item.id === initialFlow) ?? data.categories[0];
  const startingProvince = startingCategory?.values.some((item) => item.slug === initialProvince)
    ? initialProvince as string
    : data.defaultProvince;
  const [flowId, setFlowId] = useState<PopulationFlowId>(startingCategory?.id ?? "permanent-residents");
  const [provinceSlug, setProvinceSlug] = useState(startingProvince);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const category = data.categories.find((item) => item.id === flowId) ?? data.categories[0];
  const selected = useMemo(() => category?.values.find((item) => item.slug === provinceSlug) ?? category?.values[0], [category, provinceSlug]);
  const hovered = category?.values.find((item) => item.slug === hoveredSlug) ?? null;
  const visible = hovered ?? selected;

  useEffect(() => {
    if (!category || !selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("flow", category.id);
    url.searchParams.set("province", selected.slug);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [category, selected]);

  if (!category || !selected || !visible) return null;
  const DirectionIcon = selected.direction === "up" ? ArrowUp : selected.direction === "down" ? ArrowDown : Minus;
  const shareUrl = `/population?flow=${encodeURIComponent(category.id)}&province=${encodeURIComponent(selected.slug)}`;

  return (
    <section
      className="-mx-3 overflow-hidden bg-[#071315] text-white sm:-mx-6"
      aria-labelledby="population-map-heading"
      data-selected-province={selected.slug}
      data-selected-flow={category.id}
    >
      <div className="grid lg:grid-cols-[0.76fr_1.24fr]">
        <div className="border-white/10 lg:min-h-[760px] lg:border-r">
          <div className="px-4 py-7 sm:px-8 lg:px-9 lg:py-9">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" aria-hidden="true" />
              IRCC province rows | checked {checkedAt(data.generatedAt)} ET
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Population, without the spin</p>
            <h1 id="population-map-heading" className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Where is Canada&apos;s population change landing?</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Select a monthly flow, then a province. Canada Pulse keeps admissions and permit events separate so different datasets are never added into a misleading total.</p>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Population flow">
              {data.categories.map((item) => {
                const Icon = icons[item.id];
                const active = item.id === category.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlowId(item.id)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${active ? "border-white bg-white text-stone-950" : "border-white/15 bg-white/5 text-slate-300 hover:border-white/40 hover:bg-white/10"}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-6 sm:px-8 lg:px-9">
            <p className="text-sm font-black text-cyan-300">{category.question}</p>
            <label htmlFor="population-province" className="mt-5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Province</label>
            <select
              id="population-province"
              value={selected.slug}
              onChange={(event) => setProvinceSlug(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#132528] px-3 text-sm font-black text-white outline-none focus:border-cyan-300"
            >
              {category.values.slice().sort((left, right) => left.province.localeCompare(right.province)).map((item) => (
                <option key={item.slug} value={item.slug}>{item.province}</option>
              ))}
            </select>

            <div className="mt-5 border-y border-white/10 py-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{selected.province}</p>
                  <p className="mt-2 font-mono text-5xl font-black">{selected.display}</p>
                </div>
                <p className="pb-1 font-mono text-sm font-black text-cyan-300">#{selected.rank} of {selected.rankOutOf}</p>
              </div>
              <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
                <DirectionIcon className="mt-1 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                <span>{selected.note}</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{category.definition}</p>
            <p className="mt-3 text-[11px] font-semibold text-slate-500">{data.source} | {data.period}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href={data.releaseHref} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500">
                Open full IRCC breakdown <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ShareStatButton
                url={shareUrl}
                text={`${selected.province}: ${selected.display} ${category.label.toLowerCase()} in ${data.period}, ranked #${selected.rank} of ${selected.rankOutOf}. ${category.definition}`}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="relative h-[430px] border-y border-white/10 sm:h-[570px] lg:h-[620px] lg:border-t-0">
            <Canada3DMap category={category} selectedProvince={selected.slug} onSelect={setProvinceSlug} onHover={setHoveredSlug} />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-md border border-white/10 bg-[#071315]/90 p-3 backdrop-blur sm:inset-x-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{visible.province}</p>
                <p className="mt-1 font-mono text-2xl font-black">{visible.display}</p>
              </div>
              <p className="font-mono text-xs font-black text-cyan-300">#{visible.rank}</p>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-8 lg:px-9">
            <div className="flex items-center justify-between gap-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
              <span>Lower monthly flow</span>
              <span>Higher monthly flow</span>
            </div>
            <div className="mt-2 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${category.lowColor}, ${category.highColor})` }} />
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-5">
              {category.values.slice(0, 5).map((item) => (
                <button key={item.slug} type="button" onClick={() => setProvinceSlug(item.slug)} className="border-t border-white/10 pt-3 text-left hover:border-cyan-300">
                  <span className="flex items-center justify-between gap-2 text-xs font-black text-slate-400"><span>{item.abbr}</span><span>#{item.rank}</span></span>
                  <span className="mt-1 block font-mono text-lg font-black text-white">{item.display}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
