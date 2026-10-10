"use client";
import canadaMap from "@/lib/canada-boundaries.json";
export type CanadaMapCategory = { label: string; question?: string; period?: string; lowColor: string; highColor: string; national?: unknown; values: { slug: string; abbr: string; intensity: number; display: string; province?: string; rank?: number | null; rankOutOf?: number }[] };
type MapLocation = { id: string; path: string; name: string; labelAnchor: { x: number; y: number } };
function blend(low: string, high: string, intensity: number) {
  const fraction = Math.max(0, Math.min(1, intensity));
  const channels = [1, 3, 5].map((offset) => Math.round(parseInt(low.slice(offset, offset + 2), 16) * (1 - fraction) + parseInt(high.slice(offset, offset + 2), 16) * fraction));
  return `rgb(${channels.join(",")})`;
}
const callouts: Record<string, { x: number; y: number }> = {
  pe: { x: 1070, y: 570 }, nb: { x: 1070, y: 700 }, ns: { x: 1070, y: 830 },
  ab: { x: 198, y: 548 }, sk: { x: 314, y: 638 }, mb: { x: 438, y: 582 },
  bc: { x: 94, y: 455 },
};
export function CanadaFlatMap({ category, selectedProvince, onSelect }: { category: CanadaMapCategory; selectedProvince: string; onSelect: (slug: string) => void; raised?: boolean }) {
  return <svg viewBox="-20 -20 1180 920" className="h-full w-full" role="group" aria-label={`Canada ranking map: ${category.label}. ${category.national ? "Canada-wide update; provincial rankings are not available." : "Each label shows the value and rank. Use Tab and Enter to choose a province."}`}>
    <title>{category.question ?? category.label}</title><desc>Official Statistics Canada province and territory boundaries. #1 is the highest value; tied values share a rank. Grey areas have no comparable data.</desc>
    {canadaMap.locations.map((location: MapLocation) => {
      const value = category.values.find((item) => item.abbr.toLowerCase() === location.id);
      const label = value ? `${value.province ?? location.name}: ${value.display}, rank ${value.rank ?? "unavailable"} of ${value.rankOutOf ?? category.values.length}, ${category.period ?? "see source"}` : `${location.name}: ${category.national ? "Canada-wide update; no provincial ranking" : "no comparable data"}`;
      return <path key={location.id} data-map-province={location.id} d={location.path} fill={value ? blend(category.lowColor, category.highColor, value.intensity) : category.national ? blend(category.lowColor, category.highColor, .35) : "#334155"} stroke={value?.slug === selectedProvince ? "#ffffff" : "#071315"} strokeWidth={value?.slug === selectedProvince ? 5 : 1.5} role={value ? "button" : "img"} tabIndex={value ? 0 : undefined} aria-label={label} aria-pressed={value ? value.slug === selectedProvince : undefined} onClick={value ? () => onSelect(value.slug) : undefined} onKeyDown={value ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(value.slug); } } : undefined} className={value ? "cursor-pointer focus:stroke-white focus:outline-none" : ""}><title>{label}</title></path>;
    })}
    {!category.national ? <g>{canadaMap.locations.map((location: MapLocation) => {
      const value = category.values.find((item) => item.abbr.toLowerCase() === location.id);
      const anchor = location.labelAnchor;
      const position = callouts[location.id] ?? anchor;
      return <g key={location.id}>
        {["pe", "nb", "ns"].includes(location.id) ? <path d={`M ${anchor.x} ${anchor.y} L 960 ${position.y} L ${position.x - 57} ${position.y}`} fill="none" stroke="#b8d3d7" strokeWidth="2" pointerEvents="none" /> : null}
        <g transform={`translate(${position.x} ${position.y})`} role={value ? "button" : "img"} tabIndex={value ? 0 : undefined} aria-label={value ? `Select ${location.name}: ${value.display}, rank ${value.rank ?? "unavailable"}` : `${location.name}: no comparable data`} aria-pressed={value ? value.slug === selectedProvince : undefined} onClick={value ? () => onSelect(value.slug) : undefined} onKeyDown={value ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(value.slug); } } : undefined} className={value ? "group cursor-pointer focus:outline-none" : ""}>
          <rect className="group-focus:stroke-white" x="-57" y="-39" width="114" height="78" rx="9" fill="#071b20" fillOpacity=".96" stroke={value?.slug === selectedProvince ? "white" : "#53777d"} strokeWidth="2" />
          <text textAnchor="middle" y="-16" fill="#b8f6ed" fontSize="20" fontWeight="700">{location.id.toUpperCase()}{value?.rank ? ` · #${value.rank}` : ""}</text>
          <text textAnchor="middle" y="12" fill="white" fontSize={value && value.display.length > 9 ? "16" : "22"} fontWeight="700">{value?.display ?? "No data"}</text>
        </g>
      </g>;
    })}</g> : null}
  </svg>;
}
