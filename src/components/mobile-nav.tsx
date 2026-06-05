"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { provinces } from "@/lib/canada-pulse-data";

const navItems = [
  { href: "/", label: "Pulse" },
  { href: "/housing#survive", label: "Affordability" },
  { href: "/tax-dollar", label: "Tax" },
  { href: "/population", label: "Population" },
  { href: "/government", label: "Government" },
  { href: "/trade", label: "Trade" },
  { href: "/energy", label: "Energy" },
  { href: "/health", label: "Health" },
  { href: "/youth", label: "Youth Future" },
  { href: "/quality-of-life", label: "Quality of Life" },
  { href: "/best-province", label: "Best Province" },
  { href: "/weekly-pulse", label: "Weekly Pulse" },
  { href: "/myth-vs-reality", label: "Myth vs Reality" },
  { href: "/timeline", label: "Timeline Replay" },
  { href: "/data-status", label: "Data Status" },
  { href: "/housing", label: "Housing" },
  { href: "/compare", label: "Compare" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? X : Menu;

  return (
    <div className="relative shrink-0 xl:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        title={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-md border border-black/10 bg-white/70 text-stone-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-stone-50"
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 max-h-[calc(100vh-5rem)] w-[min(17rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border border-black/10 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-stone-950">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-stone-200 dark:bg-white/10" />
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Jump to province
          </p>
          <div className="grid grid-cols-2 gap-1">
            {provinces.map((province) => (
              <Link
                key={province.slug}
                href={`/province/${province.slug}`}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-white/10"
              >
                {province.abbr}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
