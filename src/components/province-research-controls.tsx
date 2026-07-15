"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, MapPin } from "lucide-react";
import { provinces } from "@/lib/province-directory";
import type { ProvinceResearchArea } from "@/lib/province-research";

const topics: Array<{ area: ProvinceResearchArea; label: string }> = [
  { area: "overview", label: "Pulse" },
  { area: "housing", label: "Housing" },
  { area: "population", label: "Population" },
  { area: "government", label: "Government" },
  { area: "trade", label: "Trade" },
  { area: "energy", label: "Energy" },
];

function areaHref(province: string, area: ProvinceResearchArea) {
  if (area === "overview") return `/province/${province}`;
  if (area === "population") return `/population/${province}`;
  return `/province/${province}/${area}`;
}

export function ProvinceResearchControls({ province, area }: { province: string; area: ProvinceResearchArea }) {
  const router = useRouter();

  return (
    <div className="grid gap-4 border-y border-stone-200 py-4 lg:grid-cols-[minmax(15rem,0.42fr)_1fr] lg:items-end">
      <label className="min-w-0">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">Change province or territory</span>
        <span className="relative mt-2 flex h-12 items-center rounded-md border border-stone-300 bg-white shadow-sm focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
          <MapPin className="ml-3 size-4 shrink-0 text-red-700" aria-hidden="true" />
          <select
            value={province}
            onChange={(event) => router.push(areaHref(event.target.value, area))}
            className="h-full w-full appearance-none bg-transparent px-3 pr-10 text-sm font-black text-stone-950 outline-none"
            aria-label="Change province or territory"
          >
            {provinces.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4 text-stone-500" aria-hidden="true" />
        </span>
      </label>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">Research view</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-stone-200 p-1 sm:grid-cols-6" role="navigation" aria-label="Province research topics">
          {topics.map((topic) => (
            <button
              key={topic.area}
              type="button"
              onClick={() => router.push(areaHref(province, topic.area))}
              aria-current={area === topic.area ? "page" : undefined}
              className={`min-h-10 rounded-md px-2 py-2 text-xs font-black transition sm:text-sm ${
                area === topic.area
                  ? "bg-stone-950 text-white shadow-sm"
                  : "text-stone-700 hover:bg-white hover:text-stone-950"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
