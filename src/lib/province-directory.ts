export const provinces = [
  { name: "Alberta", slug: "alberta", abbr: "AB" },
  { name: "British Columbia", slug: "british-columbia", abbr: "BC" },
  { name: "Manitoba", slug: "manitoba", abbr: "MB" },
  { name: "New Brunswick", slug: "new-brunswick", abbr: "NB" },
  { name: "Newfoundland and Labrador", slug: "newfoundland-and-labrador", abbr: "NL" },
  { name: "Nova Scotia", slug: "nova-scotia", abbr: "NS" },
  { name: "Ontario", slug: "ontario", abbr: "ON" },
  { name: "Prince Edward Island", slug: "prince-edward-island", abbr: "PE" },
  { name: "Quebec", slug: "quebec", abbr: "QC" },
  { name: "Saskatchewan", slug: "saskatchewan", abbr: "SK" },
  { name: "Northwest Territories", slug: "northwest-territories", abbr: "NT" },
  { name: "Nunavut", slug: "nunavut", abbr: "NU" },
  { name: "Yukon", slug: "yukon", abbr: "YT" },
] as const;

export const provinceSymbols: Record<string, { symbol: string; motto: string; accent: string; land: string }> = {
  alberta: { symbol: "Wild rose", motto: "Fortis et liber", accent: "from-rose-600 to-sky-700", land: "Prairie energy" },
  "british-columbia": { symbol: "Pacific dogwood", motto: "Splendor sine occasu", accent: "from-sky-700 to-amber-500", land: "Pacific gateway" },
  manitoba: { symbol: "Prairie crocus", motto: "Gloriosus et liber", accent: "from-violet-600 to-emerald-700", land: "Prairie hub" },
  "new-brunswick": { symbol: "Purple violet", motto: "Spem reduxit", accent: "from-amber-600 to-red-700", land: "Atlantic trade" },
  "newfoundland-and-labrador": { symbol: "Pitcher plant", motto: "Quaerite prime regnum dei", accent: "from-emerald-700 to-red-700", land: "North Atlantic resources" },
  "nova-scotia": { symbol: "Mayflower", motto: "Munit haec et altera vincit", accent: "from-blue-700 to-rose-600", land: "Atlantic growth" },
  ontario: { symbol: "White trillium", motto: "Ut incepit fidelis sic permanet", accent: "from-red-700 to-emerald-700", land: "Industrial core" },
  "prince-edward-island": { symbol: "Lady's slipper", motto: "Parva sub ingenti", accent: "from-rose-600 to-emerald-700", land: "Island supply" },
  quebec: { symbol: "Blue flag iris", motto: "Je me souviens", accent: "from-blue-800 to-sky-500", land: "Hydro advantage" },
  saskatchewan: { symbol: "Western red lily", motto: "Multis e gentibus vires", accent: "from-emerald-700 to-amber-500", land: "Food and fuel" },
  "northwest-territories": { symbol: "Mountain avens", motto: "Northern resilience", accent: "from-slate-700 to-yellow-500", land: "Northern corridor" },
  nunavut: { symbol: "Purple saxifrage", motto: "Nunavut sannginivut", accent: "from-sky-700 to-yellow-500", land: "Arctic housing gap" },
  yukon: { symbol: "Fireweed", motto: "Northern opportunity", accent: "from-fuchsia-700 to-emerald-600", land: "Northern gateway" },
};

export function getProvince(slug: string) {
  return provinces.find((province) => province.slug === slug);
}
