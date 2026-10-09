"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mapThemes, mapTheme, everydayReading } from "@/lib/map-topics";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, BriefcaseBusiness, Building2, CircleDollarSign, DoorOpen, Home, Minus, WalletCards, Users, HeartPulse } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import { CanadaFlatMap } from "@/components/homepage/canada-flat-map";
import type { MapTheme, ProvinceExplorerCategoryId, ProvinceExplorerData } from "@/lib/province-explorer-data";

const Canada3DMap = dynamic(() => import("@/components/homepage/canada-3d-map").then((module) => module.Canada3DMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#0b1b1e]" aria-label="Loading Canada map" />,
});

const icons = {
  jobs: BriefcaseBusiness,
  "youth-jobs": BriefcaseBusiness,
  "youth-wages": WalletCards,
  "primary-care": HeartPulse,
  rent: Home,
  vacancy: DoorOpen,
  prices: CircleDollarSign,
  homes: Building2,
  newcomers: Users,
} as Partial<Record<ProvinceExplorerCategoryId, typeof Home>>;

const youthSignalLabels: Partial<Record<ProvinceExplorerCategoryId, string>> = {
  jobs: "Job pressure",
  "youth-jobs": "Youth job entry",
  "youth-wages": "Youth hourly pay",
  rent: "Rent pressure",
  vacancy: "Rental choice",
  prices: "Price pressure",
  homes: "Home pipeline",
};

