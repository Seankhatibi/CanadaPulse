import Link from "next/link";
import { Banknote, Landmark, ReceiptText, Scale, ShieldAlert } from "lucide-react";
import { AppShell, GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";
import { ShareStatButton } from "@/components/share-stat-button";
import {
  equalizationGovernmentCards,
  federalExpenseBreakdown,
  federalFiscalSnapshot,
  federalRevenueBreakdown,
  federalTransferBreakdown,
  governmentViralQuestions,
} from "@/lib/government-data";

const maxRevenue = Math.max(...federalRevenueBreakdown.map((item) => item.amount));
const maxExpense = Math.max(...federalExpenseBreakdown.map((item) => item.amount));
const maxTransfer = Math.max(...federalTransferBreakdown.map((item) => item.amount));

export default function GovernmentPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <GlassPanel className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-red-600 via-white to-sky-500" />
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap gap-2">
                <StatusPill>Federal fiscal tables</StatusPill>
                <StatusPill>{federalFiscalSnapshot.period}</StatusPill>
                <StatusPill>Monthly refresh-ready</StatusPill>
              </div>

              <div className="mt-8">
                <SectionHeader
                  eyebrow="Government money map"
                  title="Where public money is coming from, and where it is going."
                  body="The viral government view should make the federal budget feel concrete: taxes collected, program spending, transfers, debt interest, and what provinces receive."
                />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Revenue", federalFiscalSnapshot.revenues, "collected"],
                  ["Program spending", federalFiscalSnapshot.programExpenses, "before debt charges"],
                  ["Debt interest", federalFiscalSnapshot.debtCharges, "public debt charges"],
                  ["Deficit", federalFiscalSnapshot.deficit, "budgetary balance"],
                ].map(([label, value, note]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-black/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-stone-500">{label}</p>
                      <ShareStatButton text={`${label}: ${value} (${note})`} />
                    </div>
                    <p className="mt-2 font-mono text-3xl font-semibold text-white">{value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-red-300">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-md border border-red-300/20 bg-red-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">Canada Pulse read</p>
                <p className="mt-2 text-sm leading-6 text-stone-200">{federalFiscalSnapshot.read}</p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Screenshot fuel</p>
                <h2 className="mt-1 text-xl font-semibold text-white">The questions people argue about</h2>
              </div>
              <ShieldAlert className="size-5 text-red-300" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3">
              {governmentViralQuestions.map((item) => (
                <div key={item.question} className={`rounded-md border p-4 ${item.tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.question}</p>
                    <ShareStatButton text={`${item.question} ${item.answer}`} />
                  </div>
                  <p className="mt-2 text-xs leading-5 opacity-85">{item.answer}</p>
                </div>
              ))}
            </div>
            <Link
              href="/tax-dollar"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950"
            >
              Open your tax receipt
              <ReceiptText className="size-4" aria-hidden="true" />
            </Link>
          </GlassPanel>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Banknote className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Revenue engine</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Start with the sources of federal money. Personal income tax is the main pipe into Ottawa.
            </p>
            <div className="mt-5 grid gap-3">
              {federalRevenueBreakdown.map((item) => (
                <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-stone-500">{item.note}</p>
                    </div>
                    <div className="text-left min-[420px]:text-right">
                      <ShareStatButton text={`${item.label}: ${item.value} federal revenue (${item.change})`} />
                      <p className="font-mono text-xl font-semibold text-white">{item.value}</p>
                      <p className="text-xs text-emerald-200">{item.change}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                      style={{ width: `${Math.max(8, (item.amount / maxRevenue) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Spending engine</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              This is the budget-pressure chart: benefits, transfers, operating expenses, debt interest, and accounting losses.
            </p>
            <div className="mt-5 grid gap-3">
              {federalExpenseBreakdown.map((item) => (
                <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-stone-500">{item.note}</p>
                    </div>
                    <div className="text-left min-[420px]:text-right">
                      <ShareStatButton text={`${item.label}: ${item.value} federal spending (${item.change})`} />
                      <p className="font-mono text-xl font-semibold text-white">{item.value}</p>
                      <p className="text-xs text-red-200">{item.change}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-400"
                      style={{ width: `${Math.max(8, (item.amount / maxExpense) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Scale className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Federal transfers to provinces</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Transfers are where federal money becomes healthcare, social programs, equalization, childcare, and local infrastructure.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {federalTransferBreakdown.map((item) => (
                <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <div className="text-right">
                      <ShareStatButton text={`${item.label}: ${item.value} in federal transfers (${item.change})`} />
                      <p className="mt-2 font-mono text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-emerald-200">{item.change}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500"
                      style={{ width: `${Math.max(8, (item.amount / maxTransfer) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-2">
              <Scale className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Equalization quick view</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Total 2026-27 Equalization pool: $27.2B. Quebec receives the largest absolute amount.
            </p>
            <div className="mt-5 grid gap-3">
              {equalizationGovernmentCards.slice(0, 5).map((item) => (
                <Link
                  key={item.slug}
                  href={`/issue/equalization-epp/${item.slug}`}
                  className="rounded-md border border-white/10 bg-black/35 p-4 transition hover:border-red-400/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{item.province}</p>
                    <p className="font-mono text-xl font-semibold text-white">{item.value}</p>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{item.share}% of Equalization pool</p>
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Plain-English takeaway</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-400">
                If you are not a budget person, remember this: Ottawa collected about $500B, spent about $555B,
                and interest on debt alone was about the same size as the Canada Health Transfer.
              </p>
            </div>
            <ShareStatButton text="Ottawa collected about $500B, spent about $555B, and federal debt interest was about the same size as the Canada Health Transfer." />
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
