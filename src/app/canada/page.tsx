import { Activity, ArrowUpRight, Landmark, MapPinned, Share2 } from "lucide-react";
import { AppShell, GlassPanel, ProvinceMiniMap, SectionHeader, StatusPill } from "@/components/app-shell";
import { NationalScorePanel, ProvincialSymbolRail } from "@/components/national-score-panel";
import { pulseCategories } from "@/lib/canada-pulse-data";
import {
  getCategoryScoreCards,
  getHotIndicators,
  getProvinceProfiles,
} from "@/lib/data/mock-queries";

export default function CanadaPage() {
  const hotIndicators = getHotIndicators("canada").slice(0, 8);
  const scoreCards = getCategoryScoreCards("canada");
  const provinces = getProvinceProfiles();
  const topMovers = [...provinces].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <GlassPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>National score</StatusPill>
            <StatusPill>Map-first</StatusPill>
            <StatusPill>Share-ready</StatusPill>
          </div>
          <div className="mt-8">
            <SectionHeader
              eyebrow="Canada dashboard"
              title="Canada at a glance, without the noise."
              body="A national command center for composite scores, provincial routes, hot indicators, and a visual system inspired by the flag, heraldry, and provincial symbols."
            />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Modeled indicators", value: hotIndicators.length + 16, icon: Activity },
              { label: "Province routes", value: provinces.length, icon: MapPinned },
              { label: "Score domains", value: scoreCards.length, icon: Landmark },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"
                >
                  <Icon className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
                  <p className="mt-5 font-mono text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Interactive Canada map shell</p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Click any province or territory to open its dashboard.
              </p>
            </div>
            <MapPinned className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          <ProvinceMiniMap />
        </GlassPanel>
      </div>

      <section className="mt-5">
        <NationalScorePanel />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h2 className="text-lg font-semibold">National score domains</h2>
            <StatusPill>Composite demo scores</StatusPill>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {scoreCards.map((category) => {
              const categoryVisual = pulseCategories.find((item) => item.categorySlug === category.slug);
              const Icon = categoryVisual?.icon ?? Activity;

              return (
                <div
                  key={category.slug}
                  className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
                >
                  <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
                    <Icon className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
                    <span className="w-fit rounded-md bg-stone-950 px-2 py-1 font-mono text-xs font-semibold text-white dark:bg-white dark:text-stone-950">
                      {category.score?.grade}
                    </span>
                  </div>
                  <p className="mt-4 font-semibold">{category.name}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                    {category.description}
                  </p>
                  <div className="mt-4 flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                    <span className="font-mono text-3xl font-semibold">{category.score?.score}</span>
                    <span className="text-xs text-stone-500">{category.score?.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h2 className="text-lg font-semibold">Province leaderboard</h2>
            <Share2 className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3">
            {topMovers.map((province, index) => (
              <div
                key={province.slug}
                className="flex flex-col gap-3 rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-red-600 font-mono text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{province.name}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-400">{province.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-semibold">{province.score}</span>
                  <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Provincial symbols layer</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-400">
            The app can feel Canadian without becoming old-fashioned: flag-red framing, heraldic score badges,
            and subtle references to official provincial flowers, mottos, and regional strengths.
          </p>
          <div className="mt-4">
            <ProvincialSymbolRail />
          </div>
        </GlassPanel>
      </section>

      <GlassPanel className="mt-5 p-5">
        <h2 className="text-lg font-semibold">National hot-indicator feed</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {hotIndicators.map((indicator) => (
            <div
              key={indicator.slug}
              className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <p className="text-sm font-semibold">{indicator.name}</p>
              <p className="mt-3 font-mono text-2xl font-semibold">
                {indicator.latest?.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                {indicator.unit} | {indicator.sourceSlug}
              </p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </AppShell>
  );
}
