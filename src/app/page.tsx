import type { Metadata } from "next";
import { cache } from "react";
import { AppShell } from "@/components/app-shell";
import { DebateBoard } from "@/components/homepage/debate-board";
import { LatestReleaseHero } from "@/components/homepage/latest-release-hero";
import { InteractiveLaunchpad } from "@/components/homepage/interactive-launchpad";
import { ProvinceExplorer } from "@/components/homepage/province-explorer";
import { ReleaseStream } from "@/components/homepage/release-stream";
import { WeeklyBriefingStrip } from "@/components/homepage/weekly-briefing-strip";
import { buildHomepageFeed } from "@/lib/homepage-feed";
import { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";
import { provinces } from "@/lib/province-directory";
import { buildProvinceExplorerData, type ProvinceExplorerCategoryId, type ProvinceExplorerData } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

type HomeSearchParams = Promise<{ province?: string | string[]; topic?: string | string[] }>;

const getHomepageData = cache(async () => {
  const releaseHub = await getMultiSourceReleaseHub();
  return {
    releaseHub,
    feed: buildHomepageFeed({ releaseHub }),
    weekly: buildLiveWeeklyPulseSummary(releaseHub),
    provinceExplorer: buildProvinceExplorerData(releaseHub),
  };
});

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveExplorerState(data: ProvinceExplorerData, query: Awaited<HomeSearchParams>) {
  const requestedCategory = firstParam(query.topic);
  const category = data.categories.find((item) => item.id === requestedCategory) ?? data.categories[0];
  const requestedProvince = firstParam(query.province);
  const province = category?.values.find((item) => item.slug === requestedProvince)
    ?? category?.values.find((item) => item.slug === data.defaultProvince)
    ?? category?.values[0];

  return {
    category: category?.id,
    province: province?.slug,
    categoryData: category,
    provinceData: province,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: HomeSearchParams }): Promise<Metadata> {
  const query = await searchParams;
  const requestedProvince = firstParam(query.province);
  const requestedTopic = firstParam(query.topic);
  const genericImage = "/api/og/province";

  if (!requestedProvince || !requestedTopic || !provinces.some((province) => province.slug === requestedProvince)) {
    const title = "Can you build a life in your province?";
    const description = "Compare jobs, rent, inflation, housing supply and newcomer flows across Canada using current official data.";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: "/",
        siteName: "Canada Pulse",
        locale: "en_CA",
        type: "website",
        images: [{ url: genericImage, width: 1200, height: 630, alt: "Canada Pulse province explorer" }],
      },
      twitter: { card: "summary_large_image", title, description, images: [genericImage] },
    };
  }

  const { provinceExplorer } = await getHomepageData();
  const state = resolveExplorerState(provinceExplorer, query);
  if (!state.categoryData || !state.provinceData || state.category !== requestedTopic) {
    return { title: "Canada Pulse | Canadian Economic Intelligence" };
  }

  const title = `${state.provinceData.province}: ${state.provinceData.display} ${state.categoryData.label.toLowerCase()}`;
  const description = `${state.provinceData.province} ranks #${state.provinceData.rank} of ${state.provinceData.rankOutOf} for ${state.categoryData.label.toLowerCase()}. ${state.provinceData.note}`;
  const canonical = `/?province=${encodeURIComponent(state.provinceData.slug)}&topic=${encodeURIComponent(state.categoryData.id)}`;
  const image = `/api/og/province?province=${encodeURIComponent(state.provinceData.slug)}&topic=${encodeURIComponent(state.categoryData.id)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Canada Pulse",
      locale: "en_CA",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${state.provinceData.province} ${state.categoryData.label} ranking` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function Home({ searchParams }: { searchParams: HomeSearchParams }) {
  const query = await searchParams;
  const { releaseHub, feed, weekly, provinceExplorer } = await getHomepageData();
  const state = resolveExplorerState(provinceExplorer, query);

  return (
    <AppShell variant="light">
      <ProvinceExplorer
        data={provinceExplorer}
        initialCategory={state.category as ProvinceExplorerCategoryId | undefined}
        initialProvince={state.province}
      />
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
