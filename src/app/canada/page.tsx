import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { NationalEconomyBoard } from "@/components/national-economy-board";
import { ProvinceExplorer } from "@/components/homepage/province-explorer";
import { buildNationalEconomyData } from "@/lib/national-economy-data";
import { buildProvinceExplorerData } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canada Economy Now | GDP, Jobs, Inflation and Rates",
  description: "See Canada's latest official GDP, jobs, inflation, retail and interest-rate data, then compare the pressure across provinces.",
};

export default async function CanadaPage() {
  const hub = await getMultiSourceReleaseHub();
  const economy = buildNationalEconomyData(hub);
  const provinces = buildProvinceExplorerData(hub);

  return (
    <AppShell variant="light">
      <NationalEconomyBoard data={economy} />
      <div className="py-8 sm:py-12">
        <ProvinceExplorer data={provinces} initialCategory="jobs" initialProvince="ontario" secondaryHeading />
      </div>
    </AppShell>
  );
}
