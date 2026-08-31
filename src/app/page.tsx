import type { Metadata } from "next";
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

type HomeSearchParams = Promise<{ province?: string | string[]; topic?: string | string[]; income?: string | string[] }>;

const DEFAULT_INCOME = 60_000;

async function getHomepageData() {
  const releaseHub = await getMultiSourceReleaseHub();
  return {
    releaseHub,
    feed: buildHomepageFeed({ releaseHub }),
    weekly: buildLiveWeeklyPulseSummary(releaseHub),
    provinceExplorer: buildProvinceExplorerData(releaseHub),
  };
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseIncome(value?: string) {
  const income = Number(value);
  if (!Number.isFinite(income)) return DEFAULT_INCOME;
  return Math.round(Math.min(200_000, Math.max(30_000, income)) / 1_000) * 1_000;
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
  const income = parseIncome(firstParam(query.income));
  const genericImage = "/api/og/province";

  if (!requestedProvince || !requestedTopic || !provinces.some((province) => province.slug === requestedProvince)) {
    const title = "What changed in Canada's economy today?";
    const description = "The latest official Canadian data, crunched into visual release briefs, youth affordability signals and province comparisons.";
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

  const rentBurden = state.categoryData.id === "rent"
    ? (state.provinceData.value / (income / 12)) * 100
    : null;
  const title = rentBurden === null
    ? `${state.provinceData.province}: ${state.provinceData.display} ${state.categoryData.label.toLowerCase()}`
    : `${state.provinceData.province}: ${rentBurden.toFixed(0)}% of a $${Math.round(income / 1_000)}k salary goes to rent`;
  const description = rentBurden === null
    ? `${state.provinceData.province} ranks #${state.provinceData.rank} of ${state.provinceData.rankOutOf} for ${state.categoryData.label.toLowerCase()}. ${state.provinceData.note}`
    : `CMHC average two-bedroom rent is ${state.provinceData.display} a month, or ${rentBurden.toFixed(1)}% of gross monthly income on a $${income.toLocaleString("en-CA")} salary.`;
  const canonical = `/?province=${encodeURIComponent(state.provinceData.slug)}&topic=${encodeURIComponent(state.categoryData.id)}&income=${income}`;
  const image = `/api/og/province?province=${encodeURIComponent(state.provinceData.slug)}&topic=${encodeURIComponent(state.categoryData.id)}&income=${income}`;

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
  const income = parseIncome(firstParam(query.income));

  return (
    <AppShell variant="light">
      {releaseHub.promotedRelease ? (
        <div className="pb-6 sm:pb-10">
          <LatestReleaseHero release={releaseHub.promotedRelease} />
        </div>
      ) : null}
      <ProvinceExplorer
        data={provinceExplorer}
        initialCategory={state.category as ProvinceExplorerCategoryId | undefined}
        initialProvince={state.province}
        initialIncome={income}
        secondaryHeading
        compact
      />
      <DebateBoard items={feed.debateItems} />
      <InteractiveLaunchpad />
      <ReleaseStream releases={releaseHub.todayQueue} />
      <WeeklyBriefingStrip weekly={weekly} />
    </AppShell>
  );
}
