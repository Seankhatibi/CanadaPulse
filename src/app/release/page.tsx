import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { AppShell, GlassPanel, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import {
  buildReleaseExplainer,
  fetchStatCanDailyEntries,
  fetchStatCanDailyEntryFromUrl,
  findDailyEntryByHref,
  rankDailyEntries,
} from "@/lib/statcan-daily";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";

export default async function ReleaseExplainerPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const decodedUrl = url ? decodeURIComponent(url) : "";
  const entries = rankDailyEntries(await fetchStatCanDailyEntries().catch(() => []));
  const entry = decodedUrl ? findDailyEntryByHref(entries, decodedUrl) ?? await fetchStatCanDailyEntryFromUrl(decodedUrl) : entries.at(0);

  if (!entry) {
    notFound();
  }

  const releaseData = await fetchStatCanReleaseData(entry).catch(() => null);
  const explainer = {
    ...buildReleaseExplainer(entry),
    signals: releaseData?.signals.length ? releaseData.signals : buildReleaseExplainer(entry).signals,
    tableIds: releaseData?.tableIds,
    sourceStatus: releaseData?.sourceStatus ?? "summary_only",
  };
  const maxSignal = Math.max(...explainer.signals.map((signal) => Math.abs(signal.value)), 1);

  return (
    <AppShell>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.42))]">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-black/45 p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Canada Pulse breakdown</StatusPill>
              <StatusPill>{explainer.feed}</StatusPill>
              <StatusPill>{explainer.sourceStatus}</StatusPill>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {explainer.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-300">{explainer.subtitle}</p>
            <p className="mt-4 font-mono text-xs text-stone-500">{explainer.published}</p>
          </div>

          <div className="bg-black/35 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              Plain English
            </p>
            <p className="mt-4 text-xl leading-8 text-white">{explainer.plainEnglish}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ShareStatButton text={`${explainer.title}: ${explainer.plainEnglish}`} />
              <a
                href={explainer.officialUrl}
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

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-white">Quick visual read</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            This chart uses Statistics Canada table data when the release includes comparable tables. If a table is
            not available, Canada Pulse shows a source-summary read instead.
          </p>
          {explainer.tableIds?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {explainer.tableIds.map((tableId) => (
                <span key={tableId} className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 font-mono text-xs text-stone-300">
                  Table {tableId}
                </span>
              ))}
            </div>
          ) : null}
          {releaseData?.wdsDownloads.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {releaseData.wdsDownloads.map((download) =>
                download.downloadUrl ? (
                  <a
                    key={`${download.tableId}-${download.productId}`}
                    href={download.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 font-mono text-xs text-emerald-100 transition hover:bg-emerald-400/15"
                  >
                    Official table {download.productId}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    key={`${download.tableId}-${download.productId}`}
                    className="rounded-md border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 font-mono text-xs text-amber-100"
                  >
                    Table unavailable {download.productId}
                  </span>
                ),
              )}
            </div>
          ) : null}
          <div className="mt-5 grid gap-3">
            {explainer.signals.map((signal) => {
              const isDown = signal.direction === "down";
              const isNeutral = signal.direction === "neutral";
              const width = `${Math.max(14, (Math.abs(signal.value) / maxSignal) * 100)}%`;

              return (
                <div key={`${signal.label}-${signal.display}`} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-white">{signal.label}</p>
                    <p className={`font-mono text-2xl font-semibold ${isNeutral ? "text-amber-200" : isDown ? "text-red-200" : "text-emerald-200"}`}>
                      {signal.display}
                    </p>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${isNeutral ? "bg-amber-300" : isDown ? "bg-red-500" : "bg-emerald-400"}`}
                      style={{ width }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-400">{signal.explanation}</p>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <div className="grid gap-5">
          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Why Canadians should care</h2>
            <div className="mt-4 grid gap-3">
              {explainer.whyItMatters.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-black/35 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-red-600 font-mono text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-stone-300">{item}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">What to watch next</h2>
            <div className="mt-4 grid gap-3">
              {explainer.whatToWatch.map((item) => (
                <div key={item} className="rounded-md border border-amber-300/15 bg-amber-500/10 p-3">
                  <p className="text-sm leading-6 text-amber-50/85">{item}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/weekly-pulse"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Weekly Pulse
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
        >
          Back to homepage
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </AppShell>
  );
}
