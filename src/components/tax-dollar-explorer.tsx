"use client";

import { Download, Landmark, MoveRight, ReceiptText, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { provinces } from "@/lib/canada-pulse-data";
import { estimateTaxReceipt, taxProfiles } from "@/lib/tax-data";
import { GlassPanel, SectionHeader, StatusPill } from "@/components/app-shell";

const defaultProvinceOptions = taxProfiles.filter((profile) => profile.slug !== "canada");

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function painTranslation(amount: number) {
  const abs = Math.abs(amount);
  const groceryMonths = Math.max(1, Math.round(abs / 850));
  const rentMonths = Math.max(1, Math.round(abs / 2200));

  if (abs >= 8_000) {
    return `${groceryMonths} months of groceries or about ${rentMonths} extra rent payments`;
  }

  if (abs >= 3_000) {
    return `${groceryMonths} months of groceries`;
  }

  return "a few major bills, car repairs, or a flight home";
}

export function TaxDollarExplorer({
  initialProvince,
  initialIncome,
}: {
  initialProvince: string;
  initialIncome: number;
}) {
  const [income, setIncome] = useState(initialIncome);
  const [provinceSlug, setProvinceSlug] = useState(initialProvince);
  const [originSlug, setOriginSlug] = useState("ontario");
  const [destinationSlug, setDestinationSlug] = useState("alberta");
  const receipt = useMemo(() => estimateTaxReceipt(income, provinceSlug), [income, provinceSlug]);
  const originReceipt = useMemo(() => estimateTaxReceipt(income, originSlug), [income, originSlug]);
  const destinationReceipt = useMemo(() => estimateTaxReceipt(income, destinationSlug), [income, destinationSlug]);
  const allReceipts = useMemo(
    () =>
      defaultProvinceOptions
        .map((profile) => ({
          profile,
          receipt: estimateTaxReceipt(income, profile.slug),
        }))
        .sort((a, b) => b.receipt.totalTax - a.receipt.totalTax),
    [income],
  );
  const currentRank = allReceipts.findIndex((item) => item.profile.slug === receipt.profile.slug) + 1;
  const highestReceipt = allReceipts[0];
  const lowestReceipt = allReceipts.at(-1);
  const moveDelta = originReceipt.totalTax - destinationReceipt.totalTax;
  const selectedProvince = provinces.find((province) => province.slug === provinceSlug);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <GlassPanel className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-white to-red-700" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusPill>{receipt.profile.name}</StatusPill>
              <StatusPill>{receipt.profile.salesTaxLabel} {receipt.profile.salesTaxRate}%</StatusPill>
              <StatusPill>Interactive salary slider</StatusPill>
            </div>

            <div className="mt-8">
              <SectionHeader
                eyebrow="Who pays the most tax?"
                title="Your salary changes by province before you even spend it."
                body="Drag your income, pick a province, and watch the receipt, ranking, and moving-provincial comparison update instantly."
              />
            </div>

            <div className="mt-8 rounded-md border border-red-400/20 bg-red-500/10 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <label className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                    Annual income
                  </span>
                  <span className="mt-2 block font-mono text-5xl font-semibold text-white sm:text-7xl">
                    {formatCurrency(income)}
                  </span>
                  <input
                    type="range"
                    min={35_000}
                    max={250_000}
                    step={1_000}
                    value={income}
                    onChange={(event) => setIncome(Number(event.target.value))}
                    className="mt-5 w-full accent-red-600"
                  />
                </label>

                <label className="min-w-0 lg:w-72">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
                    Province or territory
                  </span>
                  <select
                    value={provinceSlug}
                    onChange={(event) => setProvinceSlug(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/70 px-3 text-sm font-semibold text-white"
                  >
                    <option value="canada">Canada average</option>
                    {defaultProvinceOptions.map((profile) => (
                      <option key={profile.slug} value={profile.slug}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Income tax" value={formatCurrency(receipt.incomeTax)} />
              <Metric label="Sales tax estimate" value={formatCurrency(receipt.salesTax)} />
              <Metric label="Total receipt" value={formatCurrency(receipt.totalTax)} danger />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Share2 className="size-5 text-red-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Share card preview</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-red-400/30 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.35),transparent_35%),linear-gradient(135deg,#070707,#160707)] p-5 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Canada Pulse</p>
              <p className="mt-5 text-2xl font-semibold text-white">
                {receipt.profile.name}
              </p>
              <p className="mt-2 font-mono text-5xl font-semibold text-white">
                {formatCurrency(receipt.totalTax)}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                On {formatCurrency(income)}, this modeled receipt ranks{" "}
                <span className="font-semibold text-white">{currentRank > 0 ? `#${currentRank}` : "against Canada"}</span>{" "}
                across provinces and territories.
              </p>
              {highestReceipt && lowestReceipt ? (
                <p className="mt-4 rounded-md border border-white/10 bg-white/10 p-3 text-sm font-semibold text-red-100">
                  Spread from {highestReceipt.profile.name} to {lowestReceipt.profile.name}:{" "}
                  {formatCurrency(highestReceipt.receipt.totalTax - lowestReceipt.receipt.totalTax)}.
                  That is {painTranslation(highestReceipt.receipt.totalTax - lowestReceipt.receipt.totalTax)}.
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-stone-950">
                  {selectedProvince?.abbr ?? "CA"}
                </span>
                <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-200">
                  Save this card
                </span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-200"
            >
              <Download className="size-4" aria-hidden="true" />
              Screenshot-ready card
            </button>
          </div>
        </GlassPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <MoveRight className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">If you moved provinces...</h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProvinceSelectBox label="From" value={originSlug} onChange={setOriginSlug} />
            <ProvinceSelectBox label="To" value={destinationSlug} onChange={setDestinationSlug} />
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-black/35 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300">
              Modeled tax difference
            </p>
            <p className={`mt-2 font-mono text-4xl font-semibold ${moveDelta >= 0 ? "text-emerald-200" : "text-red-200"}`}>
              {moveDelta >= 0 ? "Save " : "Pay "}
              {formatCurrency(Math.abs(moveDelta))}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Moving from {originReceipt.profile.name} to {destinationReceipt.profile.name} on {formatCurrency(income)} translates to{" "}
              {painTranslation(moveDelta)}.
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                Same income, different province
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Tax receipt leaderboard</h2>
            </div>
            <ReceiptText className="size-5 text-red-300" aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {allReceipts.map((item, index) => (
              <button
                key={item.profile.slug}
                type="button"
                onClick={() => setProvinceSlug(item.profile.slug)}
                className={`block rounded-md border p-4 text-left transition ${
                  item.profile.slug === receipt.profile.slug
                    ? "border-red-300 bg-red-600/25"
                    : "border-white/10 bg-black/35 hover:border-red-400/50 hover:bg-white/10"
                }`}
              >
                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">
                      #{index + 1} {item.profile.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {item.profile.salesTaxLabel} {item.profile.salesTaxRate}% | {index < 3 ? "critical" : index < 7 ? "elevated" : "lower"}
                    </p>
                  </div>
                  <p className="font-mono text-xl font-semibold text-white min-[420px]:text-right">
                    {formatCurrency(item.receipt.totalTax)}
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${index < 3 ? "bg-red-500" : index < 7 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${Math.max(8, (item.receipt.totalTax / allReceipts[0].receipt.totalTax) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-red-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">{receipt.profile.name} spending receipt</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {receipt.spending.map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="font-mono text-lg font-semibold text-white sm:text-right">{formatCurrency(item.amount)}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-600" style={{ width: `${item.share}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono text-xs text-stone-400">{item.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold text-white">Reality check cards</h2>
          <div className="mt-4 grid gap-3">
            {[
              `Your total modeled receipt is ${formatCurrency(receipt.totalTax)}.`,
              `Debt/service lines become painful when rates stay high.`,
              `The spread between top and bottom province is ${formatCurrency((highestReceipt?.receipt.totalTax ?? 0) - (lowestReceipt?.receipt.totalTax ?? 0))}.`,
              `That spread is ${painTranslation((highestReceipt?.receipt.totalTax ?? 0) - (lowestReceipt?.receipt.totalTax ?? 0))}.`,
            ].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-black/35 p-4">
                <p className="text-sm font-semibold leading-6 text-white">{item}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}

function ProvinceSelectBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/70 px-3 text-sm font-semibold text-white"
      >
        {defaultProvinceOptions.map((profile) => (
          <option key={profile.slug} value={profile.slug}>
            {profile.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${danger ? "border-red-400/20 bg-red-500/10" : "border-white/10 bg-white/10"}`}>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
