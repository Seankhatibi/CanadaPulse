"use client";

import { Calculator, Home, PiggyBank } from "lucide-react";
import { useMemo, useState } from "react";

export function AffordabilityCalculator({
  defaultIncome,
  defaultRent,
  defaultHomePrice,
  defaultChildcare,
}: {
  defaultIncome: number;
  defaultRent: number;
  defaultHomePrice: number;
  defaultChildcare: number;
}) {
  const [income, setIncome] = useState(defaultIncome);
  const [rent, setRent] = useState(defaultRent);
  const [homePrice, setHomePrice] = useState(defaultHomePrice);
  const [householdSize, setHouseholdSize] = useState(1);
  const [hasChildcare, setHasChildcare] = useState(false);

  const result = useMemo(() => {
    const monthlyIncome = income / 12;
    const estimatedTax = monthlyIncome * 0.24;
    const groceries = 420 + householdSize * 165;
    const transport = 260 + Math.max(0, householdSize - 1) * 90;
    const utilities = 230;
    const childcare = hasChildcare ? defaultChildcare : 0;
    const disposable = monthlyIncome - estimatedTax - rent - groceries - transport - utilities - childcare;
    const downPayment = homePrice * 0.08;
    const savings = Math.max(100, disposable * 0.55);

    return {
      monthlyIncome,
      estimatedTax,
      groceries,
      transport,
      utilities,
      childcare,
      disposable,
      rentBurden: (rent / monthlyIncome) * 100,
      downPayment,
      yearsToDownPayment: downPayment / (savings * 12),
      status:
        disposable > 1300 ? "Breathing room" : disposable > 450 ? "Tight but possible" : "Severe squeeze",
    };
  }, [defaultChildcare, hasChildcare, homePrice, householdSize, income, rent]);

  return (
    <div className="rounded-lg border border-black/10 bg-white/72 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-red-600 text-white">
          <Calculator className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Can I Survive Here?</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Rent, taxes, food, transport, childcare, and down payment in one fast scenario.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <NumberControl label="Annual income" value={income} min={30000} max={220000} step={5000} prefix="$" onChange={setIncome} />
        <NumberControl label="Monthly rent" value={rent} min={700} max={5200} step={100} prefix="$" onChange={setRent} />
        <NumberControl label="Home price target" value={homePrice} min={180000} max={1600000} step={25000} prefix="$" onChange={setHomePrice} />
        <NumberControl label="Household size" value={householdSize} min={1} max={6} step={1} onChange={setHouseholdSize} />
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-md border border-black/10 bg-white/65 p-3 text-sm font-medium dark:border-white/10 dark:bg-black/20">
        <input
          type="checkbox"
          checked={hasChildcare}
          onChange={(event) => setHasChildcare(event.target.checked)}
          className="size-4 accent-red-600"
        />
        Include childcare cost
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ResultCard label="Rent burden" value={`${Math.round(result.rentBurden)}%`} icon={<Home className="size-4" />} />
        <ResultCard label="Disposable cash" value={`$${Math.round(result.disposable).toLocaleString()}`} icon={<PiggyBank className="size-4" />} />
        <ResultCard label="Down payment" value={`$${Math.round(result.downPayment).toLocaleString()}`} icon={<Home className="size-4" />} />
        <ResultCard label="Years to save" value={result.yearsToDownPayment.toFixed(1)} icon={<PiggyBank className="size-4" />} />
      </div>

      <div className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">{result.status}</p>
        <p className="mt-1 text-xs leading-5 text-stone-700 dark:text-stone-300">
          Estimate assumes simplified taxes and spending. Connect StatCan, CMHC, and tax tables before treating
          this as financial advice.
        </p>
      </div>
    </div>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  step,
  prefix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-md border border-black/10 bg-white/65 p-3 dark:border-white/10 dark:bg-black/20">
      <span className="flex flex-col gap-1 text-sm font-medium min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-3">
        {label}
        <span className="font-mono text-sm text-stone-600 dark:text-stone-300">
          {prefix}
          {value.toLocaleString()}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-red-600"
      />
    </label>
  );
}

function ResultCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20">
      <div className="text-red-700 dark:text-red-300">{icon}</div>
      <p className="mt-4 text-xs text-stone-600 dark:text-stone-400">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold sm:text-2xl">{value}</p>
    </div>
  );
}
