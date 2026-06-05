import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { HousingDashboard } from "@/components/housing-dashboard";
import { provinces } from "@/lib/canada-pulse-data";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvinceHousingPage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province } = await params;

  if (!provinces.some((item) => item.slug === province)) {
    notFound();
  }

  return (
    <AppShell>
      <HousingDashboard geographySlug={province} />
    </AppShell>
  );
}
