import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageFeed } from "@/lib/homepage-feed";

export function ProvinceRankingPanel({ ranking }: { ranking: HomepageFeed["provinceRanking"] }) {
  const max = Math.max(...ranking.points.map((point) => Math.abs(point.value)), 1);
  const provinceHref = (provinceName: string) => `/province/${provinceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-lg bg-white/[0.045] p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Province Winners & Losers</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white">{ranking.headline}</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">{ranking.dek}</p>
          <p className="mt-5 text-xs text-stone-500">
            {ranking.issueTitle} | {ranking.source} | {ranking.period}
          </p>
          <Link
            href={ranking.href}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-500"
          >
            Compare provinces
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="space-y-3">
          {ranking.points.map((point, index) => {
            const width = Math.max(12, Math.min(100, (Math.abs(point.value) / max) * 100));

            return (
              <Link
                href={provinceHref(point.label)}
                key={`${point.label}-${point.display}`}
                className="block rounded-md border border-white/10 bg-black/35 p-3 transition hover:border-red-400/50 hover:bg-black/55"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mr-2 font-mono text-xs font-black text-red-300">#{index + 1}</span>
                    <span className="font-bold text-white">{point.label}</span>
                  </div>
                  <span className="shrink-0 font-mono text-lg font-black text-white">{point.display}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-300" style={{ width: `${width}%` }} />
                </div>
                {point.note ? <p className="mt-1 text-xs text-stone-500">{point.note}</p> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
