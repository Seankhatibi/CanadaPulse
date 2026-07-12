import Link from "next/link";
import { BarChart3, Crown } from "lucide-react";
import { provinces, provinceSymbols } from "@/lib/canada-pulse-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProvinceSelect } from "@/components/province-select";
import { MobileNav } from "@/components/mobile-nav";

const navItems = [
  { href: "/", label: "Latest" },
  { href: "/canada", label: "Economy" },
  { href: "/housing", label: "Housing" },
  { href: "/population", label: "Population" },
  { href: "/compare", label: "Compare" },
  { href: "/data-status", label: "Sources" },
];

export function AppShell({
  children,
  variant = "light",
}: {
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  return (
    <div
      className={
        isLight
          ? "canada-light-shell min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(215,25,32,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_28%),linear-gradient(135deg,#fbf7ef_0%,#f6efe3_52%,#eef6f6_100%)] text-stone-950"
          : "min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%),linear-gradient(135deg,#030303_0%,#090b0d_44%,#130807_100%)] text-stone-50"
      }
    >
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${isLight ? "border-stone-200/80 bg-[#fbf7ef]/88" : "border-white/10 bg-black/82"}`}>
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="Canada Pulse home">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-red-600 text-white shadow-sm sm:size-10">
              <Crown className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={`block truncate text-sm font-semibold tracking-normal sm:text-base ${isLight ? "text-stone-950" : ""}`}>Canada Pulse</span>
              <span className={`hidden text-xs 2xl:block ${isLight ? "text-stone-500" : "text-stone-600 dark:text-stone-400"}`}>
                Canadian economic intelligence
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden min-w-0 items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium leading-none transition lg:px-2.5 lg:text-sm ${
                  isLight ? "text-stone-700 hover:bg-stone-950/5 hover:text-stone-950" : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ProvinceSelect />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl overflow-x-clip px-3 py-4 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className={`mx-auto flex w-full max-w-7xl flex-col gap-3 overflow-x-clip px-3 pb-8 text-xs sm:px-6 md:flex-row md:items-center md:justify-between ${isLight ? "text-stone-600" : "text-stone-500"}`}>
        <span>Canada Pulse turns official Canadian data into timely research briefs, visual breakdowns and province comparisons.</span>
        <span className="font-mono">Official sources | Structured facts | Transparent methodology</span>
      </footer>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
        {eyebrow}
      </p>
      <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-stone-950 dark:text-white sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-3xl text-base leading-7 text-stone-600 dark:text-stone-300">
        {body}
      </p>
    </div>
  );
}

export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`cp-panel min-w-0 rounded-lg border border-stone-200 bg-white/78 shadow-sm shadow-stone-300/30 backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function ProvinceMiniMap() {
  return (
    <div className="grid min-h-80 grid-cols-3 gap-2 rounded-md bg-stone-950 p-3 text-white shadow-inner dark:bg-black/40 min-[430px]:grid-cols-4 sm:grid-cols-5">
      {provinces.map((province) => (
        <Link
          key={province.slug}
          href={`/province/${province.slug}`}
          title={`${province.name}: ${provinceSymbols[province.slug]?.symbol ?? province.status}`}
          className={`group relative flex min-h-20 min-w-0 flex-col justify-between overflow-hidden rounded-md border border-white/10 bg-gradient-to-br ${provinceSymbols[province.slug]?.accent ?? "from-red-600 to-stone-800"} p-2.5 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg sm:p-3`}
        >
          <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />
          <span className="relative flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{province.abbr}</span>
            <BarChart3 className="size-3.5 opacity-75" aria-hidden="true" />
          </span>
          <span className="relative">
            <span className="block font-mono text-lg font-semibold">{province.score}</span>
            <span className="block truncate text-[10px] text-white/75">
              {provinceSymbols[province.slug]?.symbol}
            </span>
          </span>
        </Link>
      ))}
      <div className="col-span-2 flex min-h-20 items-center justify-center rounded-md border border-dashed border-white/20 bg-white/5 text-xs text-white/60 sm:col-span-1">
        Arctic
      </div>
    </div>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-stone-200 bg-white/75 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-stone-300">
      {children}
    </span>
  );
}
