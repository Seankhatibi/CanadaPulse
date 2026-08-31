import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Building2, Home, Landmark, Minus } from "lucide-react";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import { provinces } from "@/lib/province-directory";
import type { NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";

type Point = ReleaseChartPayload["points"][number];

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const provinceByName = new Map<string, (typeof provinces)[number]>(provinces.map((province) => [province.name, province]));

function allPoints(release: NormalizedRelease | undefined) {
  return release?.chartPayloads.filter((chart) => chart.kind !== "qualitative").flatMap((chart) => chart.points) ?? [];
}

function findPoint(release: NormalizedRelease | undefined, pattern: RegExp) {
  return allPoints(release).find((point) => pattern.test(point.label));
}

function findChart(release: NormalizedRelease | undefined, pattern: RegExp) {
  return release?.chartPayloads.find((chart) => pattern.test(chart.title));
}

function Direction({ point, positiveWhenUp = false }: { point: Point; positiveWhenUp?: boolean }) {
  const Icon = point.direction === "up" ? ArrowUp : point.direction === "down" ? ArrowDown : Minus;
  const favourable = point.direction === "neutral" ? null : positiveWhenUp ? point.direction === "up" : point.direction === "down";
  const tone = favourable === null ? "text-amber-700" : favourable ? "text-emerald-700" : "text-red-700";
  return <span className={`inline-flex items-center gap-1 font-mono text-xs font-black ${tone}`}><Icon className="size-3.5" aria-hidden="true" />{point.changeDisplay ?? "Current"}</span>;
}

function SourceLine({ release }: { release: NormalizedRelease }) {
  return <p className="text-[11px] font-bold leading-5 text-stone-500">{release.publisher} | {formatReferencePeriod(release.referencePeriod)} | released {formatReleaseDate(release.releaseDate)}</p>;
}

export function HousingMarketBoard({ releases }: { releases: NormalizedRelease[] }) {
  const rental = releases.find((release) => release.status === "live" && release.releaseType === "cmhc-rental-market");
  const starts = releases.find((release) => release.status === "live" && release.releaseType === "housing-release-monitor");
  const rates = releases.find((release) => release.status === "live" && release.id === "bank-of-canada-valet-rate-watch");
  if (!rental && !starts && !rates) return null;

  const rent = findPoint(rental, /^average two-bedroom rent$/i);
  const rentGrowth = findPoint(rental, /fixed-sample rent growth/i);
  const vacancy = findPoint(rental, /rental vacancy rate/i);
  const provinceRents = findChart(rental, /average two-bedroom rent by province/i)?.points ?? [];
  const metroRents = findChart(rental, /most expensive major rental markets/i)?.points.slice(0, 6) ?? [];
  const maxProvinceRent = Math.max(...provinceRents.map((point) => Math.abs(point.value)), 1);

  const housingStarts = findPoint(starts, /^housing starts$/i);
  const startsChange = findPoint(starts, /starts change/i);
  const rawUnitMix = findChart(starts, /starts by unit type/i)?.points ?? [];
  const hasDetailedMultiples = rawUnitMix.some((point) => /apartment|row|semi-detached/i.test(point.label));
  const unitMix = hasDetailedMultiples ? rawUnitMix.filter((point) => !/^multiples$/i.test(point.label)) : rawUnitMix;
  const maxUnitMix = Math.max(...unitMix.map((point) => Math.abs(point.value)), 1);

  const policyRate = findPoint(rates, /policy rate/i);
  const fiveYear = findPoint(rates, /5-year yield/i);

  return (
    <section className="-mx-3 bg-[#f8f4ec] text-stone-950 sm:-mx-6" aria-labelledby="housing-market-heading">
      <div className="px-3 py-9 sm:px-6 sm:py-12">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Canada housing watch</p>
        <h2 id="housing-market-heading" className="mt-2 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">The housing numbers Canadians feel first</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">Rent, vacancy, construction starts and borrowing rates answer different questions. They are shown separately here so a stronger pipeline is never confused with a home ready to occupy.</p>
      </div>

      {rental && rent ? (
        <div className="grid border-y border-stone-300 bg-white lg:grid-cols-[0.78fr_1.22fr]">
          <div className="px-4 py-8 sm:px-8 lg:border-r lg:border-stone-200 lg:px-10 lg:py-10">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-700"><Home className="size-4" aria-hidden="true" />What renters pay</div>
            <h3 className="mt-4 text-3xl font-black leading-tight">Canada’s surveyed two-bedroom average</h3>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <p className="font-mono text-6xl font-black">{rent.display}</p>
              <Direction point={rent} />
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{rent.plainEnglish}</p>

            <div className="mt-6 border-l-4 border-red-600 bg-red-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-red-800">What that means over a year</p>
              <p className="mt-2 font-mono text-3xl font-black">{money.format(rent.value * 12)}</p>
              <p className="mt-1 text-xs leading-5 text-stone-600">Twelve months of the surveyed average, before utilities, insurance or moving costs.</p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-5 border-y border-stone-200 py-5">
              {rentGrowth ? <div><p className="text-xs font-bold text-stone-500">Existing-structure growth</p><p className="mt-2 font-mono text-2xl font-black">{rentGrowth.display}</p><div className="mt-2"><Direction point={rentGrowth} /></div></div> : null}
              {vacancy ? <div><p className="text-xs font-bold text-stone-500">Rental vacancy</p><p className="mt-2 font-mono text-2xl font-black">{vacancy.display}</p><div className="mt-2"><Direction point={vacancy} positiveWhenUp /></div></div> : null}
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <SourceLine release={rental} />
              <Link href={rental.href} className="inline-flex items-center gap-2 text-sm font-black text-red-700">Open rental breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>

          <div className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">Province rent ranking</p><h3 className="mt-2 text-2xl font-black">Same survey, one glance</h3></div><p className="text-xs font-bold text-stone-500">Higher bar = higher average rent</p></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-x-7">
              {provinceRents.map((point, index) => {
                const province = provinceByName.get(point.label);
                const content = <><div className="mb-1.5 flex items-center gap-3"><span className="w-5 font-mono text-xs font-black text-red-700">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-sm font-black">{point.label}</span><span className="font-mono text-sm font-black">{point.display}</span></div><div className="ml-8 h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: `${Math.max(8, Math.abs(point.value) / maxProvinceRent * 100)}%` }} /></div></>;
                return province ? (
                  <Link key={point.label} href={`/province/${province.slug}/housing`} className="block rounded-md py-1 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700">
                    {content}
                  </Link>
                ) : (
                  <div key={point.label} className="py-1">
                    {content}
                  </div>
                );
              })}
            </div>

            {metroRents.length ? (
              <div className="mt-8 border-t border-stone-200 pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3"><h3 className="text-xl font-black">Most expensive major rental markets</h3><p className="text-xs font-bold text-stone-500">Average two-bedroom rent</p></div>
                <div className="mt-4 grid gap-px overflow-hidden rounded-md bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
                  {metroRents.map((point, index) => <div key={point.label} className="bg-stone-50 p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-black text-red-700">#{index + 1}</span><span className="font-mono text-sm font-black">{point.display}</span></div><p className="mt-2 text-sm font-black leading-5">{point.label}</p></div>)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {starts && housingStarts ? (
        <div className="grid bg-[#071315] text-white lg:grid-cols-[0.75fr_1.25fr]">
          <div className="px-4 py-8 sm:px-8 lg:border-r lg:border-white/10 lg:px-10 lg:py-10">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-300"><Building2 className="size-4" aria-hidden="true" />Supply entering construction</div>
            <p className="mt-5 font-mono text-6xl font-black">{housingStarts.display}</p>
            <p className="mt-2 text-sm font-bold text-slate-400">housing starts</p>
            {startsChange ? <div className="mt-5 inline-flex rounded-md bg-white/10 px-3 py-2"><Direction point={startsChange} positiveWhenUp /></div> : null}
            <p className="mt-5 text-sm leading-6 text-slate-300">Starts are homes beginning construction. They are not completions and not move-in-ready supply.</p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><p className="text-[11px] font-bold leading-5 text-slate-500">{starts.publisher} | {formatReferencePeriod(starts.referencePeriod)} | released {formatReleaseDate(starts.releaseDate)}</p><Link href={starts.href} className="inline-flex items-center gap-2 text-sm font-black text-cyan-300">Open supply breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
          </div>
          <div className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">What is being started</p>
            <h3 className="mt-2 text-2xl font-black">National unit mix</h3>
            <div className="mt-7 space-y-5">
              {unitMix.map((point) => (
                <div key={point.label}>
                  <div className="mb-2 flex items-center justify-between gap-4"><p className="text-sm font-black">{point.label}</p><p className="font-mono text-lg font-black text-cyan-200">{point.display}</p></div>
                  <div className="h-4 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${Math.max(4, Math.abs(point.value) / maxUnitMix * 100)}%` }} /></div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{point.plainEnglish}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {rates && (policyRate || fiveYear) ? (
        <div className="border-y border-stone-300 bg-white px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700"><Landmark className="size-4" aria-hidden="true" />Borrowing conditions</div><h3 className="mt-3 text-3xl font-black leading-tight">Rates reach housing through mortgages and financing</h3><p className="mt-4 text-sm leading-6 text-stone-600">The policy rate anchors borrowing conditions. The five-year government yield is an important market signal for fixed mortgage pricing; neither is a quoted consumer mortgage rate.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[policyRate, fiveYear].filter((point): point is Point => Boolean(point)).map((point) => (
                <div key={point.label} className="border-l-4 border-emerald-500 bg-emerald-50 px-5 py-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-900">{point.label}</p><p className="mt-3 font-mono text-4xl font-black">{point.display}</p><p className="mt-3 text-sm leading-6 text-stone-600">{point.plainEnglish}</p></div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-stone-200 pt-5"><SourceLine release={rates} /><Link href={rates.href} className="inline-flex items-center gap-2 text-sm font-black text-red-700">Open rate breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
        </div>
      ) : null}
    </section>
  );
}
