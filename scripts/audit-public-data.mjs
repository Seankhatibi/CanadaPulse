import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = ["src/app", "src/components"];
const forbidden = [
  "@/lib/mock-data",
  "@/lib/data/mock-queries",
  "@/lib/housing-data",
  "@/lib/population-data",
  "@/lib/health-data",
  "@/lib/trade-energy-data",
  "@/lib/issue-data",
  "@/lib/youth-quality-data",
  "@/lib/viral-data",
  "@/lib/canada-pulse-data",
  "source-ready-demo",
  "official-source-ready-demo",
];
const ignoredUnreferencedLegacyFiles = new Set([
  "src/components/housing-dashboard.tsx",
  "src/components/national-score-panel.tsx",
]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  }));
  return nested.flat();
}

const failures = [];
for (const file of (await Promise.all(roots.map(filesBelow))).flat().filter((file) => /\.(ts|tsx)$/.test(file) && !ignoredUnreferencedLegacyFiles.has(file))) {
  const source = await readFile(file, "utf8");
  for (const marker of forbidden) {
    if (source.includes(marker)) failures.push(`${file}: forbidden public-data dependency ${marker}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Public-data provenance audit passed: no seeded data modules are imported by public routes or components.");
