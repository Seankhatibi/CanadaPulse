import Link from "next/link";
import { ArrowRight, Clock, HeartPulse, Leaf, Shield, Smile } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { qualitySnapshot, youthQualityProfiles } from "@/lib/youth-quality-data";

const rankedLife = [...youthQualityProfiles].sort((a, b) => b.lifeScore - a.lifeScore);
const maxLife = Math.max(...youthQualityProfiles.map((profile) => profile.lifeScore));

const headlineMetrics = [
  { label: "Life satisfaction", value: qualitySnapshot.lifeSatisfaction, note: "wellbeing proxy", icon: Smile },
  { label: "Violent crime rate", value: qualitySnapshot.violentCrimeRate, note: "safety signal", icon: Shield },
  { label: "Commute pressure", value: qualitySnapshot.commutePressure, note: "daily time cost", icon: Clock },
  { label: "Opioid pressure", value: qualitySnapshot.opioidPressure, note: "health and safety burden", icon: HeartPulse },
];

export default function QualityOfLifePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-teal-500 via-white to-red-600" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Quality of Life</StatusPill>
              <StatusPill>{qualitySnapshot.period}</StatusPill>
              <StatusPill>Livability engine</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-end">
              <SectionHeader
                eyebrow="Is life actually livable?"
                title="The non-GDP score Canadians feel every day."
                body="Quality of life tracks the data people feel outside a spreadsheet: safety, commute, health access, climate risk, family life, loneliness, childcare, and everyday livability."
              />
              <div className="rounded-md border border-teal-300/20 bg-teal-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Livability read</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{qualitySnapshot.read}</p>
                  </div>
                  <ShareStatButton text="Canada Pulse Quality of Life: a livability score for safety, commute, healthcare access, climate risk, family life, and daily stress." />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {headlineMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                    <Icon className="size-5 text-teal-300" aria-hidden="true" />
                    <p className="mt-5 text-xs text-stone-500">{metric.label}</p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-teal-200">{metric.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="size-5 text-teal-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Livability ranking</h2>
              </div>
              <ShareStatButton text="Canada Pulse Quality of Life ranking: BC, Quebec, Alberta, Yukon, Ontario, and Nova Scotia lead the source-ready demo livability model." />
            </div>
            <div className="mt-5 grid gap-3">
              {rankedLife.map((profile, index) => (
                <Link
                  key={profile.slug}
                  href={`/best-province?stage=retiree`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-teal-300/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        #{index + 1} {profile.province}
                      </p>
                      <p className="text-xs text-stone-500">{profile.qualityRead}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{profile.lifeScore}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400"
                      style={{ width: `${Math.max(8, (profile.lifeScore / maxLife) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="text-lg font-semibold text-white">What this score includes</h2>
            <div className="mt-5 grid gap-3">
              {[
                "Safety and crime pressure",
                "Healthcare access and wait-time drag",
                "Commute time and transit stress",
                "Life satisfaction and social wellbeing",
                "Climate, wildfire, flood, and air-quality risk",
                "Childcare, family life, and everyday affordability",
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-black/30 p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-teal-600 font-mono text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-stone-300">{item}</p>
                </div>
              ))}
            </div>
            <Link
              href="/best-province"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Rank by life stage
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </GlassPanel>
        </section>
      </div>
    </AppShell>
  );
}
