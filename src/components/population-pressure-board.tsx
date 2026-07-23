import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Building2, GraduationCap, Home, Minus, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { NormalizedRelease, ReleaseChartPayload } from "@/lib/release-hub";

type Point = ReleaseChartPayload["points"][number];

function findPoint(release: NormalizedRelease | undefined, pattern: RegExp) {
  return release?.chartPayloads.flatMap((chart) => chart.points).find((point) => pattern.test(point.label));
}

function findChart(release: NormalizedRelease | undefined, pattern: RegExp) {
  return release?.chartPayloads.find((chart) => pattern.test(chart.title));
}

function Direction({ point }: { point: Point }) {
  const Icon = point.direction === "up" ? ArrowUp : point.direction === "down" ? ArrowDown : Minus;
  const tone = point.direction === "up" ? "text-cyan-700" : point.direction === "down" ? "text-violet-700" : "text-stone-500";
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-black ${tone}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {point.changeDisplay ?? "No comparable change"}
    </span>
  );
}

function SourceLine({ release }: { release: NormalizedRelease }) {
  return <p className="text-[11px] font-semibold text-stone-500">{release.publisher} | {release.referencePeriod} | released {release.releaseDate}</p>;
}

export function PopulationPressureBoard({ releases }: { releases: NormalizedRelease[] }) {
  const ircc = releases.find((release) => release.source === "open-government-ircc" && release.releaseType === "ircc-monthly-immigration");
  const housing = releases.find((release) => release.releaseType === "housing-release-monitor");
  if (!ircc) return null;

  const flows = findChart(ircc, /latest monthly immigration and permit flows/i)?.points ?? [];
  const categories = findChart(ircc, /permanent-resident admissions by category/i)?.points ?? [];
  const categoryTotal = categories.reduce((sum, point) => sum + point.value, 0);
  const permanentResidents = flows.find((point) => /permanent residents admitted/i.test(point.label));
  const starts = findPoint(housing, /^housing starts$/i);
  const startsChange = findPoint(housing, /^starts change$/i);

  return (
    <div className="-mx-3 sm:-mx-6" aria-labelledby="population-breakdown-heading">
      <section className="bg-[#f6f1e9] px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Five numbers, five different questions</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <h2 id="population-breakdown-heading" className="text-4xl font-black leading-tight sm:text-5xl">Do not call all of this &quot;immigration.&quot;</h2>
            <p className="max-w-2xl text-base leading-7 text-stone-600">Permanent-resident admissions, study permits, work permits and asylum claims are separate official flows. Adding them together can double-count people and does not produce Canada&apos;s population growth.</p>
          </div>

          <div className="mt-10 grid border-y border-stone-300 sm:grid-cols-2 lg:grid-cols-5">
            {flows.map((point, index) => (
              <article key={point.label} className={`py-5 sm:px-5 lg:min-h-52 ${index > 0 ? "border-t border-stone-300 sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t lg:border-t-0" : ""} ${index === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <p className="text-xs font-black leading-5 text-stone-600">{point.label.replace(" with permit(s) becoming effective", "")}</p>
                <p className="mt-4 font-mono text-4xl font-black text-stone-950">{point.display}</p>
                <div className="mt-3"><Direction point={point} /></div>
                <p className="mt-3 text-xs leading-5 text-stone-600">{point.period}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SourceLine release={ircc} />
            {permanentResidents ? (
              <ShareStatButton
                variant="light"
                url={ircc.href}
                text={`IRCC's latest monthly files report ${permanentResidents.display} permanent-resident admissions. Permit and asylum figures are separate flows and should not be summed as unique people.`}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-800">
              <UsersRound className="size-4" aria-hidden="true" /> Permanent-resident mix
            </div>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Who received permanent residence?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">The category mix answers a different question from the province map: immigration pathway rather than destination.</p>
          </div>
          <div className="grid gap-4">
            {categories.map((point, index) => {
              const share = categoryTotal ? (point.value / categoryTotal) * 100 : 0;
              return (
                <div key={point.label} className="border-t border-stone-200 pt-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-sm font-black text-stone-950"><span className="mr-2 font-mono text-xs text-red-700">{String(index + 1).padStart(2, "0")}</span>{point.label}</p>
                    <div className="flex items-baseline gap-3"><span className="font-mono text-xl font-black">{point.display}</span><span className="font-mono text-xs font-black text-cyan-800">{share.toFixed(1)}%</span></div>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-red-500" style={{ width: `${Math.max(2, share)}%` }} />
                  </div>
                  <div className="mt-2"><Direction point={point} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {housing && starts ? (
        <section className="bg-[#071315] px-4 py-12 text-white sm:px-8 sm:py-16 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">The comparison Canadians keep making</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">Are people arriving faster than Canada builds homes?</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">This is an important question, but these two releases cannot be divided directly. IRCC reports monthly flows; CMHC&apos;s connected supply table reports quarterly housing starts. Starts are not completions.</p>

            <div className="mt-9 grid border-y border-white/15 md:grid-cols-2">
              <article className="py-7 md:pr-8">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-300"><UsersRound className="size-4" aria-hidden="true" /> Monthly people flow</div>
                <p className="mt-5 font-mono text-6xl font-black">{permanentResidents?.display ?? "n/a"}</p>
                <p className="mt-3 text-lg font-black">Permanent residents admitted</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">One immigration flow for {permanentResidents?.period ?? ircc.referencePeriod}; not total population growth.</p>
              </article>
              <article className="border-t border-white/15 py-7 md:border-l md:border-t-0 md:pl-8">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-300"><Building2 className="size-4" aria-hidden="true" /> Quarterly home pipeline</div>
                <p className="mt-5 font-mono text-6xl font-black">{starts.display}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3"><p className="text-lg font-black">Housing starts</p>{startsChange ? <Direction point={startsChange} /> : null}</div>
                <p className="mt-3 text-sm leading-6 text-slate-400">Construction starts for {housing.referencePeriod}; not move-in-ready homes.</p>
              </article>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-start gap-2 text-sm leading-6 text-emerald-200"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>Canada Pulse keeps both clocks visible instead of manufacturing a viral but invalid people-per-home ratio.</span></div>
                <p className="mt-2 text-[11px] font-semibold text-slate-500">{ircc.publisher} + {housing.publisher} | separate official reference periods</p>
              </div>
              <Link href="/housing" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-stone-950 hover:bg-slate-200">Open Housing Watch <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#dff5f2] px-4 py-12 text-stone-950 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">What this means for your life</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">Population data matters when it meets rent, work and take-home pay.</h2>
          <div className="mt-9 grid gap-px overflow-hidden rounded-lg bg-cyan-900/15 md:grid-cols-3">
            {[
              { icon: Home, title: "Can my province house growth?", copy: "Compare rent, vacancy and the construction pipeline.", href: "/housing" },
              { icon: GraduationCap, title: "Can young people get ahead?", copy: "Put rent and job pressure beside a real salary.", href: "/youth" },
              { icon: WalletCards, title: "Would another province feel different?", copy: "Run the same income through two provinces.", href: "/compare" },
            ].map(({ icon: Icon, title, copy, href }) => (
              <Link key={title} href={href} className="group bg-[#effaf8] p-6 hover:bg-white">
                <Icon className="size-6 text-cyan-800" aria-hidden="true" />
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{copy}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700">Explore <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
