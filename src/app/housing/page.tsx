import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { HousingMarketBoard } from "@/components/housing-market-board";
import { ProvinceExplorer } from "@/components/homepage/province-explorer";
import { buildProvinceExplorerData, type ProvinceExplorerCategoryId } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

type HousingSearchParams = Promise<{ province?: string | string[]; topic?: string | string[]; income?: string | string[] }>;

export const metadata: Metadata = {
  title: "Canada Housing Watch | Rent, Supply and Rates",
  description: "Explore current CMHC rent, vacancy and housing-start data by province, alongside Bank of Canada borrowing conditions.",
  alternates: { canonical: "/housing" },
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function validIncome(value?: string) {
  const income = Number(value);
  if (!Number.isFinite(income)) return 60_000;
  return Math.round(Math.min(200_000, Math.max(30_000, income)) / 5_000) * 5_000;
}

export default async function HousingPage({ searchParams }: { searchParams: HousingSearchParams }) {
  const query = await searchParams;
  const hub = await getMultiSourceReleaseHub();
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
      <ProvinceExplorer data={data} initialCategory={category?.id} initialProvince={province?.slug} initialIncome={validIncome(firstParam(query.income))} />
      <HousingMarketBoard releases={hub.todayQueue} />
    </AppShell>
  );
}
