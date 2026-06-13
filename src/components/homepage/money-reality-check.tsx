"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MoneyFlowBreakdown, PressureMeter } from "@/components/homepage/data-visuals";
import { issues } from "@/lib/issue-data";
import { estimateTaxReceipt, taxProfiles } from "@/lib/tax-data";

const rentBurdenIssue = issues.find((issue) => issue.slug === "rent-burden");

function rentForProvince(slug: string) {
  const province = rentBurdenIssue?.provinceValues.find((item) => item.slug === slug);
  const burden = province?.numeric ?? 36;
  return {
    burden,
    monthlyRent: Math.round((92000 / 12) * (burden / 100)),
    label: province?.value ?? "36%",
  };
}

export function MoneyRealityCheck() {
  const [provinceSlug, setProvinceSlug] = useState("ontario");
  const [income, setIncome] = useState(92000);
  const [mode, setMode] = useState<"renter" | "buyer">("renter");
  const result = useMemo(() => {
    const tax = estimateTaxReceipt(income, provinceSlug);
    const rent = rentForProvince(provinceSlug);
    const adjustedHousingCost = mode === "buyer" ? Math.round(rent.monthlyRent * 1.72) : rent.monthlyRent;
    const monthlyAfterTax = Math.round((income - tax.totalTax) / 12);
    const leftover = monthlyAfterTax - adjustedHousingCost;
    const burden = Math.round((adjustedHousingCost / Math.max(1, income / 12)) * 100);

    return { tax, rent, adjustedHousingCost, monthlyAfterTax, leftover, burden };
  }, [income, provinceSlug, mode]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-5 rounded-2xl bg-stone-950 p-5 text-white shadow-2xl shadow-stone-300/60 sm:p-7 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Interactive Reality Check</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">What does Canada cost you?</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-300">
            Change province and income to see taxes, housing burden, and what is left. This is the homepage hook that
            gets people playing with the economy.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Province</span>
              <select
                value={provinceSlug}
                onChange={(event) => setProvinceSlug(event.target.value)}
                className="h-11 rounded-md border border-white/10 bg-white px-3 text-sm font-bold text-stone-950"
              >
                {taxProfiles.filter((profile) => profile.slug !== "canada").map((profile) => (
                  <option key={profile.slug} value={profile.slug}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em] text-stone-400">
                Income
                <span className="font-mono text-base text-white">${income.toLocaleString("en-CA")}</span>
              </span>
              <input
                type="range"
                min="35000"
                max="180000"
                step="1000"
                value={income}
                onChange={(event) => setIncome(Number(event.target.value))}
                className="accent-red-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-md bg-white/10 p-1">
              {(["renter", "buyer"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-md px-3 py-2 text-sm font-black capitalize transition ${
                    mode === item ? "bg-white text-stone-950" : "text-stone-300 hover:bg-white/10"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-4 text-stone-950">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Your modeled receipt</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div>
                <p className="text-xs font-bold text-stone-500">Taxes paid</p>
                <p className="font-mono text-3xl font-black">${result.tax.totalTax.toLocaleString("en-CA")}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500">Housing/month</p>
                <p className="font-mono text-3xl font-black">${result.adjustedHousingCost.toLocaleString("en-CA")}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500">Left/month</p>
                <p className={`font-mono text-3xl font-black ${result.leftover < 0 ? "text-red-700" : "text-emerald-700"}`}>
                  ${result.leftover.toLocaleString("en-CA")}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <MoneyFlowBreakdown points={result.tax.spending} total={result.tax.totalTax} />
            </div>
          </div>

          <div className="grid gap-4">
            <PressureMeter
              value={Math.min(100, result.burden * 2)}
              label="Housing pressure"
              detail={`${result.burden}% of gross monthly income goes to modeled ${mode === "buyer" ? "ownership" : "rent"} cost.`}
            />
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-black text-white">
                The same salary can feel completely different once provincial tax and housing costs hit.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/tax-dollar?province=${provinceSlug}&income=${income}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-500"
                >
                  Full tax receipt
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/compare?left=${provinceSlug}&right=alberta&income=${income}`}
                  className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Compare provinces
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
