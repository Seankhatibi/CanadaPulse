import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Database, Radio, Server } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSystemHealth } from "@/lib/system-health";

export const dynamic = "force-dynamic";

export default async function DataStatusPage() {
  const health = await getSystemHealth();

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xl shadow-stone-300/30 sm:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]">
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">Official-source first</span>
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-stone-700">Generated {new Date(health.generatedAt).toLocaleString("en-CA")}</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black text-stone-950 sm:text-6xl">Data trust and freshness</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
            Canada Pulse shows where each release came from, when it was published, how many structured metrics were loaded, and whether durable history is active.
          </p>
          <Link href="/methodology" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">Read the evidence methodology <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Latest official release",
              value: health.latestRelease?.releaseDate ?? "Unavailable",
              note: health.latestRelease?.title ?? "No live release detected",
              icon: Clock3,
            },
            {
              label: "Scheduled refresh",
              value: health.scheduler === "configured" ? "Configured" : "Not configured",
              note: "Two weekday checks straddle 11:00 a.m. Eastern so daylight-saving changes do not move the release window out of view.",
              icon: Radio,
            },
            {
              label: "Historical archive",
              value: health.persistence === "database" ? "Archive active" : health.persistence === "degraded" ? "Needs attention" : "Live source mode",
              note: health.persistence === "database"
                ? `${health.archive?.releaseEvents ?? 0} releases stored; last successful refresh ${health.archive?.latestSuccessfulRefresh ? new Date(health.archive.latestSuccessfulRefresh).toLocaleString("en-CA") : "unavailable"}.`
                : health.persistence === "degraded"
                  ? "The database is connected, but a successful archive refresh has not been verified."
                  : "Current official values load live while durable archive setup is pending.",
              icon: Database,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <Icon className="size-5 text-red-700" aria-hidden="true" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.13em] text-stone-500">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-stone-950">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
              </article>
            );
          })}
        </section>

        {health.warnings.length ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-800" aria-hidden="true" />
              <h2 className="text-lg font-black text-amber-950">Known limitations</h2>
            </div>
            <div className="mt-3 space-y-2">
              {health.warnings.map((warning) => <p key={warning} className="text-sm text-amber-900">{warning}</p>)}
            </div>
          </section>
        ) : null}

        {health.refreshRuns.length ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Radio className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-stone-950">Recent source refreshes</h2>
            </div>
            <div className="mt-4">
              <div className="hidden grid-cols-[1.6fr_0.65fr_1fr_0.45fr_0.45fr] gap-4 border-b border-stone-200 pb-3 text-xs font-black uppercase tracking-[0.1em] text-stone-500 md:grid">
                <span>Job</span><span>Status</span><span>Finished</span><span>Fetched</span><span>Changed</span>
              </div>
              <div className="divide-y divide-stone-100">
                {health.refreshRuns.map((run) => (
                  <article key={run.id} className="grid gap-3 py-4 md:grid-cols-[1.6fr_0.65fr_1fr_0.45fr_0.45fr] md:items-center md:gap-4">
                    <p className="font-bold text-stone-950">{run.jobName}</p>
                    <div><span className={`rounded-md px-2 py-1 text-xs font-black ${run.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : run.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{run.status.toLowerCase()}</span></div>
                    <p className="text-sm text-stone-600">{run.finishedAt ? new Date(run.finishedAt).toLocaleString("en-CA") : "Running"}</p>
                    <p className="text-sm text-stone-600 md:font-mono"><span className="font-bold text-stone-950 md:hidden">Fetched: </span>{run.rowsFetched.toLocaleString("en-CA")}</p>
                    <p className="text-sm text-stone-600 md:font-mono"><span className="font-bold text-stone-950 md:hidden">Changed: </span>{run.rowsChanged.toLocaleString("en-CA")}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Server className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-stone-950">Source connections</h2>
            </div>
            <div className="mt-4 space-y-3">
              {health.sourceStatuses.map((source) => (
                <div key={source.source} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-stone-950">{source.source}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${source.status === "live" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                      {source.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{source.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-stone-950">Recent official releases</h2>
            </div>
            <div className="mt-4 divide-y divide-stone-200">
              {health.recentReleases.map((release) => (
                <Link key={`${release.publisher}-${release.title}`} href={release.href} className="flex flex-col gap-2 py-4 hover:text-red-800 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-stone-950">{release.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{release.publisher} · {release.releaseDate}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 text-xs font-black text-red-700">
                    {release.evidence === "structured" ? `${release.metrics} metrics` : release.evidence === "narrative" ? "report analysis" : "summary"}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
