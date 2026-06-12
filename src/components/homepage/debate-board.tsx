import Link from "next/link";
import { ArrowRight, Banknote, BriefcaseBusiness, CircleDollarSign, Flame, HeartPulse, Home, Landmark, Users } from "lucide-react";
import { MiniDataVisual } from "@/components/homepage/mini-data-visual";
import type { HomepageFeedItem } from "@/lib/homepage-feed";

const topicIcons = {
  Housing: Home,
  Food: Flame,
  Jobs: BriefcaseBusiness,
  Taxes: Banknote,
  Rates: CircleDollarSign,
  Energy: Flame,
  "Government money": Landmark,
  Health: HeartPulse,
  Population: Users,
};

function trustCopy(status: HomepageFeedItem["trustStatus"]) {
  if (status === "live") return "live";
  if (status === "source-linked") return "source-linked";
  return "import pending";
}

export function DebateBoard({ items }: { items: HomepageFeedItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">The Debate Board</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-4xl">The topics Canadians are actually arguing about</h2>
        <p className="mt-3 text-sm leading-6 text-stone-400">
          Each card opens the Canada Pulse breakdown first, with sources and deeper charts inside.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = topicIcons[item.topic as keyof typeof topicIcons] ?? Flame;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-h-[275px] flex-col justify-between rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-red-400/50 hover:bg-white/[0.075]"
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-md bg-black/40 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-stone-300">
                    <Icon className="size-3.5 text-red-300" aria-hidden="true" />
                    {item.topic}
                  </div>
                  <ArrowRight className="size-4 text-stone-600 transition group-hover:text-red-200" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black leading-snug text-white">{item.headline}</h3>
                <div className="mt-4">
                  <p className="font-mono text-4xl font-black text-white">{item.metric}</p>
                  <p className="mt-1 line-clamp-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    {item.metricLabel}
                  </p>
                </div>
                <div className="mt-5">
                  <MiniDataVisual points={item.visualPoints} tone={item.tone} maxItems={3} compact />
                </div>
              </div>
              <p className="mt-5 text-[11px] text-stone-500">
                {item.source} | {item.period} | {trustCopy(item.trustStatus)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
