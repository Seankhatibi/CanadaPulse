import { AppShell } from "@/components/app-shell";
import { TaxDollarExplorer } from "@/components/tax-dollar-explorer";

export default async function TaxDollarPage({
  searchParams,
}: {
  searchParams?: Promise<{ province?: string; income?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const income = Number(resolvedSearchParams?.income ?? "92000");

  return (
    <AppShell>
      <TaxDollarExplorer
        initialProvince={resolvedSearchParams?.province ?? "canada"}
        initialIncome={Number.isFinite(income) ? income : 92000}
      />
    </AppShell>
  );
}
