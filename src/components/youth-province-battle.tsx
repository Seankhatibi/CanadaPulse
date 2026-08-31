"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, CircleDollarSign, DoorOpen, Home, Shuffle, Users, WalletCards } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { ProvinceExplorerCategory, ProvinceExplorerCategoryId, ProvinceExplorerData, ProvinceExplorerValue } from "@/lib/province-explorer-data";

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const categoryIcons = {
  jobs: BriefcaseBusiness,
  rent: Home,
  vacancy: DoorOpen,
  prices: CircleDollarSign,
  homes: Building2,
  newcomers: Users,
} satisfies Record<ProvinceExplorerCategoryId, typeof Home>;

function clampIncome(value: number) {
  return Math.round(Math.min(200_000, Math.max(30_000, value)) / 5_000) * 5_000;
}

function valueFor(data: ProvinceExplorerData, categoryId: ProvinceExplorerCategoryId, provinceSlug: string) {
  const category = data.categories.find((item) => item.id === categoryId);
  const value = category?.values.find((item) => item.slug === provinceSlug);
  return category && value ? { category, value } : null;
}

function outcomeLabel(category: ProvinceExplorerCategory, own: ProvinceExplorerValue, other: ProvinceExplorerValue) {
  if (own.value === other.value) return "Tied";
  if (category.highMeaning === "neutral") return "Flow, not a score";
  const ownWins = category.highMeaning === "positive" ? own.value > other.value : own.value < other.value;
  return ownWins ? (category.highMeaning === "positive" ? "Stronger pipeline" : "Lower pressure") : (category.highMeaning === "positive" ? "Smaller pipeline" : "Higher pressure");
}

