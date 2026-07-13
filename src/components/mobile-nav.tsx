"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { provinces } from "@/lib/province-directory";

const navItems = [
  { href: "/", label: "Latest releases" },
  { href: "/releases", label: "Release archive" },
  { href: "/canada", label: "Canadian economy" },
  { href: "/housing", label: "Housing and affordability" },
  { href: "/population", label: "Population" },
  { href: "/compare", label: "Compare provinces" },
  { href: "/tax-dollar", label: "Tax estimator (beta)" },
  { href: "/weekly-pulse", label: "Weekly Pulse" },
  { href: "/data-status", label: "Sources and freshness" },
  { href: "/youth", label: "Youth Future" },
  { href: "/government", label: "Government" },
  { href: "/trade", label: "Trade" },
  { href: "/energy", label: "Energy" },
  { href: "/health", label: "Health" },
];

export function MobileNav({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? X : Menu;
  const isLight = variant === "light";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        title={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`grid size-10 place-items-center rounded-md border shadow-sm ${isLight ? "border-black/10 bg-white/70 text-stone-900" : "border-white/10 bg-white/10 text-stone-50"}`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={`fixed right-3 top-[4.25rem] z-50 max-h-[calc(100vh-5rem)] w-[min(17rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border p-2 shadow-xl ${isLight ? "border-black/10 bg-white" : "border-white/10 bg-stone-950"}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${isLight ? "text-stone-800 hover:bg-stone-100" : "text-stone-100 hover:bg-white/10"}`}
            >
              {item.label}
            </Link>
          ))}
          <div className={`my-2 h-px ${isLight ? "bg-stone-200" : "bg-white/10"}`} />
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Jump to province
          </p>
          <div className="grid grid-cols-2 gap-1">
            {provinces.map((province) => (
              <Link
                key={province.slug}
                href={`/province/${province.slug}`}
                onClick={() => setIsOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${isLight ? "text-stone-800 hover:bg-stone-100" : "text-stone-100 hover:bg-white/10"}`}
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
