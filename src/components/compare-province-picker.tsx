"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Shuffle } from "lucide-react";
import { provinces } from "@/lib/province-directory";

export function CompareProvincePicker({ left, right }: { left: string; right: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateBattle(nextLeft: string, nextRight: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("left", nextLeft);
    params.set("right", nextRight);
    params.delete("income");
    router.push(`/compare?${params.toString()}`);
  }

  function updateSide(side: "left" | "right", value: string) {
    if (side === "left") updateBattle(value, value === right ? left : right);
    else updateBattle(value === left ? right : left, value);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <ProvinceSelect label="First province" value={left} onChange={(value) => updateSide("left", value)} />
        <button type="button" onClick={() => updateBattle(right, left)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-4 text-sm font-black text-stone-800 hover:border-red-300 hover:text-red-800">
          <Shuffle className="size-4" aria-hidden="true" /> Swap
        </button>
        <ProvinceSelect label="Second province" value={right} onChange={(value) => updateSide("right", value)} />
      </div>
      <p className="mt-3 text-xs leading-5 text-stone-500">Choose any two provinces or territories. The comparison URL updates automatically.</p>
    </div>
  );
}

function ProvinceSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="min-w-0 flex-1">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-950 focus:border-red-500 focus:outline-none">
        {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.name}</option>)}
      </select>
    </label>
  );
}
