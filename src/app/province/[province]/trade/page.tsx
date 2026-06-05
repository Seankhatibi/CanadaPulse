import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Factory, Globe2, PackageOpen } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { provinces, provinceSymbols } from "@/lib/canada-pulse-data";
import { getTradeEnergyProfile, provinceTradeEnergyProfiles } from "@/lib/trade-energy-data";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvinceTradePage({
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
  const maxSector = Math.max(...profile.sectors.map((sector) => sector.amount));
  const maxPartner = Math.max(...profile.partners.map((partner) => partner.amount));

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-red-600 to-sky-700"}`} />
          <div className="p-5 sm:p-7">
            <Link href="/trade" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to trade
            </Link>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <SectionHeader
                eyebrow={`${profile.abbr} trade engine`}
                title={`What ${profile.province} sells to the world`}
                body={profile.tradeRead}
              />
              <div className="rounded-md border border-sky-300/20 bg-sky-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">
                      Export rank #{profile.exportRank}
                    </p>
                    <p className="mt-2 font-mono text-4xl font-semibold text-white">${profile.exportValue}B</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{profile.topExport}</p>
                  </div>
                  <ShareStatButton text={`${profile.province} trade pulse: ${profile.topExport}, about $${profile.exportValue}B in source-ready demo exports.`} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill>{profile.exportGrowth} export growth signal</StatusPill>
              <StatusPill>{symbol?.land ?? profile.abbr}</StatusPill>
              <StatusPill>{symbol?.symbol ?? "province profile"}</StatusPill>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <PackageOpen className="size-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Export sectors</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {profile.sectors.map((sector) => (
                <div key={sector.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{sector.label}</p>
                      <p className="text-xs text-stone-500">{sector.note}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{sector.value}</p>
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
              <h2 className="text-lg font-semibold text-white">Export destinations</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {profile.partners.map((partner) => (
                <div key={partner.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{partner.label}</p>
                      <p className="text-xs text-stone-500">{partner.note}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{partner.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-red-600"
                      style={{ width: `${Math.max(8, (partner.amount / maxPartner) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Factory className="size-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Compare this province</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {provinceTradeEnergyProfiles
              .filter((item) => item.slug !== profile.slug)
              .sort((a, b) => b.exportValue - a.exportValue)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/province/${item.slug}/trade`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-sky-300/50 hover:bg-white/10"
                >
                  <p className="font-semibold text-white">{item.province}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-white">${item.exportValue}B</p>
                  <p className="mt-2 text-xs text-stone-500">{item.topExport}</p>
                </Link>
              ))}
          </div>
          <a
            href="https://www.statcan.gc.ca/en/subjects-start/international_trade"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            Open official trade source context
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
