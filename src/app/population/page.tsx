import Link from "next/link";
import { Home, Stethoscope, Users } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import {
  nationalCapacitySignals,
  nationalPopulationFlows,
  nationalPopulationHeadlines,
  provincePopulationPressure,
} from "@/lib/population-data";

const maxPressure = Math.max(...provincePopulationPressure.map((province) => province.pressureScore));
const topPressure = [...provincePopulationPressure].sort((a, b) => b.pressureScore - a.pressureScore).slice(0, 6);

export default function PopulationPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <GlassPanel className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-sky-600 via-white to-red-600" />
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap gap-2">
                <StatusPill>Neutral data-first framing</StatusPill>
                <StatusPill>IRCC + StatCan + CMHC ready</StatusPill>
                <StatusPill>Province drilldowns</StatusPill>
              </div>
              <div className="mt-8">
                <SectionHeader
                  eyebrow="Population pressure"
                  title="Is Canada growing faster than its systems?"
                  body="Start with the national pressure, then show exactly which provinces feel it most and whether housing, jobs, healthcare, and infrastructure are absorbing the growth."
                />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {nationalPopulationHeadlines.map((item) => (
                  <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                    <p className="text-xs text-stone-500">{item.label}</p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-400">{item.detail}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-red-300">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Pressure meter</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Where growth feels heaviest</h2>
              </div>
              <Users className="size-5 text-red-300" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3">
              {topPressure.map((province) => (
                <Link
                  key={province.slug}
                  href={`/population/${province.slug}`}
                  className="block rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/10"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {province.province} <span className="text-xs text-stone-500">({province.abbr})</span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">{province.note}</p>
                    </div>
                    <p className="font-mono text-2xl font-semibold text-white sm:text-right">{province.pressureScore}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-red-600"
                      style={{ width: `${Math.max(8, (province.pressureScore / maxPressure) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Immigration and resident-flow breakdown</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Separate permanent residents, work permits, study permits, refugees/asylum, and investor/business streams so the app stays specific instead of political.
            </p>
            <div className="mt-5 grid gap-3">
              {nationalPopulationFlows.map((item) => (
                <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-stone-500">{item.note}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white sm:text-right sm:text-2xl">{item.value}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${item.share}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono text-xs text-stone-400">{item.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Population vs capacity</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              The viral chart is not just immigration. It is growth beside homes, jobs, healthcare access, schools, and infrastructure.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {nationalCapacitySignals.map((signal) => (
                <div key={signal.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                    <p className="font-semibold text-white">{signal.label}</p>
                    <span className="w-fit rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                      {signal.status}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-2xl font-semibold text-white">{signal.value}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{signal.note}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-600" style={{ width: `${signal.numeric}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">The shareable comparison</h2>
              <p className="mt-1 text-sm text-stone-400">
                Each province card opens into local flow categories and capacity stress. This keeps the product curiosity-led and neutral.
              </p>
            </div>
            <Link
              href="/housing"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Compare to housing
              <Home className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
