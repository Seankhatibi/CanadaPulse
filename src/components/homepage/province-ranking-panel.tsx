import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProvinceRankChart } from "@/components/homepage/data-visuals";
import type { HomepageFeed } from "@/lib/homepage-feed";

export function ProvinceRankingPanel({ ranking }: { ranking: HomepageFeed["provinceRanking"] }) {
  const provinceHref = (provinceName: string) => `/province/${provinceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-stone-200 bg-[#fffaf2] p-5 shadow-xl shadow-stone-300/40 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Province Winners & Losers</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-stone-950">Hardest province for young renters?</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">{ranking.dek}</p>
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
          <ProvinceRankChart points={ranking.points} maxItems={8} />
          {ranking.points.map((point, index) => {
            return (
              <Link
                href={provinceHref(point.label)}
                key={`${point.label}-${point.display}`}
                className="sr-only"
              >
                Open {point.label}, rank {index + 1}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
