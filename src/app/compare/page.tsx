import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Database } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { YouthProvinceBattle } from "@/components/youth-province-battle";
import { provinces } from "@/lib/province-directory";
import { buildProvinceExplorerData } from "@/lib/province-explorer-data";
import { getProvinceResearchBrief } from "@/lib/province-research";
import { parseComparableProvinceValue } from "@/lib/province-values";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

type CompareSearchParams = Promise<{ left?: string; right?: string; income?: string }>;

function validProvince(slug: string | undefined, fallback: string) {
  return provinces.some((province) => province.slug === slug) ? slug as string : fallback;
}

function numericValue(value: string) {
  return parseComparableProvinceValue(value) ?? 0;
}

function validIncome(value: string | undefined) {
  const income = Number(value);
  if (!Number.isFinite(income)) return 60_000;
  return Math.round(Math.min(200_000, Math.max(30_000, income)) / 5_000) * 5_000;
}

function pairFromQuery(query: Awaited<CompareSearchParams> | undefined, eligibleSlugs: string[]) {
  const fallbackLeft = eligibleSlugs.includes("ontario") ? "ontario" : eligibleSlugs[0] ?? "ontario";
  const fallbackRight = eligibleSlugs.includes("alberta") ? "alberta" : eligibleSlugs.find((slug) => slug !== fallbackLeft) ?? fallbackLeft;
  const left = query?.left && eligibleSlugs.includes(query.left) ? query.left : fallbackLeft;
  const requestedRight = query?.right && eligibleSlugs.includes(query.right) ? query.right : fallbackRight;
  const right = requestedRight === left ? eligibleSlugs.find((slug) => slug !== left) ?? requestedRight : requestedRight;
  return { left, right };
}

export async function generateMetadata({ searchParams }: { searchParams: CompareSearchParams }): Promise<Metadata> {
  const query = await searchParams;
  const explorerData = buildProvinceExplorerData(await getMultiSourceReleaseHub());
  const rent = explorerData.categories.find((category) => category.id === "rent");
  const pair = pairFromQuery(query, rent?.values.map((value) => value.slug) ?? []);
  const left = rent?.values.find((value) => value.slug === pair.left);
  const right = rent?.values.find((value) => value.slug === pair.right);
  const income = validIncome(query?.income);
  const salary = `$${Math.round(income / 1_000)}k`;
  const title = `${left?.province ?? "Province"} vs ${right?.province ?? "province"}: where does a ${salary} salary go further?`;
  const annualGap = left && right ? Math.abs(left.value - right.value) * 12 : 0;
  const description = left && right
    ? `The latest CMHC average two-bedroom rents differ by $${annualGap.toLocaleString("en-CA")} per year. Compare rent burden, jobs, inflation and housing supply from official releases.`
    : "Compare rent burden, jobs, inflation and housing supply across Canadian provinces using official releases.";
  const canonical = `/compare?left=${encodeURIComponent(pair.left)}&right=${encodeURIComponent(pair.right)}&income=${income}`;
  const image = `/api/og/compare?left=${encodeURIComponent(pair.left)}&right=${encodeURIComponent(pair.right)}&income=${income}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "Canada Pulse", locale: "en_CA", type: "website", images: [{ url: image, width: 1200, height: 630, alt: `${left?.province ?? "Province"} and ${right?.province ?? "province"} affordability comparison` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ComparePage({ searchParams }: { searchParams?: CompareSearchParams }) {
  const query = await searchParams;
  const income = validIncome(query?.income);
  const releaseHub = await getMultiSourceReleaseHub();
  const explorerData = buildProvinceExplorerData(releaseHub);
  const eligibleSlugs = explorerData.categories.find((category) => category.id === "rent")?.values.map((value) => value.slug) ?? [];
  const pair = pairFromQuery(query, eligibleSlugs);
  const leftSlug = validProvince(pair.left, "ontario");
  const rightSlug = validProvince(pair.right, "alberta");
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
        <YouthProvinceBattle data={explorerData} initialLeft={leftSlug} initialRight={rightSlug} initialIncome={income} />

        <section id="official-comparison" className="scroll-mt-24">
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