function categoryMeaning(categoryId: ProvinceExplorerCategoryId, highMeaning: "pressure" | "positive" | "neutral") {
  if (categoryId === "vacancy") return { low: "Tighter market", high: "More choice" };
  if (highMeaning === "pressure") return { low: "Less pressure", high: "More pressure" };
  if (highMeaning === "positive") return { low: "Lower value", high: "Higher value" };
  return { low: "Lower value", high: "Higher value" };
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

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

function compactSalary(value: number) {
  return `$${Math.round(value / 1_000)}k`;
}

export function ProvinceExplorer({
  data,
  initialCategory,
  initialProvince,
  initialIncome = 60_000,
  secondaryHeading = false,
  compact = false,
  hero = false,
  initialView = "list",
}: {
  data: ProvinceExplorerData;
  initialCategory?: ProvinceExplorerCategoryId;
  initialProvince?: string;
  initialIncome?: number;
  secondaryHeading?: boolean;
  compact?: boolean;
  hero?: boolean;
  initialView?: "list" | "2d" | "3d";
}) {
  const router = useRouter();
  const startingCategory = data.categories.find((item) => item.id === initialCategory) ?? data.categories.find((item) => item.id === data.defaultCategory) ?? data.categories[0];
  const [manualTopic, setManualTopic] = useState(Boolean(initialCategory));
  const [lens, setLens] = useState<MapTheme | "latest">(initialCategory && startingCategory ? mapTheme(startingCategory) : "latest");
  const startingProvince = (startingCategory?.values.some((value) => value.slug === initialProvince)
    ? initialProvince
    : data.defaultProvince) ?? startingCategory?.values[0]?.slug ?? "ontario";
  const [categoryId, setCategoryId] = useState<ProvinceExplorerCategoryId>(startingCategory?.id ?? "jobs");
  const [provinceSlug, setProvinceSlug] = useState(startingProvince);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [income, setIncome] = useState(initialIncome);
  const [mapMode, setMapMode] = useState<"list" | "2d" | "3d">(initialView);
  const category = data.categories.find((item) => item.id === (hero && !manualTopic ? data.defaultCategory : categoryId)) ?? data.categories[0];
  const viewMode = category?.national && mapMode === "list" ? "3d" : mapMode;
  const availableLayers = data.categories.filter((item) => lens === "latest" ? item.id.startsWith("release:") || item.id.startsWith("bill:") : mapTheme(item) === lens);

  const selected = useMemo(() => {
    if (!category) return null;
    if (category.national) return { province: "Canada", slug: "canada", abbr: "CA", display: category.national.display, note: category.national.note, href: category.national.href, value: 0, rank: 0, rankOutOf: 0, intensity: 0, direction: "neutral" as const, changeDisplay: category.national.changeDisplay, changePeriod: category.national.changePeriod };
    return category.values.find((value) => value.slug === provinceSlug)
      ?? category.values.find((value) => value.slug === hoveredSlug)
      ?? category.values[0];
  }, [category, hoveredSlug, provinceSlug]);
  const hovered = category?.values.find((value) => value.slug === hoveredSlug) ?? null;
  const visible = hovered ?? selected;

  useEffect(() => {
    if (!category || !selected) return;
    const url = new URL(window.location.href);
    if (selected.slug !== "canada") url.searchParams.set("province", selected.slug);
    else url.searchParams.delete("province");
    if (!hero || manualTopic) url.searchParams.set("topic", category.id);
    else url.searchParams.delete("topic");
    url.searchParams.delete("income");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [category, income, selected, hero, manualTopic]);

  useEffect(() => {
    if (!hero) return;
    let refreshedAt = Date.now();
    const refresh = () => { if (document.visibilityState === "visible" && Date.now() - refreshedAt >= 600000) { refreshedAt = Date.now(); router.refresh(); } };
    const timer = window.setInterval(refresh, 600000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [hero, router]);

  if (!category || !selected || !visible) return null;

  const Heading = hero ? "h1" : "h2";
  const selectedValue = selected;
  const DirectionIcon = selectedValue.direction === "up" ? ArrowUp : selectedValue.direction === "down" ? ArrowDown : Minus;
  const legend = categoryMeaning(category.id, category.highMeaning);
  const selectedProvinceValues = data.categories.filter((item) => !hero || (!item.id.startsWith("release:") && !item.id.startsWith("bill:"))).flatMap((item) => {
    const value = item.values.find((candidate) => candidate.slug === selected.slug);
    return value ? [{ category: item, value }] : [];
  });
  const overviewIds = ["youth-jobs", "youth-wages", "rent", "primary-care", "poverty", "newcomers"];
  const overviewValues = hero ? overviewIds.flatMap((id) => selectedProvinceValues.filter(({ category: item }) => item.id === id)) : selectedProvinceValues;
  const youthSignals = selectedProvinceValues.filter(({ category: item }) => youthSignalLabels[item.id]);
  const rentSignal = selectedProvinceValues.find(({ category: item }) => item.id === "rent");
  const monthlyIncome = income / 12;
  const monthlyRent = rentSignal?.value.value ?? 0;
  const rentBurden = monthlyRent > 0 ? (monthlyRent / monthlyIncome) * 100 : 0;
  const incomeAfterRent = monthlyIncome - monthlyRent;
  const salaryAtThirtyPercent = monthlyRent > 0 ? (monthlyRent * 12) / 0.3 : 0;
  const burdenWidth = Math.min(rentBurden, 60) / 60 * 100;
  const rentShareUrl = `/?province=${encodeURIComponent(selectedValue.slug)}&topic=rent`;
  const compareProvince = selectedValue.slug === "alberta" ? "ontario" : "alberta";
  const compareUrl = `/compare?left=${encodeURIComponent(selectedValue.slug)}&right=${compareProvince}&income=${income}`;

  function chooseCategory(id: ProvinceExplorerCategoryId) { setCategoryId(id); setManualTopic(true); setHoveredSlug(null); if (data.categories.find((item) => item.id === id)?.national && mapMode === "list") setMapMode("3d"); }
  function chooseLens(next: MapTheme | "latest") {
    setLens(next); setHoveredSlug(null);
    if (next === "latest") { setManualTopic(false); setCategoryId(data.defaultCategory ?? data.categories[0].id); }
    else { const first = data.categories.find((item) => mapTheme(item) === next && !item.id.startsWith("release:") && !item.id.startsWith("bill:")) ?? data.categories.find((item) => mapTheme(item) === next); if (first) chooseCategory(first.id); }
  }
  function calendar(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : value; }

  function periodLabel(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; if (category.cadence === "Annual") return value.slice(0, 4); if (["Monthly", "Quarterly"].includes(category.cadence ?? "")) return new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)); return calendar(value); }

  function renderHeader() {
    return (
      <div className="px-4 py-4 sm:px-8 lg:px-9">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" aria-hidden="true" />
          Official evidence | checked {checkedAt(data.generatedAt)} ET
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-red-300">Your Canada right now</p>
        <Heading className={`mt-2 font-black leading-tight ${hero ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"}`}>{hero ? "Your life, mapped across Canada." : "Can you build a life in your province?"}</Heading>
        <p className="mt-2 text-sm leading-6 text-slate-300">The newest verified release first. Explore the economy, government and society—and what they mean for your life.</p>

        {hero ? <>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Explore Canada by topic">
            <button onClick={() => chooseLens("latest")} aria-pressed={lens === "latest"} className={`flex min-h-11 gap-4 items-center justify-between rounded-xl border px-3 text-left text-sm font-bold ${lens === "latest" ? "border-cyan-200 bg-cyan-200 text-slate-950" : "border-white/20 bg-white/5"}`}><span>✦ Latest update</span><span className="text-[10px] uppercase tracking-wider">{!manualTopic ? "Following new releases" : "Browse releases"}</span></button>
            {mapThemes.map((theme) => <button key={theme.id} onClick={() => chooseLens(theme.id)} aria-pressed={lens === theme.id} disabled={!data.categories.some((item) => mapTheme(item) === theme.id)} className={`min-h-11 rounded-xl border px-3 text-left text-sm font-bold transition disabled:opacity-35 ${lens === theme.id ? "border-cyan-200 bg-white/15 text-cyan-100" : "border-white/15 bg-white/5 hover:bg-white/10"}`}>{theme.label}</button>)}
          </div>

        </> : <div className="mt-6 grid grid-cols-2 gap-2" aria-label="Map data category">{data.categories.map((item) => { const Icon = icons[item.id] ?? CircleDollarSign; return <button key={item.id} onClick={() => chooseCategory(item.id)} aria-pressed={item.id === category.id} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold ${item.id === category.id ? "bg-white text-stone-950" : "border-white/15"}`}><Icon className="size-4 shrink-0" aria-hidden="true" /><span>{item.label}</span></button>; })}</div>}

      </div>
    );
  }

  function renderLayerPicker(id: string) {
    return <div className="px-4 pb-4 pt-5 sm:px-8 lg:px-9">          <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{lens === "latest" ? "Verified releases & parliamentary updates" : mapThemes.find((theme) => theme.id === lens)?.description}</label>
          <select id={id} value={category.id} onChange={(event) => chooseCategory(event.target.value as ProvinceExplorerCategoryId)} className="mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-[#112c30] px-3 text-sm font-bold text-white">
            {availableLayers.map((item) => <option key={item.id} value={item.id}>{item.releaseDate ? `${calendar(item.releaseDate)} · ` : ""}{item.label}</option>)}
          </select>
          {lens === "latest" ? <p className="mt-2 text-[11px] leading-5 text-slate-400">Newest publication date first; source-supplied times order timed releases, then same-day relevance. Selecting a release pins that view. “Latest update” resumes following new releases.</p> : null}
    </div>;
  }

  function renderDetails(selectId: string) {
    return (
      <div className="border-t border-white/10 px-4 py-6 sm:px-8 lg:px-9 lg:py-7">
        {category.headline ? <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">{category.national?.kind === "legislation" ? "Parliamentary update" : category.national?.kind === "report" ? "Official report" : "Data release"} · {calendar(category.releaseDate)}</p> : null}
        {category.headline ? <h2 className="mb-4 text-xl font-bold leading-snug">{category.headline}</h2> : null}
        <p className="text-sm font-black text-cyan-300">{category.question}</p>
        {!category.national ? <><label htmlFor={selectId} className="mt-5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Province</label>
        <select
          id={selectId}
          value={selectedValue.slug}
          onChange={(event) => setProvinceSlug(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm font-black text-white outline-none focus:border-cyan-300"
        >
          {category.values.slice().sort((left, right) => left.province.localeCompare(right.province)).map((value) => (
            <option key={value.slug} value={value.slug}>{value.province}</option>
          ))}
        </select></> : <p className="mt-3 text-xs leading-5 text-slate-400">Canada-level context. No provincial values are assigned to this layer.</p>}

        <div className="mt-5 border-y border-white/10 py-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{selectedValue.province}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <p className={`font-mono font-black ${category.national && category.national.kind !== "metric" ? "text-2xl" : "text-4xl sm:text-5xl"}`}>{selectedValue.display}</p>
            {!category.national ? <p className="pb-1 font-mono text-sm font-black text-slate-300">#{selectedValue.rank} of {selectedValue.rankOutOf}</p> : null}
          </div>
          {selectedValue.changeDisplay ? <p className="mt-3 text-sm font-bold text-cyan-200">{selectedValue.changeDisplay}{selectedValue.changePeriod ? ` vs ${periodLabel(selectedValue.changePeriod)}` : " · see source comparison"}</p> : null}
          <p className="mt-3 text-xs text-slate-400">Observation: {category.period}{category.cohort ? ` · ${category.cohort}` : ""}</p>
          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
            <DirectionIcon className="mt-1 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <span>{selectedValue.note}</span>
          </div>
        </div>

        {youthSignals.length > 0 && !hero ? (
          <div className="mt-5" aria-label={`${selectedValue.province} household context`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-300">Household context</p>
              <p className="font-mono text-[11px] font-black text-slate-500">Highest to lowest value</p>
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

        {hero ? <><div className="mt-4 rounded-xl border border-cyan-200/15 bg-cyan-200/5 p-4"><h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">In plain English</h3><p className="mt-2 text-sm leading-6 text-slate-200">{category.national ? category.whyItMatters ?? category.context : everydayReading(category, selectedValue.value, selectedValue.display)}</p></div><details className="mt-4 text-sm"><summary className="cursor-pointer font-bold text-cyan-300">Context & limits</summary><p className="mt-2 leading-6 text-slate-300">{category.context}</p></details></> : <p className="mt-4 text-sm leading-6 text-slate-300">{category.context}</p>}
        <p className="mt-3 text-[11px] font-semibold text-slate-500">{category.source} | {category.period}</p>
        {category.sourceUrl ? <a href={category.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center text-xs font-bold text-cyan-300">Official source & definition ↗</a> : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={selectedValue.href} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500">
            Explore {category.national || category.cohort ? "this evidence" : selectedValue.abbr}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <ShareStatButton
            text={`${selectedValue.province}: ${selectedValue.display} · ${category.question} · ${category.period}. ${category.national ? selectedValue.note : `Ranked #${selectedValue.rank} of ${selectedValue.rankOutOf}. ${selectedValue.note}`}`}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="-mx-3 overflow-hidden bg-[#071315] text-white sm:-mx-6" aria-label="Province explorer" data-selected-province={selectedValue.slug} data-selected-topic={category.id} data-income={income} data-compact={compact || undefined}>
      {!secondaryHeading && !hero ? <h1 className="sr-only">Can you build a life in your province?</h1> : null}
      {hero ? <div className="border-b border-white/10">{renderHeader()}</div> : null}
      <div className="lg:grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className={`hidden border-r border-white/10 lg:block ${compact ? "min-h-[640px]" : "min-h-[760px]"}`}>
          {hero ? renderLayerPicker("map-layer-desktop") : renderHeader()}
          {renderDetails("explorer-province-desktop")}
        </div>

        <div>
          <div className="border-b border-white/10 lg:hidden">{hero ? renderLayerPicker("map-layer-mobile") : renderHeader()}<div className="flex items-center justify-between gap-3 px-4 pb-4"><span className="font-bold">{selectedValue.province}</span><span className="font-mono text-2xl font-bold">{selectedValue.display}</span></div></div>
          <div className="flex flex-wrap gap-2 p-4" aria-label="Choose explorer view">{(category.national ? ["2d", "3d"] as const : ["list", "2d", "3d"] as const).map((mode) => <button key={mode} type="button" aria-pressed={viewMode === mode} onClick={() => setMapMode(mode)} className={`min-h-11 rounded-lg border px-4 text-sm font-bold ${viewMode === mode ? "bg-white text-stone-950" : "border-white/25 text-white"}`}>{mode === "list" ? "Ranked list" : mode === "2d" ? "2D map" : "3D map"}</button>)}</div>
          <div className={`relative ${viewMode === "list" ? "max-h-[560px] overflow-auto" : "h-[420px] sm:h-[600px]"}`}>
            {viewMode === "list" && !category.national ? <div className="grid gap-2 p-4">{category.values.map((value) => <button key={value.slug} onClick={() => setProvinceSlug(value.slug)} aria-pressed={value.slug === selectedValue.slug} className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border p-3 text-left ${value.slug === selectedValue.slug ? "border-teal-200 bg-white/15" : "border-white/15"}`}><span className="text-sm">#{value.rank} {value.province}</span><span className="font-mono font-bold">{value.display}</span></button>)}<p className="text-xs leading-6 text-slate-400">Ranks describe the highest values, not an overall quality-of-life grade. Raw home and newcomer counts are not adjusted for population.</p></div> : viewMode === "2d" ? <CanadaFlatMap category={category} selectedProvince={selectedValue.slug} onSelect={setProvinceSlug} /> : <Canada3DMap category={category} selectedProvince={selectedValue.slug} onSelect={setProvinceSlug} onHover={setHoveredSlug} /> }
            {viewMode !== "list" ? <><div className="pointer-events-none absolute left-4 top-4 bg-[#071315]/88 px-3 py-2 backdrop-blur-sm sm:left-6 sm:top-6">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{category.national ? "Canada-level evidence" : visible.province}</p>
              <p className="mt-1 font-mono text-2xl font-black">{visible.display}</p>
              {category.national?.kind === "legislation" ? <p className="mt-2 max-w-64 text-xs leading-5 text-cyan-100">{category.national.note}</p> : null}
              <p className="mt-1 text-[10px] text-slate-300">{category.national ? category.national.label : category.cohort ?? "General population / survey coverage"} · {category.period}</p>
            </div>
            {!category.national ? <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 sm:inset-x-6 sm:bottom-6">
              <span>{legend.low}</span>
              <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${category.lowColor}, ${category.highColor})` }} />
              <span>{legend.high}</span>
            </div> : <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-[#071315]/85 px-3 py-2 text-center text-xs text-cyan-100">One Canada-level view · provincial colours do not represent separate values</div>}</> : null}
          </div>
          {!category.national ? <p className="px-4 pb-4 text-[11px] leading-5 text-slate-400">Colour compares values within this layer. Raised edges are decorative. Grey means no comparable observation. Smaller provinces are labelled when selected.</p> : null}
          <p className="px-4 pb-4 text-[11px] leading-5 text-slate-400">Geography: <a className="underline underline-offset-2 hover:text-white" href="https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/0" target="_blank" rel="noreferrer">Statistics Canada’s official province and territory boundaries</a> · Lambert projection · coastlines generalized for display. 3D uses a raised vector fallback when WebGL is unavailable.</p>
          <div className="lg:hidden">{renderDetails("explorer-province-mobile")}</div>
        </div>
      </div>

      {category.national?.metrics?.length ? <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4" aria-label="More evidence from this release">{category.national.metrics.map((metric) => <div key={metric.label} className="bg-[#0b1b1e] p-5"><p className="text-xs font-bold text-slate-400">{metric.label}</p><p className="mt-2 font-mono text-2xl font-bold">{metric.display}</p>{metric.changeDisplay ? <p className="mt-2 text-xs text-cyan-200">{metric.changeDisplay}</p> : null}</div>)}</div> : null}
      <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-6">
        {overviewValues.map(({ category: item, value }) => {
          const Icon = icons[item.id] ?? CircleDollarSign;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { chooseCategory(item.id); if (hero) setLens(mapTheme(item)); }}
              className={`flex items-start justify-between gap-3 border-b border-white/10 px-4 text-left transition hover:bg-white/5 sm:px-6 lg:border-b-0 lg:border-r ${compact ? "min-h-24 py-4" : "min-h-28 py-5"} ${item.id === category.id ? "bg-white/10" : ""}`}
            >
              <span>
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-slate-400"><Icon className="size-3.5" aria-hidden="true" />{item.label}</span>
                <span className="mt-3 block font-mono text-2xl font-black text-white">{value.display}</span><span className="mt-2 block text-[10px] text-slate-400">{item.period}</span>
              </span>
              <span className="font-mono text-xs font-black text-cyan-300">#{value.rank}</span>
            </button>
          );
        })}
      </div>

      {rentSignal ? (
        <div className={`border-t border-white/10 bg-[#0b1b1e] px-4 sm:px-8 lg:px-10 ${compact ? "py-6 sm:py-7" : "py-7 sm:py-9"}`} aria-label={`${selectedValue.province} rent burden calculator`}>
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-300">
                <WalletCards className="size-4" aria-hidden="true" />
                Young renter math
              </div>
              <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight sm:text-3xl">What does rent take from a {compactSalary(income)} salary in {selectedValue.province}?</h2>
              <div className="mt-5 flex items-end justify-between gap-4">
                <label htmlFor="annual-income" className="text-sm font-bold text-slate-300">Annual gross income</label>
                <output htmlFor="annual-income" className="font-mono text-2xl font-black text-white">{money.format(income)}</output>
              </div>
              <input
                id="annual-income"
                type="range"
                min="30000"
                max="200000"
                step="5000"
                value={income}
                onInput={(event) => setIncome(Number(event.currentTarget.value))}
                className="mt-3 h-8 w-full cursor-pointer accent-red-500"
                aria-describedby="income-assumption"
              />
              <div className="flex justify-between font-mono text-[11px] font-bold text-slate-500"><span>$30k</span><span>$200k</span></div>
            </div>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Gross income spent on rent</p>
                  <p className={`mt-1 font-mono text-5xl font-black ${rentBurden > 40 ? "text-red-300" : rentBurden > 30 ? "text-amber-300" : "text-emerald-300"}`}>{rentBurden.toFixed(0)}%</p>
                </div>
                <p className="font-mono text-sm font-black text-slate-300">{rentSignal.value.display}/month</p>
              </div>
              <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${rentBurden > 40 ? "bg-red-500" : rentBurden > 30 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${burdenWidth}%` }} />
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white" title="30% affordability line" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-500"><span>0%</span><span className="text-white">30% line</span><span>60%+</span></div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-white/10 py-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Gross monthly income left</p>
                  <p className="mt-1 font-mono text-xl font-black text-white">{money.format(incomeAfterRent)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Salary for rent at 30%</p>
                  <p className="mt-1 font-mono text-xl font-black text-white">{money.format(salaryAtThirtyPercent)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p id="income-assumption" className="text-xs leading-5 text-slate-400">Uses CMHC average two-bedroom purpose-built rent. Gross-income scenario; excludes tax and all other expenses.</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">{rentSignal.category.source} | {rentSignal.category.period}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={rentSignal.value.href} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-black text-stone-950 hover:bg-slate-200">
                Open housing data <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={compareUrl} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 text-sm font-black text-cyan-200 hover:bg-cyan-300/20">
                Compare this salary <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ShareStatButton
                url={rentShareUrl}
                text={`${selectedValue.province}: average two-bedroom rent takes ${rentBurden.toFixed(0)}% of gross monthly income on a ${compactSalary(income)} salary, leaving ${money.format(incomeAfterRent)} before tax and other costs.`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
