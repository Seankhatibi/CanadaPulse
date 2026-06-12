import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { NormalizedRelease } from "@/lib/release-hub";
import type { ShareCard } from "@/lib/viral-data";

export function WeeklyPulsePreview({
  weeklySummary,
  shareCards,
  releases,
}: {
  weeklySummary: {
    headline: string;
    summary: string;
    generatedFor: string;
    highlights: string[];
  };
  shareCards: ShareCard[];
  releases: NormalizedRelease[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 pb-14 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-stone-950 to-black p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Canada in 60 Seconds</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white">{weeklySummary.headline}</h2>
          <p className="mt-4 text-base leading-7 text-stone-300">{weeklySummary.summary}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {weeklySummary.highlights.slice(0, 4).map((highlight) => (
              <div key={highlight} className="rounded-md bg-white/[0.06] p-3 text-sm leading-6 text-stone-300">
                {highlight}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/weekly-pulse"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-red-100"
            >
              Read weekly pulse
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="text-xs text-stone-500">Generated for {weeklySummary.generatedFor}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Shareable Stories</p>
          {shareCards.slice(0, 3).map((card) => (
            <div key={card.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">{card.title}</p>
                  <p className="mt-1 font-mono text-3xl font-black text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-stone-500">{card.subtitle}</p>
                </div>
                <ShareStatButton text={`${card.title}: ${card.value}. ${card.body}`} />
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-400">{card.body}</p>
              <Link href={card.href} className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200 hover:text-white">
                Open story
              </Link>
            </div>
          ))}
          {releases.length ? (
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Latest official releases</p>
              <div className="mt-3 space-y-2">
                {releases.slice(0, 3).map((release) => (
                  <Link key={release.id} href={release.href} className="block text-sm font-semibold text-stone-300 hover:text-white">
                    {release.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
