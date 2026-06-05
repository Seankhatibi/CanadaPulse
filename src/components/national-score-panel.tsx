import Link from "next/link";
import { ArrowRight, Leaf, Shield, TrendingDown, Zap } from "lucide-react";
import { provinceSymbols, pulseCategories } from "@/lib/canada-pulse-data";
import {
  getCategoryScoreCards,
  getHotIndicators,
  getNationalProfile,
  getProvinceProfiles,
} from "@/lib/data/mock-queries";
import { GlassPanel, StatusPill } from "@/components/app-shell";

const sparkline = [48, 54, 50, 62, 59, 64, 57, 68, 61, 72, 66, 76];

export function NationalScorePanel() {
  const national = getNationalProfile();
  const categories = getCategoryScoreCards("canada");
  const hotIndicators = getHotIndicators("canada").slice(0, 4);
  const strongestProvince = getProvinceProfiles().sort((a, b) => b.score - a.score)[0];
  const weakestProvince = getProvinceProfiles().sort((a, b) => a.score - b.score)[0];

  return (
    <GlassPanel className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative border-b border-black/10 bg-stone-950 p-5 text-white dark:border-white/10 lg:border-b-0 lg:border-r">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-white to-red-600" />
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md border border-white/15 bg-red-600">
                <Shield className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Canada Health Meter</p>
                <p className="text-xs text-white/60">National composite score</p>
              </div>
            </div>
            <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs">
              Live-style
            </span>
          </div>

          <div className="mt-8 grid place-items-center">
            <div className="relative grid size-52 place-items-center rounded-full border border-white/10 bg-[conic-gradient(from_210deg,#dc2626_0deg,#dc2626_226deg,rgba(255,255,255,0.12)_226deg)] shadow-2xl">
              <div className="grid size-40 place-items-center rounded-full bg-stone-950 ring-1 ring-white/10">
                <div className="text-center">
                  <p className="font-mono text-5xl font-semibold sm:text-6xl">{national.score}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                    {national.grade} pulse
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-white/10 bg-white/10 p-3">
              <p className="text-xs text-white/55">Strongest</p>
              <p className="mt-1 text-sm font-semibold">{strongestProvince.name}</p>
              <p className="mt-3 font-mono text-2xl">{strongestProvince.score}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/10 p-3">
              <p className="text-xs text-white/55">Most strained</p>
              <p className="mt-1 text-sm font-semibold">{weakestProvince.name}</p>
              <p className="mt-3 font-mono text-2xl">{weakestProvince.score}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
                National score
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Where Canada feels strong and strained.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>Flag red</StatusPill>
              <StatusPill>Heraldic scorecard</StatusPill>
              <StatusPill>Demo figures</StatusPill>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {categories.slice(0, 8).map((category) => {
              const sourceCategory = pulseCategories.find((item) => item.categorySlug === category.slug);
              const Icon = sourceCategory?.icon ?? Leaf;

              return (
                <div
                  key={category.slug}
                  className="rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"
                >
                  <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
                    <Icon className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
                    <span className="w-fit rounded-md bg-stone-950 px-2 py-1 font-mono text-xs font-semibold text-white dark:bg-white dark:text-stone-950">
                      {category.score?.grade}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold">{category.name}</p>
                  <div className="mt-3 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-end min-[380px]:justify-between">
                    <p className="font-mono text-3xl font-semibold">{category.score?.score}</p>
                    <div className="flex h-10 items-end gap-1">
                      {sparkline.slice(0, 7).map((height, index) => (
                        <span
                          key={`${category.slug}-${index}`}
                          className="w-1.5 rounded-full bg-red-600/70 dark:bg-red-300/70"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {hotIndicators.map((indicator, index) => (
              <div
                key={indicator.slug}
                className="flex flex-col gap-3 rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-stone-950 text-white dark:bg-white dark:text-stone-950">
                    {index % 2 === 0 ? (
                      <TrendingDown className="size-4" aria-hidden="true" />
                    ) : (
                      <Zap className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{indicator.name}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {indicator.sourceSlug}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-lg font-semibold sm:text-right">
                  {indicator.latest?.value.toLocaleString()}
                  <span className="block text-xs text-stone-500">{indicator.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/canada"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Open national dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </GlassPanel>
  );
}

export function ProvincialSymbolRail() {
  const provinces = getProvinceProfiles().slice(0, 8);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {provinces.map((province) => {
        const symbol = provinceSymbols[province.slug];

        return (
          <Link
            key={province.slug}
            href={`/province/${province.slug}`}
            className="group rounded-md border border-black/10 bg-white/65 p-4 transition hover:-translate-y-0.5 hover:border-red-500/50 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10"
          >
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${symbol?.accent ?? "from-red-600 to-stone-900"}`} />
            <div className="mt-4 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{province.name}</p>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{symbol?.symbol}</p>
              </div>
              <span className="w-fit rounded-md bg-stone-950 px-2 py-1 font-mono text-xs font-semibold text-white dark:bg-white dark:text-stone-950">
                {province.score}
              </span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-red-700 dark:text-red-300">
              {symbol?.land}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
