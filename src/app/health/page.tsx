import Link from "next/link";
import { ArrowRight, ExternalLink, HeartPulse, Minus, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const health = await fetchCihiHealthSnapshot();

  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]"><span className="rounded-md bg-red-700 px-2.5 py-1 text-white">Health system</span><span className={`rounded-md px-2.5 py-1 ${health.status === "live" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{health.status === "live" ? "CIHI live source" : "Last verified CIHI values"}</span></div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black text-stone-950 sm:text-6xl">What Canada spends on health, and whether it is keeping pace</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{health.summary} Spending is shown separately from access, outcomes and disease burden so a larger budget is not mistaken for a healthier system.</p>
        </section>

        <section className="grid overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {health.metrics.map((metric) => (
            <article key={metric.label} className="bg-white p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-stone-500">{metric.label}</p>
              <p className="mt-4 font-mono text-4xl font-black text-stone-950">{metric.value}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 font-mono text-xs font-black text-red-800">
                {metric.change.startsWith("+") ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <Minus className="size-3.5" aria-hidden="true" />}
                {metric.change}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-600">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl bg-stone-950 p-5 text-white sm:p-7">
            <HeartPulse className="size-6 text-red-300" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black">The question spending alone cannot answer</h2>
            <p className="mt-4 text-base leading-7 text-stone-300">Canada Pulse will add wait times, primary-care access, avoidable hospitalizations and chronic-disease surveillance only as their CIHI or PHAC tables are imported. Unsupported disease-cost estimates and province scores are not shown as facts.</p>
            <a href={health.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-stone-950">Open CIHI source <ExternalLink className="size-4" aria-hidden="true" /></a>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <ShieldCheck className="size-6 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-stone-950">Health evidence standard</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">These values are parsed from CIHI’s National Health Expenditure Trends page. The source is checked twice daily; the annual reference period remains visible even when newer economic data exists elsewhere.</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-stone-700">{health.dataNote}</p>
            <Link href="/data-status" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">Check source freshness <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
