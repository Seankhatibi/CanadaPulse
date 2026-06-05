import Link from "next/link";
import { ArrowRight, Landmark, Scale } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { provinces } from "@/lib/canada-pulse-data";
import { equalizationGovernmentCards } from "@/lib/government-data";
import { getProvince } from "@/lib/canada-pulse-data";

export function generateStaticParams() {
  return provinces.map((province) => ({ province: province.slug }));
}

export default async function ProvinceGovernmentPage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: provinceSlug } = await params;
  const province = getProvince(provinceSlug);

  const equalization = equalizationGovernmentCards.find((item) => item.slug === province.slug);
  const receivesEqualization = Boolean(equalization);
  const fiscalCapacityLabel = receivesEqualization ? "Equalization recipient" : "No Equalization receipt";
  const provinceScore = province.score;

  const localSignals = [
    {
      label: "Province pulse score",
      value: `${provinceScore}/100`,
      detail: "Composite score used across Canada Pulse.",
      width: provinceScore,
    },
    {
      label: "Federal transfer signal",
      value: receivesEqualization ? equalization?.value ?? "$0" : "$0 Equalization",
      detail: receivesEqualization
        ? `${province.name} receives about ${equalization?.share}% of the 2026-27 Equalization pool.`
        : `${province.name} does not receive an Equalization payment in the 2026-27 table.`,
      width: receivesEqualization ? Math.max(12, equalization?.share ?? 0) : 8,
    },
    {
      label: "Budget pressure proxy",
      value: province.pressure,
      detail: "Source-ready placeholder until provincial budget APIs/tables are connected.",
      width: provinceScore,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-white to-sky-500" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>{province.name}</StatusPill>
              <StatusPill>{fiscalCapacityLabel}</StatusPill>
              <StatusPill>Provincial budget route</StatusPill>
            </div>

            <div className="mt-8">
              <SectionHeader
                eyebrow="Provincial government money map"
                title={`${province.name}: public money pressure`}
                body="This route prepares each province for spending, revenue, transfers, debt-service, infrastructure, healthcare, and education breakdowns."
              />
            </div>
          </div>
        </GlassPanel>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.86fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Province fiscal signals</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {localSignals.map((signal) => (
                <div key={signal.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                    <div>
                      <p className="font-semibold text-white">{signal.label}</p>
                      <p className="text-xs text-stone-500">{signal.detail}</p>
                    </div>
                    <p className="font-mono text-xl font-semibold text-white">{signal.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-600" style={{ width: `${Math.min(100, signal.width)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Scale className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">What needs real source wiring next</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {["Health spending", "Education spending", "Infrastructure capital plan", "Debt-service cost", "Own-source revenue"].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <p className="font-semibold text-white">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Connect to {province.name} budget/public accounts tables.</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-stone-300">
              This province route is intentionally source-ready. The federal page uses labelled federal fiscal table
              data; this page is the scaffold for province budget ingestion.
            </p>
            <Link
              href="/government"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950"
            >
              National government view
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
