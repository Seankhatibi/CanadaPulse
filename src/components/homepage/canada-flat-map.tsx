"use client";
import canadaMap from "@/lib/canada-boundaries.json";
export type CanadaMapCategory = { label: string; question?: string; period?: string; lowColor: string; highColor: string; values: { slug: string; abbr: string; intensity: number; display: string; province?: string }[] };
type MapLocation = { id: string; path: string; name: string; labelAnchor: { x: number; y: number } };
function blend(low: string, high: string, intensity: number) {
  const fraction = Math.max(0, Math.min(1, intensity));
  const channels = [1, 3, 5].map((offset) => Math.round(parseInt(low.slice(offset, offset + 2), 16) * (1 - fraction) + parseInt(high.slice(offset, offset + 2), 16) * fraction));
  return `rgb(${channels.join(",")})`;
}
export function CanadaFlatMap({ category, selectedProvince, onSelect, raised = false }: { category: CanadaMapCategory; selectedProvince: string; onSelect: (slug: string) => void; raised?: boolean }) {
  return <svg viewBox={canadaMap.viewBox} className="h-full w-full p-5" style={raised ? { transform: "perspective(1000px) rotateX(16deg) scale(.94)", filter: "drop-shadow(0 22px 12px rgba(0,0,0,.55))" } : undefined} role="group" aria-label={`${raised ? "Raised 3D-style" : "2D"} Canada map: ${category.label}. Use Tab and Enter to choose a province.`}>
    <title>{category.question ?? category.label}</title><desc>Statistics Canada 2021 province and territory cartographic boundaries, Lambert projection. Coastlines generalized for display; uniform geographic scale.</desc>
    {raised ? <g aria-hidden="true">{[14, 10, 6].map((depth) => <g key={depth} transform={`translate(0 ${depth})`}>{canadaMap.locations.map((location: MapLocation) => <path key={location.id} d={location.path} fill="#142e35" stroke="#051115" strokeWidth="3" />)}</g>)}</g> : null}
    {canadaMap.locations.map((location: MapLocation) => {
      const value = category.values.find((item) => item.abbr.toLowerCase() === location.id);
      return <path key={location.id} data-map-province={value?.slug} d={location.path} fill={value ? blend(category.lowColor, category.highColor, value.intensity) : "#334155"} stroke={value?.slug === selectedProvince ? "#ffffff" : "#071315"} strokeWidth={value?.slug === selectedProvince ? 5 : 1.5} role={value ? "button" : "img"} tabIndex={value ? 0 : undefined} aria-label={value ? `${value.province ?? value.slug}: ${value.display}, ${category.period ?? "See source details"}` : `${location.name}: data unavailable`} aria-pressed={value ? value.slug === selectedProvince : undefined} onClick={value ? () => onSelect(value.slug) : undefined} onKeyDown={value ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(value.slug); } } : undefined} className={value ? "cursor-pointer focus:fill-white" : ""}><title>{value ? `${value.province ?? value.slug}: ${value.display}` : `${location.name}: unavailable`}</title></path>;
    })}
    {raised ? <g aria-hidden="true" pointerEvents="none">{category.values.map((value) => {
      const anchor = canadaMap.locations.find((location) => location.id === value.abbr.toLowerCase())?.labelAnchor;
      if (!anchor || (["NB", "NS", "PE"].includes(value.abbr) && value.slug !== selectedProvince)) return null;
      return <g key={value.slug} transform={`translate(${anchor.x} ${anchor.y})`}><rect x="-46" y="-25" width="92" height="48" rx="5" fill="#061b20" fillOpacity=".94" stroke={value.slug === selectedProvince ? "#ffffff" : "#39717a"} /><text textAnchor="middle" y="-7" fill="#b8f6ed" fontSize="14" fontWeight="700">{value.abbr}</text><text textAnchor="middle" y="13" fill="white" fontSize="16" fontWeight="700">{value.display}</text></g>;
    })}</g> : null}
  </svg>;
}
