import Link from "next/link";
import { ArrowRight, Banknote, Home, ReceiptText, Swords, TrendingDown, Users } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { CompareProvincePicker } from "@/components/compare-province-picker";
import { ShareStatButton } from "@/components/share-stat-button";
import { getProvince, provinces, provinceSymbols } from "@/lib/canada-pulse-data";
import { getHousingDashboard } from "@/lib/data/mock-queries";
import { provincePopulationPressure } from "@/lib/population-data";
import { estimateTaxReceipt, taxProfiles } from "@/lib/tax-data";

const defaultIncome = 92000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function clampPercent(value: number) {
  return Math.max(6, Math.min(100, value));
}

function getComparableProvince(slug: string | undefined, fallback: string) {
  return provinces.some((province) => province.slug === slug) ? slug! : fallback;
}

function winnerLabel(lowerIsBetter: boolean, left: number, right: number, leftName: string, rightName: string) {
  if (left === right) return "Tie";
  const leftWins = lowerIsBetter ? left < right : left > right;
  return leftWins ? leftName : rightName;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams?: Promise<{ left?: string; right?: string; income?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const incomeParam = Number(resolvedSearchParams?.income ?? defaultIncome);
  const income = Number.isFinite(incomeParam) && incomeParam > 0 ? incomeParam : defaultIncome;
  const leftSlug = getComparableProvince(resolvedSearchParams?.left, "ontario");
  const rightFallback = leftSlug === "alberta" ? "ontario" : "alberta";
  const rightSlug = getComparableProvince(resolvedSearchParams?.right, rightFallback);

  const leftProvince = getProvince(leftSlug);
  const rightProvince = getProvince(rightSlug === leftSlug ? rightFallback : rightSlug);
  const leftTax = estimateTaxReceipt(income, leftProvince.slug);
  const rightTax = estimateTaxReceipt(income, rightProvince.slug);
  const leftHousing = getHousingDashboard(leftProvince.slug);
  const rightHousing = getHousingDashboard(rightProvince.slug);
  const leftPressure = provincePopulationPressure.find((item) => item.slug === leftProvince.slug);
  const rightPressure = provincePopulationPressure.find((item) => item.slug === rightProvince.slug);
  const taxDelta = Math.abs(leftTax.totalTax - rightTax.totalTax);
  const rentDelta = Math.abs(leftHousing.affordability.monthlyRent - rightHousing.affordability.monthlyRent);
  const taxLeader = winnerLabel(true, leftTax.totalTax, rightTax.totalTax, leftProvince.name, rightProvince.name);
  const rentLeader = winnerLabel(true, leftHousing.affordability.rentBurden, rightHousing.affordability.rentBurden, leftProvince.name, rightProvince.name);
  const pressureLeader = winnerLabel(
    true,
    leftPressure?.pressureScore ?? 0,
    rightPressure?.pressureScore ?? 0,
    leftProvince.name,
    rightProvince.name,
  );
  const allReceipts = taxProfiles
    .filter((profile) => profile.slug !== "canada")
    .map((profile) => ({
      profile,
      receipt: estimateTaxReceipt(income, profile.slug),
      province: provinces.find((province) => province.slug === profile.slug),
    }))
    .filter((item) => item.province)
    .sort((a, b) => b.receipt.totalTax - a.receipt.totalTax);
  const maxReceipt = Math.max(...allReceipts.map((item) => item.receipt.totalTax));

  const battleMetrics = [
    {
      label: "Tax receipt",
      icon: ReceiptText,
      left: formatCurrency(leftTax.totalTax),
      right: formatCurrency(rightTax.totalTax),
      leftNumeric: leftTax.totalTax,
      rightNumeric: rightTax.totalTax,
      winner: taxLeader,
      note: `Spread: ${formatCurrency(taxDelta)} on ${formatCurrency(income)} income`,
      lowerIsBetter: true,
    },
    {
      label: "Rent burden",
      icon: Home,
      left: `${leftHousing.affordability.rentBurden}%`,
      right: `${rightHousing.affordability.rentBurden}%`,
      leftNumeric: leftHousing.affordability.rentBurden,
      rightNumeric: rightHousing.affordability.rentBurden,
      winner: rentLeader,
      note: `${formatCurrency(rentDelta)} monthly rent gap in the Canada Pulse model`,
      lowerIsBetter: true,
    },
    {
      label: "Population pressure",
      icon: Users,
      left: `${leftPressure?.pressureScore ?? 0}/100`,
      right: `${rightPressure?.pressureScore ?? 0}/100`,
      leftNumeric: leftPressure?.pressureScore ?? 0,
      rightNumeric: rightPressure?.pressureScore ?? 0,
      winner: pressureLeader,
      note: "Lower pressure means housing, jobs, and services absorb growth more easily",
      lowerIsBetter: true,
    },
    {
      label: "Pulse score",
      icon: TrendingDown,
      left: `${leftProvince.score}/100`,
      right: `${rightProvince.score}/100`,
      leftNumeric: leftProvince.score,
      rightNumeric: rightProvince.score,
      winner: winnerLabel(false, leftProvince.score, rightProvince.score, leftProvince.name, rightProvince.name),
      note: "Higher score means the province looks stronger across the Canada Pulse score model",
      lowerIsBetter: false,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-white to-sky-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Province Battle Mode</StatusPill>
              <StatusPill>{formatCurrency(income)} income</StatusPill>
              <StatusPill>Share-ready</StatusPill>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
              <div className="space-y-5">
                <SectionHeader
                  eyebrow="Same income, different Canada"
                  title={`${leftProvince.name} vs ${rightProvince.name}`}
                  body="This is the viral comparison screen: taxes, rent pressure, population pressure, housing supply, and pulse scores in one glance."
                />
                <CompareProvincePicker left={leftProvince.slug} right={rightProvince.slug} income={income} />
              </div>
              <div className="rounded-md border border-red-300/20 bg-red-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                      Pain translation
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(taxDelta)} tax spread
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      On the same salary, that is the difference people actually feel when they compare provinces.
                    </p>
                  </div>
                  <ShareStatButton
                    text={`${leftProvince.name} vs ${rightProvince.name}: the modeled tax spread is ${formatCurrency(taxDelta)} on ${formatCurrency(income)} income.`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_1fr]">
              {[leftProvince, rightProvince].map((province) => {
                const receipt = province.slug === leftProvince.slug ? leftTax : rightTax;
                const housing = province.slug === leftProvince.slug ? leftHousing : rightHousing;
                const pressure = province.slug === leftProvince.slug ? leftPressure : rightPressure;
                const symbol = provinceSymbols[province.slug];

                return (
                  <div
                    key={province.slug}
                    className={`min-w-0 overflow-hidden rounded-md border border-white/10 bg-gradient-to-br ${symbol?.accent ?? "from-red-600 to-stone-800"}`}
                  >
                    <div className="bg-black/35 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-white/75">{province.abbr}</p>
                          <h2 className="mt-1 text-3xl font-semibold text-white">{province.name}</h2>
                        </div>
                        <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                          {symbol?.symbol}
                        </span>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-white/65">Tax receipt</p>
                          <p className="mt-1 font-mono text-2xl font-semibold text-white">
                            {formatCurrency(receipt.totalTax)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/65">Rent burden</p>
                          <p className="mt-1 font-mono text-2xl font-semibold text-white">
                            {housing.affordability.rentBurden}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/65">Pressure</p>
                          <p className="mt-1 font-mono text-2xl font-semibold text-white">
                            {pressure?.pressureScore ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/65">Pulse</p>
                          <p className="mt-1 font-mono text-2xl font-semibold text-white">
                            {province.score}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/province/${province.slug}`}
                        className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
                      >
                        Open {province.abbr}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              <div className="order-first grid place-items-center md:order-none">
                <span className="grid size-14 place-items-center rounded-md bg-red-600 text-white shadow-sm">
                  <Swords className="size-6" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300">Battle scoreboard</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Who wins the life math?</h2>
              </div>
              <ShareStatButton
                text={`${leftProvince.name} vs ${rightProvince.name}: ${taxLeader} has the lower modeled tax receipt, ${rentLeader} has the lower rent burden, and ${pressureLeader} has the lower population pressure.`}
              />
            </div>

            <div className="mt-5 grid gap-4">
              {battleMetrics.map((metric) => {
                const Icon = metric.icon;
                const max = Math.max(metric.leftNumeric, metric.rightNumeric, 1);

                return (
                  <div key={metric.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-md bg-white/10 text-red-200">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-semibold text-white">{metric.label}</p>
                          <p className="text-xs text-stone-500">{metric.note}</p>
                        </div>
                      </div>
                      <span className="w-fit rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                        Edge: {metric.winner}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {[
                        { province: leftProvince, value: metric.left, numeric: metric.leftNumeric },
                        { province: rightProvince, value: metric.right, numeric: metric.rightNumeric },
                      ].map((item) => (
                        <div key={`${metric.label}-${item.province.slug}`} className="grid gap-2 sm:grid-cols-[9rem_1fr_6rem] sm:items-center">
                          <p className="text-sm font-semibold text-white">{item.province.name}</p>
                          <div className="h-3 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                item.province.name === metric.winner
                                  ? "bg-gradient-to-r from-emerald-500 to-sky-400"
                                  : "bg-gradient-to-r from-red-700 to-amber-400"
                              }`}
                              style={{ width: `${clampPercent((item.numeric / max) * 100)}%` }}
                            />
                          </div>
                          <p className="font-mono text-sm font-semibold text-stone-200 sm:text-right">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Banknote className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Tax receipt leaderboard</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Same modeled income, ranked across every province and territory in the app.
            </p>
            <div className="mt-5 grid gap-2">
              {allReceipts.map((item, index) => (
                <Link
                  key={item.profile.slug}
                  href={`/tax-dollar?province=${item.profile.slug}&income=${income}`}
                  className="group grid gap-2 rounded-md border border-white/10 bg-black/30 p-3 transition hover:border-red-400/50 hover:bg-white/10 sm:grid-cols-[2.5rem_1fr_5.5rem] sm:items-center"
                >
                  <span className="font-mono text-sm text-stone-500">#{index + 1}</span>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.profile.name}</p>
                      <p className="font-mono text-sm font-semibold text-white sm:hidden">
                        {formatCurrency(item.receipt.totalTax)}
                      </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-600 to-white"
                        style={{ width: `${clampPercent((item.receipt.totalTax / maxReceipt) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="hidden font-mono text-sm font-semibold text-white sm:block sm:text-right">
                    {formatCurrency(item.receipt.totalTax)}
                  </p>
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>
      </div>
    </AppShell>
  );
}
