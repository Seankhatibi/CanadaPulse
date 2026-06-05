import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Download, Sparkles } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { shareCards } from "@/lib/viral-data";

export function generateStaticParams() {
  return shareCards.map((card) => ({ cardId: card.id }));
}

export default async function ShareCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const card = shareCards.find((item) => item.id === cardId);

  if (!card) {
    notFound();
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatusPill>Share card</StatusPill>
            <StatusPill>Canada Pulse</StatusPill>
          </div>
          <ShareStatButton text={`${card.title}: ${card.value}. ${card.body}`} />
        </div>

        <div className={`overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br ${card.tone} p-px shadow-2xl`}>
          <div className="rounded-[7px] bg-black/72 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Canada Pulse</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                  {card.title}
                </h1>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-stone-950">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="font-mono text-7xl font-semibold leading-none text-white sm:text-8xl">{card.value}</p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/65">{card.subtitle}</p>
              </div>
              <div>
                <p className="text-xl leading-8 text-stone-100">{card.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-stone-300">
                <BadgeCheck className="size-4 text-emerald-300" aria-hidden="true" />
                Built from Canada Pulse public-data signals
              </div>
              <Link
                href={card.href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
              >
                Open the full view
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <GlassPanel className="mt-5 p-5">
          <div className="flex items-center gap-2">
            <Download className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">How this becomes viral</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            This page is made to share: one number, one clear claim, and one next click into the full Canada Pulse view.
          </p>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
