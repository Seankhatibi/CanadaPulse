import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, GraduationCap, Heart, Home, UserPlus } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { LifeStage, lifeStageLabels, rankForStage } from "@/lib/youth-quality-data";

const stageOptions: Array<{ slug: LifeStage; icon: typeof GraduationCap; description: string }> = [
  { slug: "student", icon: GraduationCap, description: "school, rent, transit, entry jobs" },
  { slug: "young-professional", icon: BriefcaseBusiness, description: "wages, rent, career, savings" },
  { slug: "new-family", icon: Home, description: "childcare, housing, healthcare, safety" },
  { slug: "business-owner", icon: Building2, description: "taxes, demand, labour, costs" },
  { slug: "retiree", icon: Heart, description: "healthcare, safety, costs, lifestyle" },
  { slug: "newcomer", icon: UserPlus, description: "jobs, housing, services, community" },
];

function getStage(stage?: string): LifeStage {
  return stageOptions.some((option) => option.slug === stage) ? (stage as LifeStage) : "young-professional";
}

export default async function BestProvincePage({
  searchParams,
}: {
  searchParams?: Promise<{ stage?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedStage = getStage(resolvedSearchParams?.stage);
  const ranking = rankForStage(selectedStage);
  const maxScore = Math.max(...ranking.map((profile) => profile.stageScores[selectedStage]));
  const winner = ranking[0];

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-white to-teal-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Best province engine</StatusPill>
              <StatusPill>{lifeStageLabels[selectedStage]}</StatusPill>
              <StatusPill>Shareable ranking</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <SectionHeader
                eyebrow="Where should you build a life?"
                title={`Best province for a ${lifeStageLabels[selectedStage].toLowerCase()}`}
                body="Pick a life stage and Canada Pulse re-ranks provinces using affordability, jobs, healthcare, safety, childcare, taxes, lifestyle, and opportunity."
              />
              <div className="rounded-md border border-emerald-300/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Current winner</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{winner.province}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      Score: {winner.stageScores[selectedStage]}/100 for {lifeStageLabels[selectedStage].toLowerCase()}.
                    </p>
                  </div>
                  <ShareStatButton text={`Canada Pulse ranks ${winner.province} as the best province for a ${lifeStageLabels[selectedStage].toLowerCase()} in the current Canada Pulse model.`} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {stageOptions.map((option) => {
                const Icon = option.icon;
                const active = option.slug === selectedStage;

                return (
                  <Link
                    key={option.slug}
                    href={`/best-province?stage=${option.slug}`}
                    className={`rounded-md border p-4 transition ${
                      active
                        ? "border-red-300 bg-red-600/25"
                        : "border-white/10 bg-black/30 hover:border-red-300/50 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="size-5 text-red-200" aria-hidden="true" />
                    <p className="mt-4 text-sm font-semibold text-white">{lifeStageLabels[option.slug]}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">{option.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">Province ranking</h2>
          <div className="mt-5 grid gap-3">
            {ranking.map((profile, index) => {
              const score = profile.stageScores[selectedStage];

              return (
                <Link
                  key={profile.slug}
                  href={`/province/${profile.slug}`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-red-300/50 hover:bg-white/10"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        #{index + 1} {profile.province}
                      </p>
                      <p className="text-xs text-stone-500">
                        Youth {profile.youthScore}/100 | Quality {profile.lifeScore}/100
                      </p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{score}/100</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-teal-400"
                      style={{ width: `${Math.max(8, (score / maxScore) * 100)}%` }}
                    />
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                    Open province
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
