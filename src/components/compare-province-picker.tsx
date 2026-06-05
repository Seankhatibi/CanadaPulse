"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Shuffle } from "lucide-react";
import { provinces } from "@/lib/canada-pulse-data";

export function CompareProvincePicker({
  left,
  right,
  income,
}: {
  left: string;
  right: string;
  income: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateBattle(nextLeft: string, nextRight: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("left", nextLeft);
    params.set("right", nextRight);
    params.set("income", String(income));
    router.push(`/compare?${params.toString()}`);
  }

  function updateSide(side: "left" | "right", value: string) {
    if (side === "left") {
      updateBattle(value, value === right ? left : right);
      return;
    }

    updateBattle(value === left ? right : left, value);
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <ProvinceSelect label="First province" value={left} onChange={(value) => updateSide("left", value)} />
        <button
          type="button"
          onClick={() => updateBattle(right, left)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 lg:mb-0"
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Swap
        </button>
        <ProvinceSelect label="Second province" value={right} onChange={(value) => updateSide("right", value)} />
      </div>
      <p className="mt-3 text-xs leading-5 text-stone-500">
        Pick any two provinces or territories. The URL updates automatically so the battle can be shared.
      </p>
    </div>
  );
}

function ProvinceSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0 flex-1">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/70 px-3 text-sm font-semibold text-white"
      >
        {provinces.map((province) => (
          <option key={province.slug} value={province.slug}>
            {province.name}
          </option>
        ))}
      </select>
    </label>
  );
}
