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
      <div className="mb-5 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-amber-50">
        <p className="font-black">Illustrative tax estimator</p>
        <p className="mt-1 text-sm leading-6 text-amber-100/80">This tool uses simplified effective tax rates and a modeled spending allocation. It is useful for exploring scenarios, but it is not a CRA calculation, tax advice, or an official accounting of a specific person&apos;s taxes.</p>
      </div>
      <TaxDollarExplorer
        initialProvince={resolvedSearchParams?.province ?? "canada"}
        initialIncome={Number.isFinite(income) ? income : 92000}
      />
    </AppShell>
  );
}
