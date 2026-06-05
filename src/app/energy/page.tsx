import Link from "next/link";
import { ArrowRight, Atom, BatteryCharging, Fuel, Gauge, Zap } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { provinceTradeEnergyProfiles, tradeEnergySnapshot } from "@/lib/trade-energy-data";

const sortedEnergy = [...provinceTradeEnergyProfiles].sort((a, b) => b.energyStrength - a.energyStrength);
const maxOilGas = Math.max(...provinceTradeEnergyProfiles.map((profile) => profile.oilGasIndex));

export default function EnergyPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-300 to-red-600" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Energy and resources</StatusPill>
              <StatusPill>CER-ready</StatusPill>
              <StatusPill>Province grid mix</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-end">
              <SectionHeader
                eyebrow="How Canada powers itself"
                title="Energy is the country's most misunderstood economic map."
                body="This view shows oil and gas strength, nuclear and hydro anchors, electricity prices, resource exposure, and which provinces export or depend on energy."
              />
              <div className="rounded-md border border-emerald-300/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Energy read</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{tradeEnergySnapshot.electricityRead}</p>
                  </div>
                  <ShareStatButton text={`Canada energy pulse: ${tradeEnergySnapshot.electricityRead}`} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Energy exports", tradeEnergySnapshot.energyExports, "resource engine", Fuel],
                ["Hydro anchor", "QC + BC", "low-carbon base", Zap],
                ["Nuclear anchor", "Ontario", "baseload power", Atom],
                ["Oil/gas anchor", "Alberta", "export engine", Gauge],
              ].map(([label, value, note, Icon]) => (
                <div key={label as string} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <Icon className="size-5 text-emerald-300" aria-hidden="true" />
                  <p className="mt-5 text-xs text-stone-500">{label as string}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-white">{value as string}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-emerald-200">{note as string}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Fuel className="size-5 text-emerald-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Oil and gas production signal</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              The map should make one thing obvious: production, consumption, and political pressure are not evenly distributed.
            </p>
            <div className="mt-5 grid gap-3">
              {provinceTradeEnergyProfiles
                .filter((profile) => profile.oilGasIndex > 0)
                .sort((a, b) => b.oilGasIndex - a.oilGasIndex)
                .map((profile) => (
                  <Link
                    key={profile.slug}
                    href={`/province/${profile.slug}/energy`}
                    className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/50 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{profile.province}</p>
                        <p className="text-xs text-stone-500">{profile.energyRead}</p>
                      </div>
                      <p className="font-mono text-xl font-semibold text-white">{profile.oilGasIndex}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-600"
                        style={{ width: `${Math.max(8, (profile.oilGasIndex / maxOilGas) * 100)}%` }}
                      />
                    </div>
                  </Link>
                ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <BatteryCharging className="size-5 text-emerald-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Electricity mix by province</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {sortedEnergy.slice(0, 8).map((profile) => (
                <Link
                  key={profile.slug}
                  href={`/province/${profile.slug}/energy`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{profile.province}</p>
                    <p className="font-mono text-sm font-semibold text-emerald-200">{profile.energyStrength}/100</p>
                  </div>
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-white/10">
                    {profile.energyMix.map((slice) => (
                      <div
                        key={slice.label}
                        className={slice.tone}
                        title={`${slice.label}: ${slice.share}%`}
                        style={{ width: `${slice.share}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    {profile.energyMix.map((slice) => `${slice.label} ${slice.share}%`).join(" | ")}
                  </p>
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Energy strength leaderboard</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Hydro, nuclear, oil and gas, electricity price, and resource exposure rolled into one source-ready view.
              </p>
            </div>
            <ShareStatButton text="Canada Pulse energy leaderboard shows Alberta, Quebec, Saskatchewan, Ontario, and BC as major energy anchors in different ways." />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedEnergy.map((profile) => (
              <Link
                key={profile.slug}
                href={`/province/${profile.slug}/energy`}
                className="group rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/50 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{profile.province}</p>
                    <p className="text-xs text-stone-500">{profile.topExport}</p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white">{profile.energyStrength}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  Open energy map
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
