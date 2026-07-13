import Link from "next/link";
import { ArrowRight, CalendarDays, Database, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { formatReleaseDate } from "@/lib/release-format";
import { filterReleaseArchive, getReleaseArchive } from "@/lib/release-archive";

export const dynamic = "force-dynamic";

export default async function ReleasesPage({ searchParams }: { searchParams?: Promise<{ q?: string; publisher?: string; status?: string }> }) {
  const query = await searchParams;
  const archive = await getReleaseArchive();
  const releases = filterReleaseArchive(archive, query?.q, query?.publisher, query?.status);
  const publishers = [...new Set(archive.map((release) => release.publisher))].sort();

  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]"><span className="rounded-md bg-red-700 px-2.5 py-1 text-white">Release archive</span><span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">{archive.length} official items</span></div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black text-stone-950 sm:text-6xl">Search the data behind Canada&apos;s latest economic story</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">Browse structured Canada Pulse briefs and the wider Statistics Canada Daily feed. Evidence status shows which releases already have parsed values.</p>
        </section>

        <form className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_13rem_11rem_auto]" action="/releases">
          <label className="relative"><span className="sr-only">Search releases</span><Search className="absolute left-3 top-3.5 size-4 text-stone-400" aria-hidden="true" /><input name="q" defaultValue={query?.q} placeholder="Jobs, housing, inflation..." className="h-11 w-full rounded-md border border-stone-300 bg-white pl-10 pr-3 text-sm text-stone-950" /></label>
          <select name="publisher" defaultValue={query?.publisher ?? "all"} aria-label="Filter by publisher" className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-950"><option value="all">All publishers</option>{publishers.map((publisher) => <option key={publisher} value={publisher}>{publisher}</option>)}</select>
          <select name="status" defaultValue={query?.status ?? "all"} aria-label="Filter by evidence status" className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-950"><option value="all">All evidence</option><option value="structured">Structured values</option><option value="summary">Summary only</option><option value="source-linked">Source linked</option></select>
          <button type="submit" className="h-11 rounded-md bg-stone-950 px-5 text-sm font-black text-white hover:bg-red-800">Search</button>
        </form>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Results</p><h2 className="mt-2 text-3xl font-black text-stone-950">{releases.length} releases found</h2></div>{query?.q || (query?.publisher && query.publisher !== "all") || (query?.status && query.status !== "all") ? <Link href="/releases" className="text-sm font-black text-red-700">Clear filters</Link> : null}</div>
          <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
            {releases.slice(0, 80).map((release) => (
              <article key={release.id} className="grid gap-4 py-5 lg:grid-cols-[10rem_1fr_auto] lg:items-start">
                <div><p className="text-xs font-black uppercase tracking-[0.1em] text-stone-500">{release.publisher}</p><p className="mt-2 inline-flex items-center gap-2 text-xs text-stone-500"><CalendarDays className="size-3.5" aria-hidden="true" />{formatReleaseDate(release.releaseDate)}</p></div>
                <div><h3 className="text-xl font-black leading-snug text-stone-950">{release.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{release.summary}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-md px-2 py-1 text-xs font-black ${release.status === "structured" ? "bg-emerald-50 text-emerald-800" : release.status === "summary" ? "bg-amber-50 text-amber-900" : "bg-stone-100 text-stone-700"}`}>{release.status === "structured" ? `${release.metricCount} structured values` : release.status.replace("-", " ")}</span>{release.areas.slice(0, 3).map((area) => <span key={area} className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">{area}</span>)}</div></div>
                <Link href={release.href} className="inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">Open <ArrowRight className="size-4" aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5"><Database className="mt-0.5 size-5 shrink-0 text-red-700" aria-hidden="true" /><div><h2 className="font-black text-stone-950">Archive coverage</h2><p className="mt-2 text-sm leading-6 text-stone-600">The live archive combines current normalized multi-source releases with recent Statistics Canada Daily entries. Durable long-run history will expand once production Postgres is connected.</p></div></section>
      </div>
    </AppShell>
  );
}
