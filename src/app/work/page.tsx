import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LifeSeriesBoard } from "@/components/life-series-board";
import { getLifeSeries } from "@/lib/life-series";
export const dynamic = "force-dynamic";
export const metadata = { title: "Work, wages and education for young Canadians" };
export default async function WorkPage() {
  const series = (await getLifeSeries()).filter((item) => item.topic === "work");
  return <AppShell><p className="cp-eyebrow">My work & education</p><h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">Starting a career should come with a clearer picture.</h1><p className="mt-4 max-w-3xl leading-7 text-stone-600">Compare youth and prime-age unemployment, explore actual young-worker wages, and place tuition beside the cost of living. Every cohort is named; national labour figures are not relabelled as youth data.</p><LifeSeriesBoard series={series} title="Jobs, pay and the cost of studying" /><section className="cp-card"><h2 className="text-2xl font-bold">What to explore next</h2><div className="mt-4 flex flex-wrap gap-4"><Link href="/money" className="font-bold text-teal-800">Is pay keeping up with prices? →</Link><Link href="/my-life" className="font-bold text-teal-800">Put this into a budget →</Link><a href="https://www.jobbank.gc.ca/trend-analysis" target="_blank" rel="noreferrer" className="font-bold text-teal-800">Official occupation outlooks ↗</a></div><p className="mt-4 text-sm leading-6 text-stone-600">Median pay is an observed midpoint, not a salary guarantee. Occupation, hours, location and qualifications matter when planning your next step.</p></section></AppShell>;
}
