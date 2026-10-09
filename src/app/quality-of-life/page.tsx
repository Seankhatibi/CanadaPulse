import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LifeSeriesBoard } from "@/components/life-series-board";
import { getLifeSeries } from "@/lib/life-series";
export const dynamic = "force-dynamic";
export const metadata = { title: "Community, health access and quality of life" };
export default async function CommunityPage() {
  const series = (await getLifeSeries()).filter((item) => item.topic === "community");
  return <AppShell><p className="cp-eyebrow">My community · beyond GDP</p><h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">A growing economy is only part of a good life.</h1><p className="mt-4 max-w-3xl leading-7 text-stone-600">Explore healthcare access, young adults’ mental wellbeing, community belonging, food insecurity, poverty and life satisfaction. There is no opaque score combining unlike measures.</p><LifeSeriesBoard series={series} title="How people are doing" /><section className="cp-card"><h2 className="text-2xl font-bold">Services, costs and outcomes are different questions</h2><div className="mt-4 flex flex-wrap gap-4"><Link href="/health" className="font-bold text-teal-800">Health spending evidence →</Link><a href="https://www.cihi.ca/en/wait-times-for-priority-procedures-in-canada" target="_blank" rel="noreferrer" className="font-bold text-teal-800">Official procedure wait times ↗</a><a href="https://www150.statcan.gc.ca/n1/pub/71-607-x/71-607-x2021007-eng.htm" target="_blank" rel="noreferrer" className="font-bold text-teal-800">Official childcare access & fees ↗</a></div><p className="mt-4 text-sm leading-6 text-stone-600">Wait times and childcare details open at their publishers; they are not yet imported into comparable Canada Pulse series. No local service availability is inferred from national spending.</p></section></AppShell>;
}
