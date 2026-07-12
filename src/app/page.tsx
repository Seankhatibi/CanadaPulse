import { AppShell } from "@/components/app-shell";
import { DebateBoard } from "@/components/homepage/debate-board";
import { LatestReleaseHero } from "@/components/homepage/latest-release-hero";
import { MoneyRealityCheck } from "@/components/homepage/money-reality-check";
import { ProvinceRankingPanel } from "@/components/homepage/province-ranking-panel";
import { ReleaseStream } from "@/components/homepage/release-stream";
import { WeeklyPulsePreview } from "@/components/homepage/weekly-pulse-preview";
import { gasWizardFallbackPulse, getGasWizardPulse } from "@/lib/gaswizard";
import { getWeeklyPulseSummary } from "@/lib/economic-releases";
import { buildHomepageFeed } from "@/lib/homepage-feed";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";
import { shareCards } from "@/lib/viral-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [releaseHub, gasWizardPulse] = await Promise.all([
    getMultiSourceReleaseHub(),
    getGasWizardPulse().catch(() => gasWizardFallbackPulse),
  ]);
  const weeklySummary = getWeeklyPulseSummary();
  const feed = buildHomepageFeed({
    releaseHub,
    gasMetric: gasWizardPulse.highest ? `${gasWizardPulse.highest.price.toFixed(1)}c/L` : "Watching",
    gasNote: gasWizardPulse.highest?.city ?? "GasWizard",
  });

  return (
    <AppShell variant="light">
      {releaseHub.promotedRelease ? <LatestReleaseHero release={releaseHub.promotedRelease} /> : null}
      <ReleaseStream releases={releaseHub.todayQueue} />
      <DebateBoard items={feed.debateItems} />
      <MoneyRealityCheck />
      <ProvinceRankingPanel ranking={feed.provinceRanking} />
      <WeeklyPulsePreview weeklySummary={weeklySummary} shareCards={shareCards} releases={feed.releases} />
    </AppShell>
  );
}
