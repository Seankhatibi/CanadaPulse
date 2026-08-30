import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, CircleDollarSign, Landmark, Minus, ReceiptText, ShieldAlert, WalletCards } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import { findFiscalMetric } from "@/lib/government-money-data";
import type { NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";

type Point = ReleaseChartPayload["points"][number];

function metricTone(point: Point) {
  if (/deficit|debt charges/i.test(point.label)) return point.direction === "up" ? "text-red-700" : "text-emerald-700";
  if (/revenue/i.test(point.label)) return point.direction === "up" ? "text-emerald-700" : "text-red-700";
  return "text-cyan-800";
}

function Change({ point }: { point: Point }) {
  const Icon = point.direction === "up" ? ArrowUp : point.direction === "down" ? ArrowDown : Minus;
  return <span className={`inline-flex items-center gap-1 font-mono text-xs font-black ${metricTone(point)}`}><Icon className="size-3.5" aria-hidden="true" />{point.changeDisplay ?? "No comparable change"}</span>;
}

export function FederalMoneyBoard({ release }: { release: NormalizedRelease }) {
  const deficit = findFiscalMetric(release, /^fiscal-year deficit$/i);
  const revenue = findFiscalMetric(release, /^federal revenue$/i);
  const expenses = findFiscalMetric(release, /^program expenses$/i);
  const debtCharges = findFiscalMetric(release, /^public debt charges$/i);
  const debtShare = findFiscalMetric(release, /debt charges as share of revenue/i);
  const monthlyDeficit = findFiscalMetric(release, /^monthly deficit$/i);
  const primary = [revenue, expenses, debtCharges].filter((point): point is Point => Boolean(point));
  const maximum = Math.max(...primary.map((point) => point.value), 1);

  if (!deficit || !revenue || !expenses || !debtCharges || !debtShare) return null;

  return (
    <div className="-mx-3 sm:-mx-6" aria-labelledby="federal-money-heading">
      <section className="bg-[#f7f2ea] px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-red-700"><Landmark className="size-4" aria-hidden="true" /> Latest federal books</div>
              <h1 id="federal-money-heading" className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">Ottawa is spending more than it collects.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">The Fiscal Monitor is the federal government&apos;s monthly scoreboard. Canada Pulse separates revenue, programs and debt interest so the deficit is not treated as just another spending category.</p>
            </div>
            <div className="border-y border-stone-300 py-6 lg:border-l lg:border-y-0 lg:py-2 lg:pl-10">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-stone-500">Fiscal-year deficit</p>
              <div className="mt-3 flex flex-wrap items-end gap-4"><p className="font-mono text-7xl font-black text-red-700 sm:text-8xl">{deficit.display}</p><div className="pb-2"><Change point={deficit} /></div></div>
              <p className="mt-3 text-sm leading-6 text-stone-600">{deficit.plainEnglish}</p>
            </div>
          </div>

          <div className="mt-10 grid border-y border-stone-300 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="py-7 lg:pr-10">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">The federal money flow</p>
              <div className="mt-6 grid gap-6">
                {primary.map((point) => {
                  const width = Math.max(7, (point.value / maximum) * 100);
                  const color = /debt/i.test(point.label) ? "bg-red-600" : /revenue/i.test(point.label) ? "bg-emerald-600" : "bg-cyan-700";
                  return (
                    <div key={point.label}>
                      <div className="flex flex-wrap items-baseline justify-between gap-3"><p className="text-sm font-black">{point.label}</p><div className="flex items-baseline gap-3"><span className="font-mono text-2xl font-black">{point.display}</span><Change point={point} /></div></div>
                      <div className="mt-2 h-4 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div>
                      <p className="mt-2 text-xs leading-5 text-stone-600">{point.plainEnglish}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-stone-300 py-7 lg:border-l lg:border-t-0 lg:pl-10">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-700"><ShieldAlert className="size-4" aria-hidden="true" /> The interest bill</div>
              <p className="mt-5 font-mono text-7xl font-black">{debtShare.display}</p>
              <p className="mt-3 text-xl font-black">of federal revenue went to public debt charges.</p>
              <p className="mt-4 text-sm leading-6 text-stone-600">That is roughly {debtShare.display.replace("%", " cents")} from every $100 collected. It pays interest, not a new service.</p>
              {monthlyDeficit ? <div className="mt-7 border-t border-stone-300 pt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">Latest monthly deficit</p><div className="mt-2 flex items-baseline justify-between gap-3"><span className="font-mono text-3xl font-black">{monthlyDeficit.display}</span><Change point={monthlyDeficit} /></div></div> : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-black text-stone-950">{release.title}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">{release.publisher} | {release.referencePeriod} | released {release.releaseDate}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row"><Link href={release.href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-black text-white hover:bg-stone-800">Open full Fiscal Monitor breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link><ShareStatButton variant="light" url={release.href} text={`Ottawa's fiscal-year deficit is ${deficit.display}. Public debt charges are ${debtCharges.display}, equal to ${debtShare.display} of federal revenue in ${release.referencePeriod}.`} /></div>
          </div>
        </div>
      </section>

      <section className="bg-[#dff5f2] px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Make it personal</p>
          <div className="mt-3 grid gap-7 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div><h2 className="text-4xl font-black leading-tight sm:text-5xl">Where might your own tax dollars go?</h2><p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">Use a salary and province to explore an estimated tax receipt, province ranking and move scenario. The calculator is deliberately separate from these official federal accounts.</p></div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-cyan-900/20">
              {[{ icon: WalletCards, label: "Pick salary" }, { icon: CircleDollarSign, label: "Pick province" }, { icon: ReceiptText, label: "See receipt" }].map(({ icon: Icon, label }) => <div key={label} className="bg-[#effaf8] p-4 text-center"><Icon className="mx-auto size-5 text-cyan-800" aria-hidden="true" /><p className="mt-2 text-xs font-black">{label}</p></div>)}
            </div>
          </div>
          <Link href="/tax-dollar" className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-black text-white hover:bg-red-600">Build my illustrative receipt <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <p className="mt-3 text-xs leading-5 text-stone-500">Scenario tool only. It is not a CRA calculation, tax advice or an official allocation of one person&apos;s taxes.</p>
        </div>
      </section>
    </div>
  );
}
