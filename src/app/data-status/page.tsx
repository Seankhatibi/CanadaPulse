import Link from "next/link";
import { Activity, ArrowRight, Database, RefreshCw } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { getDbLiveDataPayload, getFallbackLiveDataPayload } from "@/lib/db-live-data";
import { getDbIndicatorValues, getFallbackIndicatorValues } from "@/lib/indicator-values";
import { indicatorCategories } from "@/lib/mock-data";

type RefreshRunView = {
  id: string;
  jobName: string;
  status: string;
  startedAt?: Date | string | null;
};

export default async function DataStatusPage() {
  const livePayload = (await getDbLiveDataPayload().catch(() => null)) ?? getFallbackLiveDataPayload();
  const samples = await Promise.all(
    indicatorCategories.map(async (category) => {
      const dbValues = await getDbIndicatorValues({ geographySlug: "canada", categorySlug: category.slug }).catch(
        () => null,
      );
      const values =
        dbValues && dbValues.length > 0
          ? dbValues
          : getFallbackIndicatorValues({ geographySlug: "canada", categorySlug: category.slug });

      return {
        category,
        values,
      };
    }),
  );

  return (
    <AppShell>
      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>Source transparency</StatusPill>
            <StatusPill>{livePayload.summary.live} live</StatusPill>
            <StatusPill>{livePayload.summary.pending} monitored</StatusPill>
          </div>
          <div className="mt-7">
            <SectionHeader
              eyebrow="Real data backbone"
              title="Where Canada Pulse gets its numbers."
              body="Canada Pulse prioritizes official Canadian public data and keeps source quality visible beside the charts."
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/weekly-pulse"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              Open Weekly Pulse
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/housing"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open housing data
              <Database className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <RefreshCw className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">Latest refresh runs</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {livePayload.latestRuns.length ? (
              livePayload.latestRuns.slice(0, 6).map((run: RefreshRunView) => (
                <div key={run.id} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-white">{run.jobName}</p>
                    <span className="w-fit rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold text-stone-200">
                      {run.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">{run.startedAt?.toString()}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-white/10 bg-black/35 p-4 text-sm text-stone-400">
                Canada Pulse is watching official sources and will show refresh history here as updates arrive.
              </p>
            )}
          </div>
        </GlassPanel>
      </section>

      <section className="mt-5">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">Indicator source status</h2>
          </div>
          <div className="mt-5 grid gap-4">
            {samples.map(({ category, values }) => (
              <div key={category.slug} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  <span className="w-fit rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-300">
                    {values.length} indicators
                  </span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {values.map((value) => (
                    <div key={value.indicatorSlug} className="rounded-md border border-white/10 bg-black/35 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{value.indicatorName}</p>
                        <span className="shrink-0 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-300">
                          {value.status === "live" ? "Live" : value.status === "stale" ? "Stale" : "Monitored"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        {value.source.publisher} | {value.latest?.label ?? value.latest?.period ?? "No live value"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
