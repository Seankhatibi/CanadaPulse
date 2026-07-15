import Link from "next/link";
import { ArrowRight, CheckCircle2, Database } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CompareProvincePicker } from "@/components/compare-province-picker";
import { provinces } from "@/lib/province-directory";
import { getProvinceResearchBrief } from "@/lib/province-research";
import { parseComparableProvinceValue } from "@/lib/province-values";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";

export const dynamic = "force-dynamic";

function validProvince(slug: string | undefined, fallback: string) {
  return provinces.some((province) => province.slug === slug) ? slug as string : fallback;
}

function numericValue(value: string) {
  return parseComparableProvinceValue(value) ?? 0;
}

export default async function ComparePage({ searchParams }: { searchParams?: Promise<{ left?: string; right?: string }> }) {
  const query = await searchParams;
  const leftSlug = validProvince(query?.left, "ontario");
  const proposedRight = validProvince(query?.right, "alberta");
  const rightSlug = proposedRight === leftSlug ? (leftSlug === "alberta" ? "ontario" : "alberta") : proposedRight;
  const [left, right] = await Promise.all([
    getProvinceResearchBrief(leftSlug, "overview"),
    getProvinceResearchBrief(rightSlug, "overview"),
  ]);
  if (!left || !right) return null;

  const comparisons = left.provincialFacts.flatMap((leftFact) => {
    const rightFact = right.provincialFacts.find((fact) => fact.release.id === leftFact.release.id);
    return rightFact ? [{ release: leftFact.release, left: leftFact, right: rightFact }] : [];
  });

  return (
    <AppShell variant="light">
      <div className="space-y-8">
        <section className="border-b border-stone-300 pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.13em]"><span className="rounded-md bg-red-700 px-2.5 py-1 text-white">Province comparison</span><span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800">Official shared tables</span></div>
          <h1 className="mt-5 text-4xl font-black text-stone-950 sm:text-6xl">{left.province.name} vs {right.province.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">Compare only the indicators where the same official release contains a verified row for both provinces.</p>
          <div className="mt-6"><CompareProvincePicker left={leftSlug} right={rightSlug} /></div>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-red-700">Like-for-like evidence</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">What the same tables show</h2>
          <div className="mt-5 grid gap-4">
            {comparisons.length ? comparisons.map((comparison) => {
              const leftNumber = numericValue(comparison.left.value);
              const rightNumber = numericValue(comparison.right.value);
              const max = Math.max(Math.abs(leftNumber), Math.abs(rightNumber), 1);
              return (
                <article key={comparison.release.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">{comparison.release.publisher} · {formatReleaseDate(comparison.release.releaseDate)}</p>
                      <h3 className="mt-2 text-2xl font-black text-stone-950">{comparison.release.title}</h3>
                      <p className="mt-2 text-xs font-bold text-stone-500">Reference period: {formatReferencePeriod(comparison.release.referencePeriod)}</p>
                    </div>
                    <Link href={comparison.release.href} className="inline-flex items-center gap-2 text-sm font-black text-red-700">Open source breakdown <ArrowRight className="size-4" aria-hidden="true" /></Link>
                  </div>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {[{ province: left.province, fact: comparison.left, number: leftNumber }, { province: right.province, fact: comparison.right, number: rightNumber }].map((item) => (
                      <div key={item.province.slug} className="rounded-xl bg-stone-50 p-5">
                        <div className="flex items-center justify-between gap-3"><p className="font-black text-stone-950">{item.province.name}</p><p className="font-mono text-3xl font-black text-stone-950">{item.fact.value}</p></div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-red-700" style={{ width: `${Math.max(6, Math.abs(item.number) / max * 100)}%` }} /></div>
                        <p className="mt-3 text-sm leading-6 text-stone-600">{item.fact.note}</p>
                        <p className="mt-2 text-xs font-bold text-stone-500">Rank {item.fact.rank} of {item.fact.peerCount} reported jurisdictions</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            }) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="font-black text-amber-950">No shared official province rows are loaded for this pair yet.</p><p className="mt-2 text-sm text-amber-900">Canada Pulse will not fill the comparison with modeled values.</p></div>}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {[left, right].map((brief) => (
            <Link key={brief.province.slug} href={`/province/${brief.province.slug}`} className="group rounded-xl bg-stone-950 p-5 text-white sm:p-6">
              <CheckCircle2 className="size-5 text-emerald-400" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-black">Open {brief.province.name}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">See every currently verified provincial value and the national releases affecting the province.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-300">Province evidence <ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
          ))}
        </section>

        <section className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5"><Database className="mt-0.5 size-5 shrink-0 text-red-700" aria-hidden="true" /><div><h2 className="font-black text-stone-950">Comparison integrity</h2><p className="mt-2 text-sm leading-6 text-stone-600">The bars compare values from the same release and unit. A missing province stays missing; rankings are not generated from a different period or an inferred score.</p></div></section>
      </div>
    </AppShell>
  );
}
