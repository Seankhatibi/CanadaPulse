import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BatteryCharging, ExternalLink, Fuel, Zap } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { provinces, provinceSymbols } from "@/lib/canada-pulse-data";
import { getTradeEnergyProfile, provinceTradeEnergyProfiles } from "@/lib/trade-energy-data";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvinceEnergyPage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;

  if (!provinces.some((province) => province.slug === provinceSlug)) {
    notFound();
  }

  const profile = getTradeEnergyProfile(provinceSlug);
  const symbol = provinceSymbols[provinceSlug];
  const maxResource = Math.max(...profile.resourceSignals.map((signal) => signal.amount));

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-emerald-600 to-amber-500"}`} />
          <div className="p-5 sm:p-7">
            <Link href="/energy" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to energy
            </Link>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <SectionHeader
                eyebrow={`${profile.abbr} energy map`}
                title={`How ${profile.province} powers itself`}
                body={profile.energyRead}
              />
              <div className="rounded-md border border-emerald-300/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      Energy strength
                    </p>
                    <p className="mt-2 font-mono text-5xl font-semibold text-white">{profile.energyStrength}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      Electricity price signal: {profile.electricityPrice.toFixed(1)} cents/kWh.
                    </p>
                  </div>
                  <ShareStatButton text={`${profile.province} energy pulse: strength ${profile.energyStrength}/100, oil/gas index ${profile.oilGasIndex}, electricity price signal ${profile.electricityPrice.toFixed(1)} cents/kWh.`} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill>Oil/gas index {profile.oilGasIndex}</StatusPill>
              <StatusPill>{profile.topExport}</StatusPill>
              <StatusPill>{symbol?.symbol ?? "energy profile"}</StatusPill>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <BatteryCharging className="size-5 text-emerald-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Electricity mix</h2>
            </div>
            <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-white/10">
              {profile.energyMix.map((slice) => (
                <div
                  key={slice.label}
                  className={slice.tone}
                  title={`${slice.label}: ${slice.share}%`}
                  style={{ width: `${slice.share}%` }}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {profile.energyMix.map((slice) => (
                <div key={slice.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${slice.tone}`} />
                    <p className="font-semibold text-white">{slice.label}</p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-white">{slice.share}%</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Fuel className="size-5 text-emerald-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Resource signals</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {profile.resourceSignals.map((signal) => (
                <div key={signal.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{signal.label}</p>
                      <p className="text-xs text-stone-500">{signal.note}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-white">{signal.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                      style={{ width: `${Math.max(8, (signal.amount / maxResource) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-emerald-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Compare energy profiles</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {provinceTradeEnergyProfiles
              .filter((item) => item.slug !== profile.slug)
              .sort((a, b) => b.energyStrength - a.energyStrength)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/province/${item.slug}/energy`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/50 hover:bg-white/10"
                >
                  <p className="font-semibold text-white">{item.province}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-white">{item.energyStrength}/100</p>
                  <p className="mt-2 text-xs text-stone-500">{item.energyRead}</p>
                </Link>
              ))}
          </div>
          <a
            href="https://www.cer-rec.gc.ca/en/data-analysis/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Open official energy source context
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
