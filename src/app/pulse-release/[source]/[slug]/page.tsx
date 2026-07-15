import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Database,
  ExternalLink,
  Minus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReleaseVisualBreakdowns } from "@/components/release-visual-breakdowns";
import { ShareStatButton } from "@/components/share-stat-button";
import { findHubRelease } from "@/lib/release-hub";
import { buildReleaseIntelligence, type ResearchMetric } from "@/lib/release-intelligence";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import { getProvinceByName } from "@/lib/province-directory";

export const dynamic = "force-dynamic";

function MetricArrow({ metric }: { metric: ResearchMetric }) {
  const className =
    metric.meaning === "positive"
      ? "bg-emerald-100 text-emerald-800"
      : metric.meaning === "negative"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  const Icon = metric.direction === "up" ? ArrowUp : metric.direction === "down" ? ArrowDown : Minus;

  return (
    <span className={`inline-flex size-8 items-center justify-center rounded-full ${className}`}>
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

function MetricCard({ metric }: { metric: ResearchMetric }) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">{metric.label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-stone-950">{metric.display}</p>
        </div>
        <MetricArrow metric={metric} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {metric.changeDisplay ? (
          <span className="rounded-md bg-stone-950 px-2 py-1 font-mono font-black text-white">
            {metric.changeDisplay}
          </span>
        ) : null}
        {metric.previousDisplay ? <span className="text-stone-500">previous {metric.previousDisplay}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{metric.plainEnglish}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {metric.period ?? metric.changePeriod ?? "Latest official period"}
      </p>
    </article>
  );
}

export default async function PulseReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string; slug: string }>;
  searchParams?: Promise<{ date?: string; url?: string }>;
}) {
  const { source, slug } = await params;
  const query = await searchParams;
  const release = await findHubRelease(source, slug, query?.date, query?.url);

  if (!release) notFound();

  const intelligence = buildReleaseIntelligence(release);
  const hasMetrics = intelligence.metrics.length > 0;
  const isNarrativeReport = intelligence.evidenceLevel === "Official report analyzed";

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-red-700">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Canada Pulse
        </Link>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-300/30">
          <div className="h-2 bg-gradient-to-r from-red-700 via-red-500 to-amber-400" />
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]">
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-red-800">{release.affectedAreas[0] ?? "Economy"}</span>
                <span className="rounded-md bg-stone-100 px-2.5 py-1 text-stone-700">{release.publisher}</span>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">{intelligence.evidenceLevel}</span>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-stone-950 sm:text-6xl">{release.title}</h1>
              <p className="mt-5 max-w-3xl text-xl font-bold leading-8 text-stone-800">{intelligence.verdict}</p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">{release.plainEnglishSummary}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <ShareStatButton text={release.socialSummary} />
                <a
                  href={release.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-800 hover:border-red-300"
                >
                  Official release
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="grid content-start gap-3 rounded-xl bg-stone-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Release record</p>
              {[
                { label: "Released", value: formatReleaseDate(release.releaseDate), icon: CalendarDays },
                { label: "Reference period", value: formatReferencePeriod(release.referencePeriod), icon: Database },
                { label: "Geography", value: release.geographyLevel, icon: CheckCircle2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 border-t border-white/10 pt-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-stone-400">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">{isNarrativeReport ? "Report type" : "Key metrics"}</p>
              <h2 className="mt-1 text-3xl font-black text-stone-950">
                {isNarrativeReport ? "Narrative analysis, without invented scores" : "What changed in the release"}
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              {isNarrativeReport ? "Topics come from the official report text." : "Values are not normalized across different units."}
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hasMetrics ? (
              intelligence.metrics.map((metric) => <MetricCard key={`${metric.label}-${metric.display}`} metric={metric} />)
            ) : (
              <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
                {isNarrativeReport
                  ? "This is a narrative report. Canada Pulse identifies its main topics below without presenting text themes as measured statistics."
                  : "The official release was detected, but structured table values are not available yet."}
              </p>
            )}
          </div>
        </section>

        <section className={`grid gap-5 ${hasMetrics ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Research read</p>
            <h2 className="mt-2 text-2xl font-black text-stone-950">Five facts worth carrying forward</h2>
            <div className="mt-5 grid gap-3">
              {(intelligence.takeaways.length ? intelligence.takeaways : release.headlineFacts).slice(0, 5).map((takeaway, index) => (
                <div key={takeaway} className="flex gap-3 rounded-lg bg-stone-50 p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-700 font-mono text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-stone-700">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>

          {hasMetrics ? <div className="grid gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-lg font-black text-emerald-950">Improving signals</h2>
              <div className="mt-3 space-y-2">
                {intelligence.positive.length ? intelligence.positive.map((metric) => (
                  <p key={metric.label} className="text-sm text-emerald-900">{metric.label}: <strong>{metric.display}</strong></p>
                )) : <p className="text-sm text-emerald-900">No clearly improving metric was identified.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-lg font-black text-red-950">Pressure signals</h2>
              <div className="mt-3 space-y-2">
                {intelligence.negative.length ? intelligence.negative.map((metric) => (
                  <p key={metric.label} className="text-sm text-red-900">{metric.label}: <strong>{metric.display}</strong></p>
                )) : <p className="text-sm text-red-900">No clearly worsening metric was identified.</p>}
              </div>
            </div>
          </div> : null}
        </section>

        <ReleaseVisualBreakdowns charts={release.chartPayloads} />

        {intelligence.provinceRank.length ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Provincial breakdown</p>
                <h2 className="mt-1 text-2xl font-black text-stone-950">How the release differs across Canada</h2>
              </div>
              <Link href="/compare" className="inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">
                Compare provinces
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-5 grid gap-2 md:hidden">
              {intelligence.provinceRank.map((province) => {
                const provinceRecord = getProvinceByName(province.province);
                return <div key={province.province} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-black text-red-700">{String(province.comparableRank).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        {provinceRecord ? <Link href={`/province/${provinceRecord.slug}`} className="font-black text-stone-950 hover:text-red-800">{province.province}</Link> : <p className="font-black text-stone-950">{province.province}</p>}
                        <p className="shrink-0 font-mono text-lg font-black text-stone-950">{province.value}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{province.note}</p>
                    </div>
                  </div>
                </div>;
              })}
            </div>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.12em] text-stone-500">
                    <th className="px-3 py-3">Rank</th>
                    <th className="px-3 py-3">Province</th>
                    <th className="px-3 py-3">Value</th>
                    <th className="px-3 py-3">Change/context</th>
                  </tr>
                </thead>
                <tbody>
                  {intelligence.provinceRank.map((province) => {
                    const provinceRecord = getProvinceByName(province.province);
                    return <tr key={province.province} className="border-b border-stone-100">
                      <td className="px-3 py-3 font-mono text-sm text-stone-500">{province.comparableRank}</td>
                      <td className="px-3 py-3 font-bold text-stone-950">
                        {provinceRecord ? <Link href={`/province/${provinceRecord.slug}`} className="hover:text-red-800">{province.province}</Link> : province.province}
                      </td>
                      <td className="px-3 py-3 font-mono font-black text-stone-950">{province.value}</td>
                      <td className="px-3 py-3 text-sm text-stone-600">{province.note}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black text-stone-950">Source trail</h2>
          <p className="mt-2 text-sm text-stone-600">Every interpretation above is attached to the official release or table used.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {release.sourceLinks.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 hover:border-red-300 hover:text-red-800"
              >
                {link.label}
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
