import type { Metadata } from "next";
import { LifeSeriesBoard } from "@/components/life-series-board";
import { getLifeSeries } from "@/lib/life-series";
import { AppShell } from "@/components/app-shell";
import { ProvinceExplorer } from "@/components/homepage/province-explorer";
import { YouthPressureBoard } from "@/components/youth-pressure-board";
import { buildProvinceExplorerData, type ProvinceExplorerCategoryId } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

type YouthSearchParams = Promise<{ province?: string | string[]; topic?: string | string[]; income?: string | string[] }>;

export const metadata: Metadata = {
  title: "Can young Canadians still build a life here?",
  description: "Explore rent, jobs, inflation, housing supply and rates by province using current official Canadian data.",
  alternates: { canonical: "/youth" },
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function validIncome(value?: string) {
  const income = Number(value);
  if (!Number.isFinite(income)) return 60_000;
  return Math.round(Math.min(200_000, Math.max(30_000, income)) / 5_000) * 5_000;
}

export default async function YouthPage({ searchParams }: { searchParams: YouthSearchParams }) {
  const query = await searchParams;
  const [hub, series] = await Promise.all([getMultiSourceReleaseHub(), getLifeSeries()]);
  const data = buildProvinceExplorerData(hub);
  const requestedCategory = firstParam(query.topic) as ProvinceExplorerCategoryId | undefined;
  const category = data.categories.find((item) => item.id === requestedCategory)
    ?? data.categories.find((item) => item.id === "rent")
    ?? data.categories[0];
  const requestedProvince = firstParam(query.province);
  const province = category?.values.find((item) => item.slug === requestedProvince)
    ?? category?.values.find((item) => item.slug === data.defaultProvince)
    ?? category?.values[0];

  return (
    <AppShell variant="light">
      <LifeSeriesBoard series={series.filter((item) => item.topic === "work")} title="Young Canadians: jobs, pay and studying" />
      <p className="mt-6 text-sm text-stone-600">The province explorer below adds general household context. Economy-wide jobs and prices are not youth-specific observations.</p>
      <ProvinceExplorer
        data={data}
        initialCategory={category?.id}
        initialProvince={province?.slug}
        initialIncome={validIncome(firstParam(query.income))}
      />
      <YouthPressureBoard releases={hub.todayQueue} />
    </AppShell>
  );
}
