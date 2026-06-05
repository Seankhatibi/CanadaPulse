import { AppShell, GlassPanel, SectionHeader } from "@/components/app-shell";
import { roadmap } from "@/lib/canada-pulse-data";

const sourceGroups = [
  "Statistics Canada",
  "CMHC",
  "Bank of Canada",
  "Open Government Canada",
  "Canada Energy Regulator",
  "CIHI",
  "Public Health Agency of Canada",
  "Provincial open-data portals",
];

export default function MethodologyPage() {
  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <GlassPanel className="p-5 sm:p-7">
          <SectionHeader
            eyebrow="Methodology"
            title="Transparent by design."
            body="Canada Pulse will cite every indicator, separate raw data from derived scores, and explain the weighting behind each public-facing grade."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {sourceGroups.map((source) => (
              <div
                key={source}
                className="rounded-md border border-black/10 bg-white/65 p-4 text-sm font-medium dark:border-white/10 dark:bg-black/20"
              >
                {source}
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h2 className="text-lg font-semibold">Product roadmap</h2>
          <div className="mt-4 grid gap-2">
            {roadmap.map((phase, index) => (
              <div
                key={phase}
                className="flex items-center gap-3 rounded-md border border-black/10 bg-white/65 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <span className="font-mono text-sm text-red-700 dark:text-red-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{phase}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
