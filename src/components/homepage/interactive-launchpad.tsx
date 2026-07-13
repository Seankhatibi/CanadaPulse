import { ArrowRight, GitCompareArrows, Landmark, Search } from "lucide-react";
import { provinces } from "@/lib/province-directory";

const selectClass = "h-11 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:border-red-400";
const inputClass = "h-11 w-full rounded-md border border-white/15 bg-white/10 px-3 font-mono text-sm font-bold text-white placeholder:text-stone-500 focus:border-red-400";

export function InteractiveLaunchpad() {
  return (
    <section className="-mx-3 border-y border-stone-800 bg-stone-950 px-3 py-8 text-white sm:-mx-6 sm:px-6 lg:rounded-none">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Make It Personal</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">Put your province and income into the story</h2>
      </div>

      <div className="grid gap-7 lg:grid-cols-3 lg:divide-x lg:divide-white/10">
        <form action="/compare" className="grid content-start gap-3 lg:pr-7">
          <div className="flex items-center gap-2"><GitCompareArrows className="size-5 text-cyan-300" aria-hidden="true" /><h3 className="text-lg font-black">Province vs province</h3></div>
          <div className="grid grid-cols-2 gap-2">
            <label className="sr-only" htmlFor="home-left-province">First province</label>
            <select id="home-left-province" name="left" defaultValue="ontario" className={selectClass}>
              {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="home-right-province">Second province</label>
            <select id="home-right-province" name="right" defaultValue="alberta" className={selectClass}>
              {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.name}</option>)}
            </select>
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 text-sm font-black text-stone-950 hover:bg-cyan-300">
            Compare official rows <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <form action="/tax-dollar" className="grid content-start gap-3 lg:px-7">
          <div className="flex items-center gap-2"><Landmark className="size-5 text-amber-300" aria-hidden="true" /><h3 className="text-lg font-black">Illustrative tax receipt</h3></div>
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-2">
            <label className="sr-only" htmlFor="home-income">Annual income</label>
            <input id="home-income" name="income" type="number" min="15000" max="1000000" step="1000" defaultValue="92000" className={inputClass} />
            <label className="sr-only" htmlFor="home-tax-province">Province</label>
            <select id="home-tax-province" name="province" defaultValue="ontario" className={selectClass}>
              <option value="canada">Canada</option>
              {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.abbr}</option>)}
            </select>
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-black text-stone-950 hover:bg-amber-200">
            Open receipt <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <form action="/releases" className="grid content-start gap-3 lg:pl-7">
          <div className="flex items-center gap-2"><Search className="size-5 text-red-300" aria-hidden="true" /><h3 className="text-lg font-black">Search the evidence</h3></div>
          <label className="sr-only" htmlFor="home-release-search">Search official releases</label>
          <input id="home-release-search" name="q" type="search" placeholder="Jobs, rent, permits, inflation..." className={inputClass} />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white hover:bg-red-500">
            Search releases <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
