import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8");
const packageJson = JSON.parse(read("package.json"));
const schema = read("prisma/schema.prisma");
const bootstrap = read("scripts/bootstrap-production-db.ts");
const cron = read("src/app/api/cron/refresh-data/route.ts");
const migrationsRoot = join(root, "prisma/migrations");

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

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Persistence readiness audit passed: migration, production bootstrap, verification, and fail-closed cron checks are present.");
