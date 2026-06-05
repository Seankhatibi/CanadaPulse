import Link from "next/link";
import { ArrowRight, CheckCircle2, Flame, MessageSquareWarning } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { mythRealityItems } from "@/lib/viral-data";

export default function MythVsRealityPage() {
  return (
    <AppShell>
      <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <GlassPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <StatusPill>Neutral data-first framing</StatusPill>
            <StatusPill>Built for debate</StatusPill>
          </div>
          <div className="mt-7">
            <SectionHeader
              eyebrow="Myth vs Reality"
              title="Argue with the chart, not the slogan."
              body="This page turns politically hot topics into inspectable public-data questions: what is the claim, what does the dashboard show, and which chart should people open next?"
            />
          </div>
          <div className="mt-6">
            <ShareStatButton text="Canada Pulse Myth vs Reality turns hot Canadian debates into neutral charts people can inspect and share." />
          </div>
        </GlassPanel>

        <div className="grid gap-3">
          {mythRealityItems.map((item, index) => (
            <GlassPanel key={item.slug} className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-white/10 bg-red-950/20 p-4 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-md bg-red-600 text-white">
                      <MessageSquareWarning className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-stone-500">0{index + 1}</span>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">The claim</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{item.myth}</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-300" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      Reality check
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-300">{item.reality}</p>
                  <div className="mt-4 rounded-md border border-white/10 bg-black/35 p-3">
                    <div className="flex items-center gap-2">
                      <Flame className="size-4 text-amber-200" aria-hidden="true" />
                      <p className="text-sm font-semibold text-white">{item.signal}</p>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">{item.source}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-200"
                  >
                    Open the chart
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
