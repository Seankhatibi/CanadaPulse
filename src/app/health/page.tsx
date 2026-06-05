import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, Hospital, Stethoscope } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import {
  healthSnapshot,
  nationalDiseaseBurden,
  nationalSystemMetrics,
  provinceHealthProfiles,
} from "@/lib/health-data";

const maxSystem = Math.max(...nationalSystemMetrics.map((metric) => metric.numeric));
const maxDisease = Math.max(...nationalDiseaseBurden.map((disease) => disease.numeric));
const provinceRanking = [...provinceHealthProfiles].sort((a, b) => b.waitPressure - a.waitPressure);

export default function HealthPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-rose-600 via-white to-sky-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Health system</StatusPill>
              <StatusPill>{healthSnapshot.period}</StatusPill>
              <StatusPill>CIHI + PHAC watch</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-end">
              <SectionHeader
                eyebrow="Healthcare burden"
                title="What is really hurting Canada’s health system?"
                body="Track spending, family doctor access, wait pressure, chronic disease, mental health, diabetes, cardiovascular disease, obesity-linked illness, vision loss and preventable burden."
              />
              <div className="rounded-md border border-rose-300/20 bg-rose-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200">Canada Pulse read</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{healthSnapshot.read}</p>
                  </div>
                  <ShareStatButton text={`Canada health pulse: spending ${healthSnapshot.totalSpending}, ${healthSnapshot.spendingPerPerson} per person, doctor access ${healthSnapshot.doctorAccess}, preventable burden ${healthSnapshot.preventableBurden}.`} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Health spending", healthSnapshot.totalSpending, "system cost"],
                ["Per Canadian", healthSnapshot.spendingPerPerson, "spending per person"],
                ["Doctor access", healthSnapshot.doctorAccess, "primary-care signal"],
                ["Preventable burden", healthSnapshot.preventableBurden, "modeled annual cost"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <p className="text-xs text-stone-500">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-rose-200">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.92fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Hospital className="size-5 text-rose-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">System pressure</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {nationalSystemMetrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{metric.label}</p>
                      <p className="text-xs text-stone-500">{metric.note}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-white">{metric.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-400"
                      style={{ width: `${Math.max(8, (metric.numeric / maxSystem) * 100)}%` }}
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
              {nationalDiseaseBurden.map((disease) => (
                <Link
                  key={disease.label}
                  href="/health/preventable-disease"
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-rose-300/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
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
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-rose-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Most strained provinces</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {provinceRanking.slice(0, 7).map((profile) => (
                <Link
                  key={profile.slug}
                  href={`/province/${profile.slug}/health`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-rose-300/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{profile.province}</p>
                      <p className="text-xs text-stone-500">{profile.accessStatus} access | chronic burden {profile.chronicBurden}/100</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{profile.waitPressure}</p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-5 text-rose-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Preventable disease cost meter</h2>
              </div>
              <ShareStatButton text="Canada Pulse preventable disease meter: diabetes, obesity-linked disease, cardiovascular disease, mental health, respiratory disease, and vision loss are modeled as major health-system burdens." />
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              The viral health story is not “spend more or less.” It is which preventable diseases are filling hospitals,
              reducing quality of life, and making the system more expensive.
            </p>
            <Link
              href="/health/preventable-disease"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Open preventable disease
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </GlassPanel>
        </section>
      </div>
    </AppShell>
  );
}
