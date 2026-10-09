import { AppShell } from "@/components/app-shell";
import { MoveOutBudget } from "@/components/move-out-budget";
import { fetchCmhcRentalSnapshot } from "@/lib/cmhc-rental";
import { provinces } from "@/lib/province-directory";
export const dynamic = "force-dynamic";
export const metadata = { title: "Can I afford to move out?" };
export default async function MyLifePage({ searchParams }: { searchParams: Promise<{ province?: string }> }) {
  const [query, rental] = await Promise.all([searchParams, fetchCmhcRentalSnapshot().catch(() => null)]);
  const initialPlace = provinces.find((province) => province.slug === query.province)?.name;
  const markets = rental ? [...rental.provinces, ...rental.metros].map((market) => ({ name: market.geography, rent: market.averageTwoBedroomRent, previousRent: market.previousAverageTwoBedroomRent, vacancy: market.vacancyRate, period: rental.referencePeriod, sourceUrl: rental.sourceUrl })) : [];
  return <AppShell><MoveOutBudget markets={markets} initialPlace={initialPlace} /></AppShell>;
}
