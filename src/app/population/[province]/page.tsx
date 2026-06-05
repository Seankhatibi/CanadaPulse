import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Home, Users } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { provinceSymbols } from "@/lib/canada-pulse-data";
import { getPopulationProvince, provincePopulationPressure } from "@/lib/population-data";

export function generateStaticParams() {
  return provincePopulationPressure.map((province) => ({ province: province.slug }));
}

export default async function PopulationProvincePage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;
  const province = getPopulationProvince(provinceSlug);

  if (!province) {
    notFound();
  }

  const symbol = provinceSymbols[province.slug];
  const maxFlow = Math.max(...province.flows.map((flow) => flow.numeric));

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${symbol?.accent ?? "from-sky-600 to-red-600"}`} />
          <div className="p-5 sm:p-7">
            <Link
              href="/population"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to population pressure
            </Link>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.42fr]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-red-600 text-white">
                  <Users className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{province.abbr} drilldown</StatusPill>
                    <StatusPill>{symbol?.symbol ?? "Provincial identity"}</StatusPill>
                    <StatusPill>Population snapshot</StatusPill>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                    Population pressure in {province.province}
                  </p>
                  <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                    {province.province}: {province.pressureScore}/100 pressure
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-stone-300">{province.note}</p>
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-black/35 p-5">
                <p className="text-xs text-stone-500">People added per completed home</p>
                <p className="mt-3 font-mono text-4xl font-semibold text-white sm:text-5xl">
                  {province.peoplePerHome}
                </p>
                <p className="mt-4 text-xs leading-5 text-stone-500">
                  {province.peopleAdded} people added vs {province.housingCompletions} completions.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Population growth", value: province.populationGrowth },
                { label: "People added", value: province.peopleAdded },
                { label: "Temporary residents", value: province.temporaryResidentShare },
                { label: "Jobs absorption", value: province.jobsAbsorption },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-5">
            <h2 className="text-lg font-semibold text-white">Local immigration and resident flows</h2>
            <div className="mt-5 grid gap-3">
              {province.flows.map((flow) => (
                <div key={flow.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{flow.label}</p>
                      <p className="mt-1 text-xs text-stone-500">{flow.note}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white sm:text-right sm:text-2xl">{flow.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${Math.max(8, (flow.numeric / maxFlow) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="text-lg font-semibold text-white">Capacity stress test</h2>
            <div className="mt-5 grid gap-3">
              {province.capacity.map((signal) => (
                <div key={signal.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                    <p className="font-semibold text-white">{signal.label}</p>
                    <span className="w-fit rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                      {signal.status}
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-2xl font-semibold text-white">{signal.value}</p>
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
              <h2 className="text-lg font-semibold text-white">Next question Canadians ask</h2>
              <p className="mt-1 text-sm text-stone-400">
                Does housing supply keep up with this province&apos;s growth?
              </p>
            </div>
            <Link
              href={`/province/${province.slug}/housing`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Open housing engine
              <Home className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
