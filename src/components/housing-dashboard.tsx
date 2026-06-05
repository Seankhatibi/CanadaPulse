import Link from "next/link";
import { ArrowRight, Building2, ExternalLink, Home, KeyRound, MapPinned, Shovel } from "lucide-react";
import { provinceSymbols } from "@/lib/canada-pulse-data";
import { getHousingDashboard, getProvinceProfiles } from "@/lib/data/mock-queries";
import { getLiveDataConnectionsByArea } from "@/lib/live-data-registry";
import { GlassPanel, ProvinceMiniMap, SectionHeader, StatusPill } from "@/components/app-shell";
import { MiniLineChart } from "@/components/mini-line-chart";
import { AffordabilityCalculator } from "@/components/affordability-calculator";

export function HousingDashboard({ geographySlug = "canada" }: { geographySlug?: string }) {
  const housing = getHousingDashboard(geographySlug);
  const isCanada = geographySlug === "canada";
  const title = isCanada ? "Canada Housing Pulse" : `${housing.profile.name} Housing Pulse`;
  const symbol = provinceSymbols[geographySlug];
  const provinceRankings = getProvinceProfiles()
    .map((province) => getHousingDashboard(province.slug))
    .sort((a, b) => a.affordability.rentBurden - b.affordability.rentBurden)
    .slice(0, 6);
  const housingSources = getLiveDataConnectionsByArea("Housing");

  const statCards = [
    {
      label: "Average rent",
      value: `$${housing.affordability.monthlyRent.toLocaleString()}`,
      detail: `${housing.affordability.rentBurden}% of modeled income`,
      icon: KeyRound,
    },
    {
      label: "Benchmark home",
      value: `$${housing.affordability.benchmarkPrice.toLocaleString()}`,
      detail: `$${housing.affordability.downPaymentTarget.toLocaleString()} down payment target`,
      icon: Home,
    },
    {
      label: "Housing completions",
      value: housing.affordability.completions.toLocaleString(),
      detail: "Annual supply signal",
      icon: Shovel,
    },
    {
      label: "Years to down payment",
      value: housing.affordability.yearsToDownPayment.toString(),
      detail: "At modeled savings rate",
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.03fr_0.97fr]">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-red-600 via-white to-red-600"}`} />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Housing engine</StatusPill>
              <StatusPill>CMHC sources linked</StatusPill>
              <StatusPill>Live import pending</StatusPill>
              <StatusPill>Affordability calculator</StatusPill>
            </div>
            <div className="mt-8">
              <SectionHeader
                eyebrow="Housing and affordability"
                title={title}
                body="Track the pressure Canadians feel most directly: rent, home prices, housing completions, rent-to-income stress, and how long it takes to save for a down payment."
              />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"
                  >
                    <Icon className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
                    <p className="mt-5 text-xs text-stone-600 dark:text-stone-400">{card.label}</p>
                    <p className="mt-1 font-mono text-2xl font-semibold">{card.value}</p>
                    <p className="mt-2 text-xs text-stone-500">{card.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {isCanada ? "Housing pressure map" : "Open another province"}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Scores stay connected to each province identity layer.
              </p>
            </div>
            <MapPinned className="size-5 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          <ProvinceMiniMap />
        </GlassPanel>
      </div>

      <section id="survive" className="grid scroll-mt-24 gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Rent vs home price trend</h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Visual trend scaffold. CMHC and official housing sources are linked below; the next backend step imports
            those tables so this chart refreshes with real source values instead of seeded values.
          </p>
          <div className="mt-5 grid gap-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">Average rent</span>
                <span className="font-mono text-stone-500">CAD/month</span>
              </div>
              <MiniLineChart
                points={housing.rentTrend}
                tone="bg-red-600"
                showValues
                showPercentChange
                formatValue={(value) => `$${value.toLocaleString()}`}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">Benchmark home price</span>
                <span className="font-mono text-stone-500">CAD</span>
              </div>
              <MiniLineChart
                points={housing.homePriceTrend}
                tone="bg-stone-950 dark:bg-white"
                showValues
                showPercentChange
                formatValue={(value) => `$${Math.round(value / 1000).toLocaleString()}k`}
              />
            </div>
          </div>
        </GlassPanel>

        <AffordabilityCalculator
          defaultIncome={housing.affordability.annualIncome}
          defaultRent={housing.affordability.monthlyRent}
          defaultHomePrice={housing.affordability.benchmarkPrice}
          defaultChildcare={housing.affordability.childcareCost}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Housing live-data status</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
            This page is now linked to the official housing sources, but rent/home-price trend values are still seeded
            until CMHC table exports are imported into the database.
          </p>
          <div className="mt-4 grid gap-3">
            {housingSources.map((source) => (
              <a
                key={source.slug}
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-black/10 bg-white/65 p-4 transition hover:border-red-500/50 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{source.label}</p>
                    <p className="mt-1 text-xs text-stone-500">{source.publisher} | {source.refreshCadence}</p>
                  </div>
                  <ExternalLink className="size-4 shrink-0 text-red-700 dark:text-red-300" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">{source.implementation}</p>
                <span className="mt-3 inline-flex rounded-md border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-100">
                  {source.status === "needs-table-import" ? "Needs table import" : source.status}
                </span>
              </a>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Refresh path for real housing data</h2>
          <div className="mt-4 grid gap-3">
            {[
              "Import CMHC starts/completions tables by geography into TimeSeriesValue.",
              "Import CMHC rental market table values for province/CMA average rent and vacancy.",
              "Add benchmark resale prices from an official or licensed housing-price source.",
              "Replace seeded housing trend rows whenever the scheduled refresh job finds newer periods.",
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border border-black/10 bg-white/65 p-3 dark:border-white/10 dark:bg-black/20">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-red-600 font-mono text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-stone-700 dark:text-stone-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.86fr]">
        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Housing indicators</h2>
            <StatusPill>{housing.score?.grade} housing grade</StatusPill>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {housing.housingIndicators.map((indicator) => (
              <div
                key={indicator.slug}
                className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <p className="font-semibold">{indicator.name}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                  {indicator.description}
                </p>
                <p className="mt-4 font-mono text-2xl font-semibold">
                  {indicator.latest?.value.toLocaleString()}
                  <span className="ml-2 text-xs text-stone-500">{indicator.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Most survivable rent burdens</h2>
          <div className="mt-4 grid gap-3">
            {provinceRankings.map((item, index) => (
              <Link
                key={item.profile.slug}
                href={`/province/${item.profile.slug}/housing`}
                className="flex flex-col gap-3 rounded-md border border-black/10 bg-white/65 p-4 transition hover:border-red-500/50 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-red-600 font-mono text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{item.profile.name}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      ${item.affordability.monthlyRent.toLocaleString()} avg rent
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="font-mono text-xl font-semibold">{item.affordability.rentBurden}%</span>
                  <ArrowRight className="size-4 text-red-700 dark:text-red-300" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}
