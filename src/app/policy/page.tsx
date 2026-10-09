import { AppShell } from "@/components/app-shell";
import { PolicyExplorer } from "@/components/policy-explorer";
import { getPolicyFeed } from "@/lib/policy-data";
export const dynamic = "force-dynamic";
export const metadata = { title: "What is changing in government?" };
export default async function PolicyPage() {
  const feed = await getPolicyFeed();
  return <AppShell><section className="rounded-3xl bg-[#243c55] p-6 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-widest text-blue-200">My government · official parliamentary evidence</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">An announcement is only the beginning.</h1><p className="mt-4 max-w-3xl leading-7 text-blue-100">Track bills, see their actual legislative stage, and separate proposals from changes that are in force and delivering results.</p></section><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="cp-card"><h2 className="font-bold">Proposed</h2><p className="mt-2 text-sm leading-6 text-stone-600">A bill or announcement may change before becoming law.</p></div><div className="cp-card"><h2 className="font-bold">Legislated</h2><p className="mt-2 text-sm leading-6 text-stone-600">Royal assent does not by itself prove all provisions are in force.</p></div><div className="cp-card"><h2 className="font-bold">Implemented & measured</h2><p className="mt-2 text-sm leading-6 text-stone-600">Effective dates, delivery and outcomes need their own evidence.</p></div></div><PolicyExplorer feed={feed} /></AppShell>;
}
