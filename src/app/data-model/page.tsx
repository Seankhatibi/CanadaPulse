import { Database, TableProperties } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { liveDataConnections, getLiveDataSummary } from "@/lib/live-data-registry";
import {
  dataSources,
  geographies,
  indicators,
  indicatorCategories,
  timeSeriesValues,
} from "@/lib/mock-data";
import { getIndicatorCountByCategory } from "@/lib/data/mock-queries";

const schemaTables = [
  "Geography",
  "IndicatorCategory",
  "Indicator",
  "TimeSeriesValue",
  "DataSource",
  "SourceDataset",
  "IndicatorSourceMap",
  "DataRefreshRun",
  "ReleaseEvent",
  "GeographyScore",
  "CityMetric",
  "PopulationFlow",
  "CapacitySignal",
  "ShareCard",
  "UserScenario",
];

export default function DataModelPage() {
  const indicatorCounts = getIndicatorCountByCategory();
  const liveSummary = getLiveDataSummary();

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>PostgreSQL ready</StatusPill>
            <StatusPill>Prisma schema</StatusPill>
            <StatusPill>{liveSummary.live} live feeds</StatusPill>
            <StatusPill>{liveSummary.pending} imports pending</StatusPill>
          </div>
          <div className="mt-8">
            <SectionHeader
              eyebrow="Data model"
              title="The app now has a real data backbone."
              body="Canada Pulse has a database schema, source registry, live release feeds, and clear table-import status for datasets that still need official values loaded."
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Geographies", value: geographies.length },
              { label: "Categories", value: indicatorCategories.length },
              { label: "Indicators", value: indicators.length },
              { label: "Time-series rows", value: timeSeriesValues.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <p className="text-xs text-stone-600 dark:text-stone-400">{stat.label}</p>
                <p className="mt-2 font-mono text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-red-600 dark:text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Prisma tables</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {schemaTables.map((table) => (
              <div
                key={table}
                className="flex items-center gap-3 rounded-md border border-black/10 bg-white/65 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <TableProperties className="size-4 text-stone-500" aria-hidden="true" />
                <span className="font-mono text-sm">{table}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Live data connection map</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{liveSummary.read}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {liveDataConnections.map((source) => (
              <a
                key={source.slug}
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-black/10 bg-white/65 p-4 transition hover:border-red-500/50 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10"
              >
                <p className="font-semibold">{source.label}</p>
                <p className="mt-1 text-xs text-stone-500">{source.publisher} | {source.refreshCadence}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">{source.implementation}</p>
                <span className="mt-3 inline-flex rounded-md border border-white/10 bg-stone-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-stone-950">
                  {source.status}
                </span>
              </a>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Source registry</h2>
          <div className="mt-4 grid gap-3">
            {dataSources.map((source) => (
              <div
                key={source.slug}
                className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <p className="font-semibold">{source.name}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400">
                  {source.refreshNote}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Modeled indicator categories</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {indicatorCounts.map((category) => (
              <div
                key={category.slug}
                className="rounded-md border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{category.name}</p>
                  <span className="rounded-md bg-stone-950 px-2 py-1 font-mono text-xs text-white dark:bg-white dark:text-stone-950">
                    {category.count}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