function ProvinceSnapshot({
  data,
  provinceSlug,
  otherSlug,
  income,
}: {
  data: ProvinceExplorerData;
  provinceSlug: string;
  otherSlug: string;
  income: number;
}) {
  const rent = valueFor(data, "rent", provinceSlug);
  const otherRent = valueFor(data, "rent", otherSlug);
  const jobs = valueFor(data, "jobs", provinceSlug);
  const otherJobs = valueFor(data, "jobs", otherSlug);
  const prices = valueFor(data, "prices", provinceSlug);
  const otherPrices = valueFor(data, "prices", otherSlug);
  const homes = valueFor(data, "homes", provinceSlug);
  const otherHomes = valueFor(data, "homes", otherSlug);
  const vacancy = valueFor(data, "vacancy", provinceSlug);
  const otherVacancy = valueFor(data, "vacancy", otherSlug);
  if (!rent || !otherRent) return null;

  const burden = rent.value.value / (income / 12) * 100;
  const afterRent = income / 12 - rent.value.value;
  const rentWins = rent.value.value < otherRent.value.value;
  const signals = [
    jobs && otherJobs ? { ...jobs, other: otherJobs.value } : null,
    prices && otherPrices ? { ...prices, other: otherPrices.value } : null,
    homes && otherHomes ? { ...homes, other: otherHomes.value } : null,
    vacancy && otherVacancy ? { ...vacancy, other: otherVacancy.value } : null,
  ].filter((item): item is { category: ProvinceExplorerCategory; value: ProvinceExplorerValue; other: ProvinceExplorerValue } => Boolean(item));

  return (
    <div className="min-w-0 py-6 sm:py-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{rent.value.abbr}</p>
          <h3 className="mt-1 text-3xl font-black text-white">{rent.value.province}</h3>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-black ${rentWins ? "bg-emerald-300 text-emerald-950" : "bg-red-500/20 text-red-200"}`}>{rentWins ? "Lower rent" : "Higher rent"}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-white/10 py-5">
        <div>
          <p className="text-xs font-bold text-slate-400">Gross income spent on rent</p>
          <p className={`mt-1 font-mono text-5xl font-black ${burden > 40 ? "text-red-300" : burden > 30 ? "text-amber-300" : "text-emerald-300"}`}>{burden.toFixed(0)}%</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-black text-white">{rent.value.display}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">average 2-bedroom rent</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-bold text-slate-400">Gross monthly income left</p>
          <p className="mt-1 font-mono text-xl font-black text-white">{money.format(afterRent)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400">National rent rank</p>
          <p className="mt-1 font-mono text-xl font-black text-white">#{rent.value.rank} of {rent.value.rankOutOf}</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {signals.map(({ category, value, other }) => {
          const Icon = categoryIcons[category.id];
          const label = outcomeLabel(category, value, other);
          const favourable = label === "Lower pressure" || label === "Stronger pipeline";
          return (
            <div key={category.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <Icon className="size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">{category.label}</p>
                  <p className={`truncate text-xs font-black ${favourable ? "text-emerald-300" : "text-slate-300"}`}>{label}</p>
                </div>
              </div>
              <p className="shrink-0 font-mono text-lg font-black text-white">{value.display}</p>
            </div>
          );
        })}
      </div>

      <Link href={`/province/${rent.value.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-300 hover:text-cyan-200">
        Open {rent.value.abbr} evidence <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function YouthProvinceBattle({
  data,
  initialLeft,
  initialRight,
  initialIncome,
}: {
  data: ProvinceExplorerData;
  initialLeft: string;
  initialRight: string;
  initialIncome: number;
}) {
  const rentCategory = data.categories.find((item) => item.id === "rent");
  const eligibleProvinces = useMemo(() => rentCategory?.values.slice().sort((left, right) => left.province.localeCompare(right.province)) ?? [], [rentCategory]);
  const validLeft = eligibleProvinces.some((province) => province.slug === initialLeft) ? initialLeft : eligibleProvinces[0]?.slug ?? "ontario";
  const requestedRight = eligibleProvinces.some((province) => province.slug === initialRight) ? initialRight : eligibleProvinces[1]?.slug ?? "alberta";
  const validRight = requestedRight === validLeft ? eligibleProvinces.find((province) => province.slug !== validLeft)?.slug ?? requestedRight : requestedRight;
  const [leftSlug, setLeftSlug] = useState(validLeft);
  const [rightSlug, setRightSlug] = useState(validRight);
  const [income, setIncome] = useState(clampIncome(initialIncome));

  const leftRent = rentCategory?.values.find((value) => value.slug === leftSlug);
  const rightRent = rentCategory?.values.find((value) => value.slug === rightSlug);
  const annualGap = leftRent && rightRent ? Math.abs(leftRent.value - rightRent.value) * 12 : 0;
  const cheaper = leftRent && rightRent ? (leftRent.value <= rightRent.value ? leftRent : rightRent) : null;
  const expensive = leftRent && rightRent ? (leftRent.value > rightRent.value ? leftRent : rightRent) : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("left", leftSlug);
    url.searchParams.set("right", rightSlug);
    url.searchParams.set("income", String(income));
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [income, leftSlug, rightSlug]);

  if (!rentCategory || !leftRent || !rightRent || !cheaper || !expensive) return null;

  function changeSide(side: "left" | "right", slug: string) {
    if (side === "left") {
      if (slug === rightSlug) setRightSlug(leftSlug);
      setLeftSlug(slug);
    } else {
      if (slug === leftSlug) setLeftSlug(rightSlug);
      setRightSlug(slug);
    }
  }

  const shareUrl = `/compare?left=${encodeURIComponent(leftSlug)}&right=${encodeURIComponent(rightSlug)}&income=${income}`;
  const shareText = annualGap === 0
    ? `${leftRent.province} and ${rightRent.province} have the same reported average two-bedroom rent in the latest CMHC data.`
    : `${cheaper.province} is ${money.format(annualGap)} cheaper per year in average two-bedroom rent than ${expensive.province} on the latest CMHC data.`;

  return (
    <section className="-mx-3 overflow-hidden bg-[#071315] text-white sm:-mx-6" aria-label="Youth province comparison" data-left-province={leftSlug} data-right-province={rightSlug} data-income={income}>
      <div className="border-b border-white/10 px-4 py-7 sm:px-8 lg:px-10 lg:py-9">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-300"><WalletCards className="size-4" aria-hidden="true" />Province battle</div>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Where does your salary go further?</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Compare two provinces using the same official rent, jobs, inflation and housing-supply releases.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <ProvinceSelect label="Living in" value={leftSlug} provinces={eligibleProvinces} onChange={(slug) => changeSide("left", slug)} />
          <button type="button" onClick={() => { setLeftSlug(rightSlug); setRightSlug(leftSlug); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-black hover:bg-white/15" title="Swap provinces">
            <Shuffle className="size-4" aria-hidden="true" />Swap
          </button>
          <ProvinceSelect label="Compared with" value={rightSlug} provinces={eligibleProvinces} onChange={(slug) => changeSide("right", slug)} />
        </div>

        <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="battle-income" className="text-sm font-bold text-slate-300">Your annual gross income</label>
              <output htmlFor="battle-income" className="font-mono text-2xl font-black">{money.format(income)}</output>
            </div>
            <input id="battle-income" type="range" min="30000" max="200000" step="5000" value={income} onInput={(event) => setIncome(Number(event.currentTarget.value))} className="mt-3 h-8 w-full cursor-pointer accent-red-500" />
            <div className="flex justify-between font-mono text-[11px] font-bold text-slate-500"><span>$30k</span><span>$200k</span></div>
          </div>
          <Link href="#official-comparison" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-black text-stone-950 hover:bg-slate-200">
            All official rows <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <ShareStatButton text={shareText} url={shareUrl} />
        </div>
      </div>

      <div className="bg-[#0b1b1e] px-4 py-7 sm:px-8 lg:px-10 lg:py-9">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-300">The rent gap</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-5xl font-black text-white sm:text-6xl">{money.format(annualGap)}<span className="ml-2 text-xl text-slate-400">/ year</span></p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">{annualGap === 0 ? "The latest reported average rents are tied." : `${cheaper.province} leaves ${money.format(annualGap)} more before tax and every other cost than ${expensive.province}.`}</p>
          </div>
          <div className="border-l-2 border-amber-300 pl-4">
            <p className="text-xs font-bold text-slate-400">What that equals</p>
            <p className="mt-1 font-mono text-2xl font-black">{(annualGap / Math.max(cheaper.value, 1)).toFixed(1)} months of {cheaper.abbr} rent</p>
          </div>
        </div>
      </div>

      <div className="grid divide-y divide-white/10 px-4 sm:px-8 lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:px-10">
        <div className="lg:pr-10"><ProvinceSnapshot data={data} provinceSlug={leftSlug} otherSlug={rightSlug} income={income} /></div>
        <div className="lg:pl-10"><ProvinceSnapshot data={data} provinceSlug={rightSlug} otherSlug={leftSlug} income={income} /></div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-xs leading-5 text-slate-400 sm:px-8 lg:px-10">
        Gross-income scenario using CMHC average two-bedroom purpose-built rent. It excludes tax and all other expenses. Rent source: {rentCategory.source} | {rentCategory.period}.
      </div>
    </section>
  );
}

function ProvinceSelect({
  label,
  value,
  provinces,
  onChange,
}: {
  label: string;
  value: string;
  provinces: ProvinceExplorerValue[];
  onChange: (slug: string) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#102326] px-3 text-sm font-black text-white outline-none [color-scheme:dark] focus:border-cyan-300">
        {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.province}</option>)}
      </select>
    </label>
  );
}
