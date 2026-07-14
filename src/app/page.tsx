import { AppShell } from "@/components/app-shell";
import { DebateBoard } from "@/components/homepage/debate-board";
import { LatestReleaseHero } from "@/components/homepage/latest-release-hero";
import { InteractiveLaunchpad } from "@/components/homepage/interactive-launchpad";
import { ReleaseStream } from "@/components/homepage/release-stream";
import { buildHomepageFeed } from "@/lib/homepage-feed";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export default async function Home() {
  const releaseHub = await getMultiSourceReleaseHub();
  const feed = buildHomepageFeed({ releaseHub });

  return (
    <AppShell variant="light">
      {releaseHub.promotedRelease ? <LatestReleaseHero release={releaseHub.promotedRelease} /> : null}
      <InteractiveLaunchpad />
      <DebateBoard items={feed.debateItems} />
      <ReleaseStream releases={releaseHub.todayQueue} />
    </AppShell>
  );
}
