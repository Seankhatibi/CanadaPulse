import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Issue } from "@/lib/issue-data";
import { GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { GlossaryStrip } from "@/components/term-tip";

export function IssueDetail({ issue }: { issue: Issue }) {
  const Icon = issue.icon;
  const maxProvince = Math.max(...issue.provinceValues.map((item) => Math.abs(item.numeric)));
  const maxComponent = Math.max(...issue.components.map((item) => Math.abs(item.numeric)));

  return (
    <div className="space-y-5">
      <GlassPanel className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${issue.tone}`} />
        <div className="p-5 sm:p-7">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to issues
          </Link>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.42fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill>{issue.source}</StatusPill>
                <StatusPill>National first, province split second</StatusPill>
              </div>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-red-600 text-white">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                    {issue.title}
                  </p>
                  <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                    {issue.question}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-stone-300">{issue.movement}</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-stone-500">{issue.nationalLabel}</p>
                <ShareStatButton text={`${issue.title}: ${issue.nationalValue}. ${issue.question}`} />
              </div>
              <p className="mt-3 font-mono text-4xl font-semibold text-white sm:text-5xl">{issue.nationalValue}</p>
              <p className="mt-4 text-xs leading-5 text-stone-500">
                Official-source-ready demo data. Connect live source tables before launch.
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">What this means</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
              This page is built to be read in three moves: national headline, province ranking, then the components
              driving the number. The labels below keep the data plain-English.
            </p>
          </div>
          <GlossaryStrip />
        </div>
      </GlassPanel>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">Province comparison at a glance</h2>
          <div className="mt-5 grid gap-3">
            {issue.provinceValues.map((item) => (
              <Link
                key={item.abbr}
                href={`/issue/${issue.slug}/${item.slug}`}
                className="block rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-red-400/50 hover:bg-white/10"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.province}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.note}</p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white sm:text-right sm:text-2xl">{item.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{ width: `${Math.max(8, (Math.abs(item.numeric) / maxProvince) * 100)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">What is driving it?</h2>
          <div className="mt-5 grid gap-3">
            {issue.components.map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.note}</p>
                  </div>
                  <p className="font-mono text-lg font-semibold text-white sm:text-right sm:text-xl">{item.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${Math.max(8, (Math.abs(item.numeric) / maxComponent) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <a
            href="https://www.statcan.gc.ca/en/subjects-start/prices_and_price_indexes/consumer_price_indexes"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-red-200"
          >
            Open official source context
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </GlassPanel>
      </section>
    </div>
  );
}
