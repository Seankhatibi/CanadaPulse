import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8");
const packageJson = JSON.parse(read("package.json"));
const schema = read("prisma/schema.prisma");
const bootstrap = read("scripts/bootstrap-production-db.ts");
const cron = read("src/app/api/cron/refresh-data/route.ts");
const importer = read("src/lib/etl/importers.ts");
const releaseHub = read("src/lib/release-hub.ts");
const migrationsRoot = join(root, "prisma/migrations");
const sourceCacheTags = [
  ["canada-pulse-statcan", "src/lib/etl/statcan-adapter.ts"],
  ["canada-pulse-cmhc", "src/lib/cmhc-housing.ts"],
  ["canada-pulse-bank-of-canada", "src/lib/bank-of-canada-reports.ts"],
  ["canada-pulse-finance-canada", "src/lib/finance-canada-fiscal.ts"],
  ["canada-pulse-ircc", "src/lib/ircc-immigration.ts"],
  ["canada-pulse-cihi", "src/lib/cihi-health.ts"],
  ["canada-pulse-official-monitors", "src/lib/official-source-monitors.ts"],
];

if (!existsSync(migrationsRoot) || !readdirSync(migrationsRoot).some((entry) => existsSync(join(migrationsRoot, entry, "migration.sql")))) {
  failures.push("No deployable Prisma migration exists.");
}
for (const script of ["db:migrate:deploy", "db:bootstrap:production", "db:verify:production"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing npm script: ${script}.`);
}
for (const model of ["SourceDataset", "DataRefreshRun", "ReleaseEvent", "TimeSeriesValue"]) {
  if (!schema.includes(`model ${model} {`)) failures.push(`Missing Prisma model: ${model}.`);
}
for (const field of ["source", "slug", "metricCount"]) {
  if (!new RegExp(`^\\s*${field}\\s+`, "m").test(schema)) failures.push(`ReleaseEvent is missing query metadata: ${field}.`);
}
if (bootstrap.includes("db:seed") || bootstrap.includes("prisma/seed")) {
  failures.push("Production bootstrap references the fallback seed path.");
}
if (!cron.includes("!process.env.CRON_SECRET") && !cron.includes("!cronSecret")) {
  failures.push("Production cron does not fail closed when CRON_SECRET is absent.");
}
if (!cron.includes("status: ok ? 200 : 503")) failures.push("Production cron does not report unavailable persistence as a failed source check.");
if (!importer.includes("shouldReplacePersistedRelease")) failures.push("Release imports do not protect stored structured evidence from downgrade.");
if (!importer.includes("updateSourceDatasetCheckpoint")) failures.push("Source dataset checkpoints are not derived from the newest stored live release.");
if (!importer.includes("!release.archiveFallback")) failures.push("Archived fallback releases are not excluded from fresh release writes.");
if (!releaseHub.includes("!release.archiveFallback")) failures.push("Archived fallback releases are not excluded from homepage promotion.");
for (const [tag, sourceFile] of sourceCacheTags) {
  if (!cron.includes(`"${tag}"`)) failures.push(`Production cron does not invalidate ${tag}.`);
  if (!read(sourceFile).includes(`"${tag}"`)) failures.push(`${sourceFile} is not attached to ${tag}.`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Persistence readiness audit passed: migration, production bootstrap, fail-closed cron, and source-level cache invalidation checks are present.");
