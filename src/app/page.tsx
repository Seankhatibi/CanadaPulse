import { AppShell } from "@/components/app-shell";
import { DebateBoard } from "@/components/homepage/debate-board";
import { LatestReleaseHero } from "@/components/homepage/latest-release-hero";
import { InteractiveLaunchpad } from "@/components/homepage/interactive-launchpad";
import { ProvinceExplorer } from "@/components/homepage/province-explorer";
import { ReleaseStream } from "@/components/homepage/release-stream";
import { WeeklyBriefingStrip } from "@/components/homepage/weekly-briefing-strip";
import { buildHomepageFeed } from "@/lib/homepage-feed";
import { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";
import { buildProvinceExplorerData } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export default async function Home() {
  const releaseHub = await getMultiSourceReleaseHub();
  const feed = buildHomepageFeed({ releaseHub });
  const weekly = buildLiveWeeklyPulseSummary(releaseHub);
  const provinceExplorer = buildProvinceExplorerData(releaseHub);

  return (
    <AppShell variant="light">
      <ProvinceExplorer data={provinceExplorer} />
      {releaseHub.promotedRelease ? (
        <div className="py-6 sm:py-10">
          <LatestReleaseHero release={releaseHub.promotedRelease} />
        </div>
      ) : null}
      <DebateBoard items={feed.debateItems} />
      <InteractiveLaunchpad />
      <ReleaseStream releases={releaseHub.todayQueue} />
      <WeeklyBriefingStrip weekly={weekly} />
    </AppShell>
  );
}
