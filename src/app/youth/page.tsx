import Link from "next/link";
import { ArrowRight, Baby, BriefcaseBusiness, GraduationCap, Home, PiggyBank } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { youthQualityProfiles, youthSnapshot } from "@/lib/youth-quality-data";

const rankedYouth = [...youthQualityProfiles].sort((a, b) => b.youthScore - a.youthScore);
const maxYouth = Math.max(...youthQualityProfiles.map((profile) => profile.youthScore));

export default function YouthPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-fuchsia-600 via-white to-sky-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Youth Future Index</StatusPill>
              <StatusPill>{youthSnapshot.period}</StatusPill>
              <StatusPill>Gen Z / young family lens</StatusPill>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-end">
              <SectionHeader
                eyebrow="Can young Canadians build a life here?"
                title="The future score young people will argue about."
                body="This page tracks youth jobs, rent burden, down-payment years, childcare, student pressure, family formation, and whether a province still feels possible."
              />
              <div className="rounded-md border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200">Youth read</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{youthSnapshot.read}</p>
                  </div>
                  <ShareStatButton text="Canada Pulse Youth Future Index: youth unemployment 13.4%, rent burden under 35 at 42%, and modeled down-payment years at 9.6." />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Youth unemployment", youthSnapshot.youthUnemployment, "job-entry pressure", BriefcaseBusiness],
                ["Rent burden under 35", youthSnapshot.rentBurdenUnder35, "paycheque squeeze", Home],
                ["Down-payment years", youthSnapshot.downPaymentYears, "ownership gap", PiggyBank],
                ["Childcare", youthSnapshot.childcareCost, "family formation", Baby],
              ].map(([label, value, note, Icon]) => (
                <div key={label as string} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <Icon className="size-5 text-fuchsia-300" aria-hidden="true" />
                  <p className="mt-5 text-xs text-stone-500">{label as string}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-white">{value as string}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-fuchsia-200">{note as string}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-fuchsia-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Best provinces for young adults</h2>
              </div>
              <ShareStatButton text="Canada Pulse Youth Future ranking: Alberta, Saskatchewan, Quebec, Manitoba, and Yukon currently lead for young Canadians." />
            </div>
            <div className="mt-5 grid gap-3">
              {rankedYouth.map((profile, index) => (
                <Link
                  key={profile.slug}
                  href={`/best-province?stage=young-professional`}
                  className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-fuchsia-300/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        #{index + 1} {profile.province}
                      </p>
                      <p className="text-xs text-stone-500">{profile.futureRead}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{profile.youthScore}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-400"
                      style={{ width: `${Math.max(8, (profile.youthScore / maxYouth) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="text-lg font-semibold text-white">What this index measures</h2>
            <div className="mt-5 grid gap-3">
              {[
                "Can you get a foothold in the labour market?",
                "Can you rent without losing the whole paycheque?",
                "Can you save a down payment before giving up?",
                "Can you afford childcare and family formation?",
                "Does the province attract or repel young people?",
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-black/30 p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-fuchsia-600 font-mono text-xs font-semibold text-white">
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
              Find your best province
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </GlassPanel>
        </section>
      </div>
    </AppShell>
  );
}
