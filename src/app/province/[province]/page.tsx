import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Factory, Flower2, HeartPulse, Home, Landmark, Shield, Users, Zap } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { getProvince, provinceSymbols, provinces } from "@/lib/canada-pulse-data";
import { getCategoryScoreCards, getGeographyProfile, getHotIndicators } from "@/lib/data/mock-queries";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;
  const province = getProvince(provinceSlug);
  const profile = getGeographyProfile(provinceSlug);
  const scoreCards = getCategoryScoreCards(provinceSlug).slice(0, 6);
  const hotIndicators = getHotIndicators(provinceSlug).slice(0, 4);
  const symbol = provinceSymbols[provinceSlug];

  if (!provinces.some((item) => item.slug === provinceSlug)) {
    notFound();
  }

  const cards = [
    { label: "Housing pressure", value: "High", icon: Home },
    { label: "Population pressure", value: province.status, icon: Users },
    { label: "Healthcare load", value: "Rising", icon: HeartPulse },
    { label: "Economic engine", value: `${province.score}/100`, icon: Building2 },
  ];

  return (
    <AppShell>
      <GlassPanel className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-red-600 to-stone-900"}`} />
        <div className="p-5 sm:p-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to pulse
        </Link>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow={`${province.abbr} province dashboard`}
            title={`${province.name} Pulse`}
            body="A province-level scorecard with local symbols, regional identity, pressure indicators and direct links into housing, population, tax, health, trade and energy views."
          />
          <div className="flex flex-wrap gap-2">
            <StatusPill>{province.status}</StatusPill>
            <StatusPill>{symbol?.symbol}</StatusPill>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-stone-950 text-white dark:bg-white dark:text-stone-950">
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-stone-600 dark:text-stone-400">Pulse score</p>
              <p className="font-mono text-2xl font-semibold">{province.score}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-red-600 text-white">
              <Flower2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-stone-600 dark:text-stone-400">Provincial symbol</p>
              <p className="font-semibold">{symbol?.symbol}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-600 dark:text-stone-400">Motto / identity cue</p>
            <p className="mt-1 font-serif text-lg italic text-stone-900 dark:text-stone-100">
              {symbol?.motto}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-md border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-black/20"
              >
                <Icon className="size-5 text-red-600 dark:text-red-300" aria-hidden="true" />
                <p className="mt-5 text-sm text-stone-600 dark:text-stone-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/province/${province.slug}/housing`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Open housing engine
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/housing"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/10 bg-white/70 px-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            National housing pulse
            <Home className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/province/${province.slug}/government`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Government money
            <Landmark className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/province/${province.slug}/trade`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Trade engine
            <Factory className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/province/${province.slug}/energy`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Energy map
            <Zap className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/province/${province.slug}/health`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Health pressure
            <HeartPulse className="size-4" aria-hidden="true" />
          </Link>
        </div>
        </div>
      </GlassPanel>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Category score model</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {scoreCards.map((category) => (
              <div
                key={category.slug}
                className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-3">
                  <p className="text-sm font-semibold">{category.name}</p>
                  <span className="w-fit rounded-md bg-stone-950 px-2 py-1 font-mono text-xs text-white dark:bg-white dark:text-stone-950">
                    {category.score?.grade}
                  </span>
                </div>
                <p className="mt-3 font-mono text-3xl font-semibold">{category.score?.score}</p>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  {category.score?.trend}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h2 className="text-lg font-semibold">Hot local indicators</h2>
            <StatusPill>{profile?.capital ?? province.abbr}</StatusPill>
          </div>
          <div className="mt-4 grid gap-3">
            {hotIndicators.map((indicator) => (
              <div
                key={indicator.slug}
                className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{indicator.name}</p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                      {indicator.description}
                    </p>
                  </div>
                  <p className="font-mono text-lg font-semibold sm:shrink-0 sm:text-right sm:text-xl">
                    {indicator.latest?.value.toLocaleString()}
                    <span className="block text-xs text-stone-500">{indicator.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
