"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { provinces } from "@/lib/canada-pulse-data";

export function ProvinceSelect() {
  const router = useRouter();

  return (
    <label className="hidden h-10 min-w-44 items-center gap-2 rounded-md border border-red-300/25 bg-red-500/10 px-3 text-sm text-stone-200 shadow-sm ring-1 ring-white/5 transition hover:border-red-200/50 xl:flex 2xl:min-w-56">
      <Search className="size-4" aria-hidden="true" />
      <select
        defaultValue=""
        className="w-full appearance-none bg-transparent pr-1 text-stone-50"
        aria-label="Select province"
        onChange={(event) => {
          if (event.target.value) {
            router.push(`/province/${event.target.value}`);
          }
        }}
      >
        <option value="" disabled>
          Select province
        </option>
        {provinces.map((province) => (
          <option key={province.slug} value={province.slug}>
            {province.name}
          </option>
        ))}
      </select>
      <ChevronDown className="size-4" aria-hidden="true" />
    </label>
  );
}
