import Link from "next/link";
import { ArrowRight, Factory, Globe2, PackageOpen, Ship } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import {
  nationalExportSectors,
  nationalTradePartners,
  provinceTradeEnergyProfiles,
  tradeEnergySnapshot,
} from "@/lib/trade-energy-data";

const maxExport = Math.max(...provinceTradeEnergyProfiles.map((profile) => profile.exportValue));
const maxSector = Math.max(...nationalExportSectors.map((sector) => sector.amount));
const sortedProvinces = [...provinceTradeEnergyProfiles].sort((a, b) => b.exportValue - a.exportValue);

export default function TradePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-sky-500 via-white to-red-600" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Trade engine</StatusPill>
              <StatusPill>{tradeEnergySnapshot.period}</StatusPill>
              <StatusPill>StatCan-ready</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <SectionHeader
                eyebrow="What does Canada sell?"
                title="The export map explains which provinces power the country."
                body="Canada Pulse should make trade feel personal: who sells energy, who sells autos, who sells food, who depends on the US, and which province is carrying the export engine."
              />
              <div className="rounded-md border border-sky-300/20 bg-sky-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Trade read</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{tradeEnergySnapshot.tradeRead}</p>
                  </div>
                  <ShareStatButton text={`Canada trade pulse: exports ${tradeEnergySnapshot.exports}, imports ${tradeEnergySnapshot.imports}, trade balance ${tradeEnergySnapshot.tradeBalance}.`} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Exports", tradeEnergySnapshot.exports, "goods and services"],
                ["Imports", tradeEnergySnapshot.imports, "domestic demand"],
                ["Trade balance", tradeEnergySnapshot.tradeBalance, "net position"],
                ["Energy exports", tradeEnergySnapshot.energyExports, "resource engine"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <p className="text-xs text-stone-500">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-sky-200">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <PackageOpen className="size-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Export sectors</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              This is the national split users should recognize before clicking into a province.
            </p>
            <div className="mt-5 grid gap-3">
              {nationalExportSectors.map((sector) => (
                <div key={sector.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{sector.label}</p>
                      <p className="text-xs text-stone-500">{sector.note}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-white">{sector.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                      style={{ width: `${Math.max(8, (sector.amount / maxSector) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Globe2 className="size-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Who buys from Canada?</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {nationalTradePartners.map((partner) => (
                <div key={partner.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{partner.label}</p>
                      <p className="text-xs text-stone-500">{partner.note}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{partner.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-600" style={{ width: `${partner.amount}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Ship className="size-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Province export leaderboard</h2>
            </div>
            <ShareStatButton text="Canada Pulse trade leaderboard: Alberta, Ontario, Quebec, BC, and Saskatchewan carry the biggest export engines in the demo model." />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sortedProvinces.map((profile) => (
              <Link
                key={profile.slug}
                href={`/province/${profile.slug}/trade`}
                className="group rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-sky-300/50 hover:bg-white/10"
              >
                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      #{profile.exportRank} {profile.province}
                    </p>
                    <p className="text-xs text-stone-500">{profile.topExport}</p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white">${profile.exportValue}B</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-sky-400"
                    style={{ width: `${Math.max(8, (profile.exportValue / maxExport) * 100)}%` }}
                  />
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                  Open province trade
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Factory className="size-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Backend feeds this phase unlocks</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Connect Statistics Canada trade tables, customs export categories, interprovincial trade tables, and province economic accounts.
            The front-end is ready for source-backed refreshes.
          </p>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
