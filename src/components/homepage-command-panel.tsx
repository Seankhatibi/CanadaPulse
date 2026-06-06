"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, MapPinned, Search, Sparkles } from "lucide-react";
import { provinces } from "@/lib/canada-pulse-data";

const concernOptions = [
  { label: "Food inflation", href: "/issue/food-inflation" },
  { label: "Rent burden", href: "/issue/rent-burden" },
  { label: "Population vs housing", href: "/issue/population-vs-housing" },
  { label: "Youth jobs", href: "/issue/youth-jobs" },
  { label: "Tax receipt", href: "/tax-dollar" },
  { label: "Equalization / EPP", href: "/issue/equalization-epp" },
  { label: "Canada Pulse Score", href: "/#pulse-score" },
  { label: "Weekly data drops", href: "/weekly-pulse" },
];

const lensOptions = [
  { label: "Young adult", href: "/youth" },
  { label: "New family", href: "/best-province?stage=new-family" },
  { label: "Renter", href: "/housing#survive" },
  { label: "Taxpayer", href: "/tax-dollar" },
  { label: "Newcomer", href: "/best-province?stage=newcomer" },
  { label: "Retiree", href: "/best-province?stage=retiree" },
];

export function HomepageCommandPanel() {
  const router = useRouter();

  function goTo(value: string) {
    if (value) router.push(value);
  }

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-black/35 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
        <Sparkles className="size-4" aria-hidden="true" />
        Start with what you feel
      </div>
      <div className="mt-3 grid gap-2">
        <label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-stone-200">
          <Search className="size-4 shrink-0 text-red-200" aria-hidden="true" />
          <select
            defaultValue=""
            aria-label="Choose a concern"
            className="min-w-0 flex-1 appearance-none truncate bg-transparent text-white outline-none"
            onChange={(event) => goTo(event.target.value)}
          >
            <option value="" disabled className="bg-stone-950 text-white">
              Choose a concern
            </option>
            {concernOptions.map((option) => (
              <option key={option.href} value={option.href} className="bg-stone-950 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-stone-200">
          <MapPinned className="size-4 shrink-0 text-red-200" aria-hidden="true" />
          <select
            defaultValue=""
            aria-label="Choose a province"
            className="min-w-0 flex-1 appearance-none truncate bg-transparent text-white outline-none"
            onChange={(event) => goTo(event.target.value)}
          >
            <option value="" disabled className="bg-stone-950 text-white">
              Choose province
            </option>
            {provinces.map((province) => (
              <option key={province.slug} value={`/province/${province.slug}`} className="bg-stone-950 text-white">
                {province.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-stone-200">
          <ArrowRight className="size-4 shrink-0 text-red-200" aria-hidden="true" />
          <select
            defaultValue=""
            aria-label="Choose a life lens"
            className="min-w-0 flex-1 appearance-none truncate bg-transparent text-white outline-none"
            onChange={(event) => goTo(event.target.value)}
          >
            <option value="" disabled className="bg-stone-950 text-white">
              Choose your lens
            </option>
            {lensOptions.map((option) => (
              <option key={option.href} value={option.href} className="bg-stone-950 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
