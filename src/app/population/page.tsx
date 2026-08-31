import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PopulationFlowExplorer } from "@/components/population-flow-explorer";
import { PopulationPressureBoard } from "@/components/population-pressure-board";
import { buildPopulationExplorerData, type PopulationFlowId } from "@/lib/population-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Population Flows by Province",
  description: "Explore current IRCC permanent-resident, study-permit and TFWP flows by province, then compare them carefully with Canada's housing pipeline.",
  openGraph: {
    title: "Where is Canada's population change landing?",
    description: "Official immigration flows by province, visualized without combining incompatible datasets.",
    url: "/population",
    siteName: "Canada Pulse",
    locale: "en_CA",
    type: "website",
    images: [{ url: "/api/og/province?province=ontario&topic=newcomers", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where is Canada's population change landing?",
    description: "Official IRCC flows by province, made understandable.",
    images: ["/api/og/province?province=ontario&topic=newcomers"],
  },
};

type PopulationSearchParams = Promise<{ flow?: string | string[]; province?: string | string[] }>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PopulationPage({ searchParams }: { searchParams: PopulationSearchParams }) {
  const [hub, query] = await Promise.all([getMultiSourceReleaseHub(), searchParams]);
  const ircc = hub.todayQueue.find((release) => release.source === "open-government-ircc" && release.releaseType === "ircc-monthly-immigration" && release.status === "live");

  if (!ircc) {
    return (
      <AppShell variant="light">
        <section className="mx-auto max-w-3xl py-16">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Official source unavailable</p>
          <h1 className="mt-3 text-4xl font-black text-stone-950 sm:text-5xl">Population data is temporarily unavailable.</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">Canada Pulse will not display unverified values when the current IRCC files are unavailable. Check source freshness or try again shortly.</p>
          <Link href="/data-status" className="mt-6 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-3 text-sm font-black text-white">Check source status <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </section>
      </AppShell>
    );
  }

  const data = buildPopulationExplorerData(ircc, hub.generatedAt);
  const requestedFlow = first(query.flow);
  const initialFlow = data.categories.some((category) => category.id === requestedFlow)
    ? requestedFlow as PopulationFlowId
    : "permanent-residents";
  const requestedProvince = first(query.province);
  const initialProvince = data.categories.find((category) => category.id === initialFlow)?.values.some((value) => value.slug === requestedProvince)
    ? requestedProvince
    : data.defaultProvince;

  return (
    <AppShell variant="light">
      <PopulationFlowExplorer data={data} initialFlow={initialFlow} initialProvince={initialProvince} />
      <PopulationPressureBoard releases={hub.todayQueue} />
    </AppShell>
  );
}
