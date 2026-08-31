import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Database, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSystemHealth } from "@/lib/system-health";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  const health = await getSystemHealth();
  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]"><span className="rounded-md bg-red-700 px-2.5 py-1 text-white">Methodology</span><span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">Official-source first</span></div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black text-stone-950 sm:text-6xl">How Canada Pulse turns a release into evidence</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">Every published value keeps its source, reference period and data status. A release summary is never treated as a province table, and a missing value is never converted to zero.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Database, title: "1. Detect and import", body: "Official feeds and report pages are checked after the morning release window. Linked tables are loaded where the source exposes structured values." },
            { icon: ShieldCheck, title: "2. Lock the facts", body: "Units, periods, previous values and geography are attached before any interpretation is generated." },
            { icon: CheckCircle2, title: "3. Explain and compare", body: "Deterministic rules identify changes and pressure signals. Province comparisons use matching rows from the same official table." },
          ].map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-xl border border-stone-200 bg-white p-5"><Icon className="size-5 text-red-700" aria-hidden="true" /><h2 className="mt-4 text-xl font-black text-stone-950">{item.title}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p></article>; })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-stone-950 p-5 text-white sm:p-7">
            <Clock3 className="size-6 text-red-300" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black">Refresh policy</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">Weekday checks run at 11:00 a.m. and 1:00 p.m. Toronto time. Source-specific caching is shorter for daily releases and longer for annual reports. The current scheduler is <strong className="text-white">{health.scheduler}</strong>.</p>
            <p className="mt-3 text-sm leading-7 text-stone-300">Canada Pulse runs statelessly: official values are fetched at request time and refreshed through Vercel&apos;s short-lived cache. Release data is not retained in a historical database.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
            <h2 className="text-2xl font-black text-stone-950">Evidence labels</h2>
            <div className="mt-4 divide-y divide-stone-200">
              {[
                ["Live", "Official structured values were loaded and can be charted."],
                ["Summary only", "The official release was detected, but its detailed table was not parsed."],
                ["Source linked", "The publisher is monitored, but no dated structured release is available."],
                ["Fallback", "A last verified value is shown because the current source request failed."],
              ].map(([label, body]) => <div key={label} className="py-4"><p className="font-black text-stone-950">{label}</p><p className="mt-1 text-sm leading-6 text-stone-600">{body}</p></div>)}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-2xl font-black text-stone-950">Interpretation limits</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-stone-600">Canada Pulse describes what changed and where. It does not infer causation from correlation, manufacture missing provincial estimates, or let an AI system invent values, dates, rankings or policy conclusions. Calculators are labelled separately from statistics.</p><Link href="/data-status" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">Open live source status <ArrowRight className="size-4" aria-hidden="true" /></Link></section>
      </div>
    </AppShell>
  );
}
