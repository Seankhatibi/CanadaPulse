import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EqualizationExplorer } from "@/components/equalization-explorer";
import { FederalMoneyBoard } from "@/components/federal-money-board";
import { buildEqualizationExplorerData } from "@/lib/government-money-data";
import { getMultiSourceReleaseHub, hasStructuredMetrics } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government Money",
  description: "Follow Canada's federal deficit, revenue, program spending, debt charges and Equalization payments using current official data.",
  openGraph: {
    title: "Where does Canada's public money go?",
    description: "The latest federal books and Equalization payments, made visual and understandable.",
    url: "/government",
    siteName: "Canada Pulse",
    locale: "en_CA",
    type: "website",
  },
};

type GovernmentSearchParams = Promise<{ province?: string | string[] }>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GovernmentPage({ searchParams }: { searchParams: GovernmentSearchParams }) {
  const [hub, query] = await Promise.all([getMultiSourceReleaseHub(), searchParams]);
  const finance = hub.todayQueue.find((release) => release.source === "finance-canada" && release.status === "live" && hasStructuredMetrics(release));
  const equalization = buildEqualizationExplorerData();
  const requestedProvince = first(query.province);
  const initialProvince = equalization.values.some((item) => item.slug === requestedProvince) ? requestedProvince : "quebec";

  return (
    <AppShell variant="light">
      {finance ? (
        <FederalMoneyBoard release={finance} />
      ) : (
        <section className="mx-auto max-w-3xl py-14">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Finance Canada source unavailable</p>
          <h1 className="mt-3 text-4xl font-black text-stone-950 sm:text-5xl">The latest federal books could not be verified.</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">Canada Pulse will not replace the Fiscal Monitor with modeled numbers. The current Equalization table remains available below.</p>
          <Link href="/data-status" className="mt-6 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-3 text-sm font-black text-white">Check source status <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </section>
      )}
      <EqualizationExplorer data={equalization} initialProvince={initialProvince} />
    </AppShell>
  );
}
