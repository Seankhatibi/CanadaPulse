"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Landmark, MapPinned, ShieldCheck } from "lucide-react";
import { ShareStatButton } from "@/components/share-stat-button";
import type { EqualizationExplorerData } from "@/lib/government-money-data";

const Canada3DMap = dynamic(() => import("@/components/homepage/canada-3d-map").then((module) => module.Canada3DMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#09181b]" aria-label="Loading Canada map" />,
});

export function EqualizationExplorer({ data, initialProvince = "quebec" }: { data: EqualizationExplorerData; initialProvince?: string }) {
  const startingProvince = data.values.some((item) => item.slug === initialProvince) ? initialProvince : "quebec";
  const [provinceSlug, setProvinceSlug] = useState(startingProvince);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const selected = useMemo(() => data.values.find((item) => item.slug === provinceSlug) ?? data.values[0], [data.values, provinceSlug]);
  const hovered = data.values.find((item) => item.slug === hoveredSlug) ?? null;
  const visible = hovered ?? selected;

  useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("province", selected.slug);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [selected]);

  if (!selected || !visible) return null;

  return (
    <section className="-mx-3 overflow-hidden bg-[#071315] text-white sm:-mx-6" aria-labelledby="equalization-heading" data-selected-province={selected.slug}>
      <div className="grid lg:grid-cols-[0.76fr_1.24fr]">
        <div className="border-white/10 lg:min-h-[720px] lg:border-r">
          <div className="px-4 py-8 sm:px-8 lg:px-9 lg:py-10">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-amber-300"><Landmark className="size-4" aria-hidden="true" /> {data.fiscalYear} federal transfer table</div>
            <h2 id="equalization-heading" className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Who receives Equalization?</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Choose a province to see its payment and share of the current pool. A zero means no Equalization payment, not that the province receives no federal transfers.</p>

            <label htmlFor="equalization-province" className="mt-7 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Province</label>
            <select id="equalization-province" value={selected.slug} onChange={(event) => setProvinceSlug(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#132528] px-3 text-sm font-black text-white outline-none focus:border-amber-300">
              {data.values.slice().sort((left, right) => left.province.localeCompare(right.province)).map((item) => <option key={item.slug} value={item.slug}>{item.province}</option>)}
            </select>

            <div className="mt-6 border-y border-white/10 py-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{selected.province}</p>
                  <p className="mt-2 font-mono text-5xl font-black">{selected.display}</p>
                </div>
                <p className="font-mono text-sm font-black text-amber-300">{selected.receives ? `${selected.share}% of pool` : "No payment"}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selected.receives ? `Recipient rank #${selected.rank} of 7 for ${data.fiscalYear}.` : `This province is not an Equalization recipient in ${data.fiscalYear}.`}</p>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{data.note}</span></div>
            <p className="mt-4 text-[11px] font-semibold text-slate-500">{data.source} | {data.fiscalYear}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/issue/equalization-epp" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-stone-950 hover:bg-slate-200">Open full table <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <ShareStatButton url={`/government?province=${selected.slug}`} text={`${selected.province} receives ${selected.display} in Equalization for ${data.fiscalYear}${selected.receives ? `, ${selected.share}% of the pool` : ""}. Equalization is financed from federal general revenues.`} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="relative h-[430px] border-y border-white/10 sm:h-[560px] lg:h-[600px] lg:border-t-0">
            <Canada3DMap category={data} selectedProvince={selected.slug} onSelect={setProvinceSlug} onHover={setHoveredSlug} />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-md border border-white/10 bg-[#071315]/90 p-3 backdrop-blur sm:inset-x-6">
              <div><p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{visible.province}</p><p className="mt-1 font-mono text-2xl font-black">{visible.display}</p></div>
              <p className="font-mono text-xs font-black text-amber-300">{visible.receives ? `${visible.share}%` : "No payment"}</p>
            </div>
          </div>
          <div className="px-4 py-6 sm:px-8 lg:px-9">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400"><MapPinned className="size-4" aria-hidden="true" /> Largest recipients</div>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
              {data.values.filter((item) => item.receives).sort((left, right) => right.value - left.value).slice(0, 4).map((item) => (
                <button key={item.slug} type="button" onClick={() => setProvinceSlug(item.slug)} className="border-t border-white/10 pt-3 text-left hover:border-amber-300"><span className="flex items-center justify-between text-xs font-black text-slate-400"><span>{item.abbr}</span><span>#{item.rank}</span></span><span className="mt-1 block font-mono text-lg font-black">{item.display}</span></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
