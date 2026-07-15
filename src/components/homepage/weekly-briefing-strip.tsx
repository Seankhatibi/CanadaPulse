import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import type { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";

type WeeklyBrief = ReturnType<typeof buildLiveWeeklyPulseSummary>;

export function WeeklyBriefingStrip({ weekly }: { weekly: WeeklyBrief }) {
  return (
    <section className="border-t border-stone-300 py-10">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-red-700">
            <Clock3 className="size-4" aria-hidden="true" />
            {weekly.publishMode === "friday-weekly-summary" ? "Friday briefing" : "Rolling seven-day briefing"}
          </div>
          <h2 className="mt-3 text-4xl font-black leading-tight text-stone-950">Canada in 60 Seconds</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">{weekly.releaseCount} official releases tracked across {weekly.liveSourceCount} live source families.</p>
          <Link href="/weekly-pulse" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-700 hover:text-red-900">
            Open the full briefing
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="border-l-4 border-red-700 pl-5 sm:pl-7">
          <h3 className="text-2xl font-black leading-snug text-stone-950">{weekly.headline}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{weekly.summary}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {weekly.highlights.slice(0, 4).map((highlight, index) => (
              <p key={highlight} className="text-sm leading-6 text-stone-700"><span className="mr-2 font-mono text-xs font-black text-red-700">{String(index + 1).padStart(2, "0")}</span>{highlight}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
