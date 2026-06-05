import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Share2 } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import { findHubRelease } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export default async function PulseReleasePage({
  params,
}: {
  params: Promise<{ source: string; slug: string }>;
}) {
  const { source, slug } = await params;
  const release = await findHubRelease(source, slug);

  if (!release) {
    notFound();
  }

  const maxPoint = Math.max(
    ...release.chartPayloads.flatMap((chart) => chart.points.map((point) => Math.abs(point.value))),
    1,
  );
  const impactScores = [
    { label: "Importance", value: release.importanceScore, tone: "bg-red-500" },
    { label: "Youth impact", value: release.youthImpactScore, tone: "bg-amber-300" },
    { label: "Housing impact", value: release.housingImpactScore, tone: "bg-emerald-400" },
  ];

  return (
    <AppShell>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.42))]">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-black/45 p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Canada Pulse breakdown</StatusPill>
              <StatusPill>{release.publisher}</StatusPill>
              <StatusPill>{release.status}</StatusPill>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {release.title}
            </h1>
            <p className="mt-4 font-mono text-xs text-stone-500">
              {release.releaseDate} · {release.referencePeriod}
            </p>
          </div>

          <div className="bg-black/35 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Plain English</p>
            <p className="mt-4 text-xl leading-8 text-white">{release.plainEnglishSummary}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ShareStatButton text={release.socialSummary} />
              <a
                href={release.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/10 px-2.5 text-xs font-semibold text-stone-200 transition hover:bg-white/15"
              >
                Official source
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {impactScores.map((score) => (
          <GlassPanel key={score.label} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{score.label}</p>
              <p className="font-mono text-2xl font-semibold text-white">{score.value}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${score.tone}`} style={{ width: `${Math.min(100, score.value)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              Canada Pulse uses this score to decide whether the release belongs on the homepage and which audiences
              should see it first.
            </p>
          </GlassPanel>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Share2 className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-white">What changed</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {release.headlineFacts.map((fact, index) => (
              <div key={fact} className="flex gap-3 rounded-md border border-white/10 bg-black/35 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-red-600 font-mono text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-stone-300">{fact}</p>
              </div>
            ))}
          </div>

          {release.chartPayloads.length ? (
            <div className="mt-6 grid gap-4">
              {release.chartPayloads.map((chart) => (
                <div key={chart.title} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <h3 className="font-semibold text-white">{chart.title}</h3>
                  <div className="mt-4 grid gap-3">
                    {chart.points.map((point) => {
                      const isDown = point.direction === "down";
                      const isNeutral = point.direction === "neutral";
                      const width = `${Math.max(12, (Math.abs(point.value) / maxPoint) * 100)}%`;

                      return (
                        <div key={`${chart.title}-${point.label}`} className="grid gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{point.label}</p>
                            <p className={`font-mono text-sm font-semibold ${isNeutral ? "text-amber-200" : isDown ? "text-red-200" : "text-emerald-200"}`}>
                              {point.display}
                            </p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${isNeutral ? "bg-amber-300" : isDown ? "bg-red-500" : "bg-emerald-400"}`}
                              style={{ width }}
                            />
                          </div>
                          <p className="text-xs leading-5 text-stone-500">{point.plainEnglish}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </GlassPanel>

        <div className="grid gap-5">
          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Canada Pulse translation</h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-md border border-white/10 bg-black/35 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-200">Affected areas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {release.affectedAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-black/35 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Shareable read</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{release.socialSummary}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/35 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Data status</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {release.status === "live"
                    ? "Live values or report facts were fetched from the official source."
                    : release.status === "summary_only"
                      ? "The release was detected, but detailed table extraction is still limited for this item."
                      : "The source is monitored and linked; detailed importer work is still pending."}
                </p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Provincial read</h2>
            <div className="mt-4 grid gap-3">
              {release.provinceBreakdown.length ? (
                release.provinceBreakdown.map((item) => (
                  <div key={item.province} className="rounded-md border border-white/10 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.province}</p>
                      <p className="font-mono text-sm font-semibold text-red-200">{item.value}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{item.note}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-white/10 bg-black/35 p-3 text-sm leading-6 text-stone-400">
                  This source is being monitored nationally first. Province-level values will appear here once the
                  source exposes a reliable provincial table or dataset.
                </p>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Source trail</h2>
            <div className="mt-4 grid gap-2">
              {release.sourceLinks.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/15"
                >
                  {link.label}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to homepage
        </Link>
        <Link
          href="/weekly-pulse"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
        >
          Weekly Pulse
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </AppShell>
  );
}
