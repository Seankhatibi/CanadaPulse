import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, HeartPulse, Hospital, Stethoscope } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { provinces, provinceSymbols } from "@/lib/canada-pulse-data";
import { getHealthProfile, provinceHealthProfiles } from "@/lib/health-data";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvinceHealthPage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;

  if (!provinces.some((province) => province.slug === provinceSlug)) {
    notFound();
  }

  const profile = getHealthProfile(provinceSlug);
  const symbol = provinceSymbols[provinceSlug];
  const maxMetric = Math.max(...profile.systemMetrics.map((metric) => metric.numeric));
  const maxDisease = Math.max(...profile.diseases.map((disease) => disease.numeric));

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-rose-600 to-sky-500"}`} />
          <div className="p-5 sm:p-7">
            <Link href="/health" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to health
            </Link>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
              <SectionHeader
                eyebrow={`${profile.abbr} health dashboard`}
                title={`${profile.province} health pressure`}
                body={profile.read}
              />
              <div className="rounded-md border border-rose-300/20 bg-rose-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200">Health score</p>
                    <p className="mt-2 font-mono text-5xl font-semibold text-white">{profile.healthScore}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{profile.accessStatus} system access</p>
                  </div>
                  <ShareStatButton text={`${profile.province} health pulse: score ${profile.healthScore}/100, doctor access ${profile.doctorAccess}%, wait pressure ${profile.waitPressure}/100, preventable burden ${profile.preventableBurden}/100.`} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill>{profile.accessStatus} access</StatusPill>
              <StatusPill>${profile.spendingPerPerson.toLocaleString()} per person</StatusPill>
              <StatusPill>{symbol?.symbol ?? "province profile"}</StatusPill>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Hospital className="size-5 text-rose-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">System metrics</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {profile.systemMetrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{metric.label}</p>
                      <p className="text-xs text-stone-500">{metric.note}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-white">{metric.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-400"
                      style={{ width: `${Math.max(8, (metric.numeric / maxMetric) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-5 text-rose-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Disease burden</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {profile.diseases.map((disease) => (
                <div key={disease.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{disease.label}</p>
                      <p className="text-xs text-stone-500">{disease.note}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-white">{disease.prevalence}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-red-600"
                      style={{ width: `${Math.max(8, (disease.numeric / maxDisease) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Stethoscope className="size-5 text-rose-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Compare health pressure</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {provinceHealthProfiles
              .filter((item) => item.slug !== profile.slug)
              .sort((a, b) => b.waitPressure - a.waitPressure)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/province/${item.slug}/health`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-rose-300/50 hover:bg-white/10"
                >
                  <p className="font-semibold text-white">{item.province}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-white">{item.waitPressure}/100</p>
                  <p className="mt-2 text-xs text-stone-500">{item.accessStatus} access</p>
                </Link>
              ))}
          </div>
          <a
            href="https://www.cihi.ca/en"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-300 hover:text-rose-200"
          >
            Open official health source context
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
