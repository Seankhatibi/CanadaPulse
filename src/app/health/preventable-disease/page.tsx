import Link from "next/link";
import { ArrowLeft, CircleDollarSign, HeartPulse, ShieldAlert } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { nationalDiseaseBurden, provinceHealthProfiles } from "@/lib/health-data";

const maxDisease = Math.max(...nationalDiseaseBurden.map((disease) => disease.numeric));
const maxPreventable = Math.max(...nationalDiseaseBurden.map((disease) => disease.preventableShare));
const preventableRanking = [...provinceHealthProfiles].sort((a, b) => b.preventableBurden - a.preventableBurden);

export default function PreventableDiseasePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-300 to-sky-500" />
          <div className="p-5 sm:p-7">
            <Link href="/health" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to health
            </Link>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-end">
              <SectionHeader
                eyebrow="Preventable disease cost meter"
                title="What is avoidably loading the health system?"
                body="This view ranks disease burden by prevalence, cost, preventability, hospital pressure, and working-age impact."
              />
              <div className="rounded-md border border-red-300/20 bg-red-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                      Screenshot fuel
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">$52B preventable burden</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      Modeled annual burden from preventable and partly preventable disease categories.
                    </p>
                  </div>
                  <ShareStatButton text="Canada Pulse: preventable and partly preventable disease burden is modeled at $52B annually across diabetes, cardiovascular disease, obesity-linked illness, respiratory disease, mental health, and vision loss." />
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusPill>PHAC-ready</StatusPill>
              <StatusPill>CIHI-ready</StatusPill>
              <StatusPill>Chronic disease surveillance</StatusPill>
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Disease burden ranking</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {nationalDiseaseBurden.map((disease) => (
                <div key={disease.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{disease.label}</p>
                      <p className="text-xs text-stone-500">{disease.note}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-mono text-lg font-semibold text-white">{disease.prevalence}</p>
                      <p className="text-xs text-red-200">{disease.burden}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-400"
                      style={{ width: `${Math.max(8, (disease.numeric / maxDisease) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Preventability meter</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Preventability does not mean blame. It means earlier intervention, better access, screening, housing,
              nutrition, addiction support, and primary care can reduce downstream harm.
            </p>
            <div className="mt-5 grid gap-3">
              {nationalDiseaseBurden.map((disease) => (
                <div key={disease.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{disease.label}</p>
                    <p className="font-mono text-lg font-semibold text-white">{disease.preventableShare}%</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.max(8, (disease.preventableShare / maxPreventable) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Provincial preventable burden</h2>
            </div>
            <ShareStatButton text="Canada Pulse provincial preventable burden: Atlantic provinces, Manitoba, Saskatchewan, Nunavut, and remote regions show the most strained disease-burden signals." />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {preventableRanking.map((profile) => (
              <Link
                key={profile.slug}
                href={`/province/${profile.slug}/health`}
                className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-red-300/50 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{profile.province}</p>
                    <p className="text-xs text-stone-500">{profile.accessStatus} access</p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white">{profile.preventableBurden}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
