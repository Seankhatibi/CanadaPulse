"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, HeartPulse, Home, Landmark, Leaf, WalletCards } from "lucide-react";
import { lifeContext, lifeStages, type LifeStage } from "@/lib/life-context";
import { buildReleaseIntelligence } from "@/lib/release-intelligence";
import type { NormalizedRelease } from "@/lib/release-hub";
import { provinces } from "@/lib/province-directory";

export const lifeTopics = [
  { title: "My money", question: "Is my pay keeping up with everyday costs?", href: "/money", icon: WalletCards, tone: "bg-amber-50 text-amber-800" },
  { title: "My home", question: "Can I move out and still have room to live?", href: "/my-life", icon: Home, tone: "bg-teal-50 text-teal-800" },
  { title: "My work & education", question: "What does starting a career look like now?", href: "/work", icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-800" },
  { title: "My community", question: "How are people doing beyond the economy?", href: "/quality-of-life", icon: HeartPulse, tone: "bg-violet-50 text-violet-800" },
  { title: "My government", question: "What has actually changed, and who is affected?", href: "/policy", icon: Landmark, tone: "bg-rose-50 text-rose-800" },
  { title: "Canada’s future", question: "What is shaping tomorrow’s opportunities?", href: "/future", icon: Leaf, tone: "bg-emerald-50 text-emerald-800" },
];
export function LifeTopicGrid() {
  return <section id="explore" className="scroll-mt-24 py-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="cp-eyebrow">Start with a question</p><h2 className="mt-2 text-3xl font-bold tracking-tight">The Canada that touches your life</h2></div><Link href="/releases" className="text-sm font-bold text-teal-800">All official releases →</Link></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lifeTopics.map(({ title, question, href, icon: Icon, tone }) => <Link key={href} href={href} className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-teal-500 hover:shadow-md"><span className={`inline-flex size-11 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{question}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800">Explore <ArrowRight className="size-4" aria-hidden="true" /></span></Link>)}</div>
  </section>;
}
export function DailyLifeDashboard({ releases, initialProvince = "ontario" }: { releases: NormalizedRelease[]; initialProvince?: string }) {
  const [stage, setStage] = useState<LifeStage>("Everyone");
  const [province, setProvince] = useState(initialProvince);
  const name = provinces.find((item) => item.slug === province)?.name ?? "Canada";
  const available = releases.filter((release) => release.status === "live" && !release.archiveFallback);
  const ranked = [...available].sort((a, b) => Number(lifeContext(b).stages.includes(stage)) - Number(lifeContext(a).stages.includes(stage)) || b.importanceScore - a.importanceScore);
  const stories = ranked.filter((release, index, items) => items.findIndex((item) => item.affectedAreas[0] === release.affectedAreas[0]) === index).slice(0, 3);
  return <>
    <section className="cp-life-hero rounded-3xl bg-[#123c3a] p-6 text-white sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Your life. Your Canada.</p><h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">Understand what changes.<br /><span className="text-teal-200">See what it means for you.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-teal-50/85">Money, housing, work and government—official Canadian evidence connected to the decisions you make every day.</p></div>
      <div className="self-end rounded-2xl border border-white/20 bg-white/10 p-5"><p className="font-bold">Make the evidence relevant</p><label className="mt-4 block text-sm">Province or territory<select value={province} onChange={(event) => setProvince(event.target.value)} className="cp-select mt-2 w-full">{provinces.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label className="mt-4 block text-sm">I’m exploring as<select value={stage} onChange={(event) => setStage(event.target.value as LifeStage)} className="cp-select mt-2 w-full">{lifeStages.map((item) => <option key={item}>{item}</option>)}</select></label><Link href={`/my-life?province=${province}`} className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-teal-100 px-4 font-bold text-teal-950">Build my monthly budget →</Link><p className="mt-3 text-xs leading-5 text-teal-100">No account required. Life stage changes story order; location opens the matching local evidence.</p></div></div>
    </section>
    <section className="py-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="cp-eyebrow">Your briefing · {stage}</p><h2 className="mt-2 text-3xl font-bold">Three signals worth understanding</h2></div><Link href={`/province/${province}`} className="text-sm font-bold text-teal-800">See evidence for {name} →</Link></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">{stories.map((release) => {
        const context = lifeContext(release); const metric = buildReleaseIntelligence(release).metrics[0];
        return <article key={release.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"><p className="cp-eyebrow">{release.affectedAreas[0]} · National context</p><h3 className="mt-3 text-xl font-bold leading-snug">{context.title}</h3>{metric ? <div className="mt-4 border-y border-stone-100 py-4"><p className="font-mono text-3xl font-bold">{metric.display}</p><p className="mt-1 text-xs text-stone-600">{metric.label} · {metric.period ?? release.referencePeriod}</p><p className="mt-2 text-sm font-semibold text-teal-800">{metric.changeDisplay ?? "Latest loaded observation"}</p></div> : null}<p className="mt-4 text-sm leading-6 text-stone-600">{context.impact}</p><details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold text-teal-800">Who experiences it differently?</summary><p className="mt-2 leading-6 text-stone-600">{context.different}</p></details><div className="mt-auto pt-5"><p className="text-xs leading-5 text-stone-500">{release.publisher} · released {release.releaseDate}</p><Link href={release.href} className="mt-3 inline-flex min-h-11 items-center font-bold text-teal-800">See the evidence →</Link></div></article>;
      })}</div>
      {!stories.length ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">Official values are temporarily unavailable. You can still explore topics and use your own budget inputs. <Link href="/data-status" className="font-bold underline">Check sources</Link>.</div> : null}
    </section>
  </>;
}
