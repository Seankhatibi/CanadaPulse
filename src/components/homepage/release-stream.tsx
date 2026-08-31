import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { countStructuredMetrics, type NormalizedRelease } from "@/lib/release-hub";

function timestamp(release: NormalizedRelease) {
  const parsed = Date.parse(release.releaseDate.length === 7 ? `${release.releaseDate}-01` : release.releaseDate);
  return Number.isFinite(parsed) ? parsed : 0;
}

function editorialRank(release: NormalizedRelease) {
  return release.releaseType === "valet-rate-observation" ? 0 : 1;
}

export function ReleaseStream({ releases }: { releases: NormalizedRelease[] }) {
  const recent = [...new Map(
    releases
      .filter((release) => release.status === "live" && timestamp(release) > Date.parse("2020-01-01"))
      .map((release) => [release.id, release]),
  ).values()]
    .sort((a, b) => timestamp(b) - timestamp(a) || editorialRank(b) - editorialRank(a) || b.importanceScore - a.importanceScore)
    .slice(0, 6);

  return (
    <section className="border-y border-stone-300 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">More data drops</p>
          <h2 className="mt-1 text-3xl font-black text-stone-950 dark:text-white">New official releases, as they land</h2>
        </div>
        <Link href="/data-status" className="inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">
          Check source freshness
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid border-t border-stone-300 md:grid-cols-2">
        {recent.map((release) => {
          const metricCount = countStructuredMetrics(release);
          return (
          <Link key={release.id} href={release.href} className="group border-b border-stone-300 bg-white/55 p-4 transition hover:bg-white md:odd:border-r">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-stone-700">{release.publisher}</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {release.releaseDate}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-black leading-snug text-stone-950 group-hover:text-red-800">{release.title}</h3>
            <p className="mt-2 line-clamp-1 text-sm leading-6 text-stone-600">{release.plainEnglishSummary}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-stone-500">{metricCount ? `${metricCount} official metrics` : "Official report summary"}</span>
              <ArrowRight className="size-4 text-red-700 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
