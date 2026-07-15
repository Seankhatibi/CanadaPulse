import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { ReleaseChartPayload } from "@/lib/release-hub";

function signalFor(chartTitle: string, direction: ReleaseChartPayload["points"][number]["direction"]) {
  if (direction === "neutral") return { Icon: Minus, label: "No clear change", className: "bg-stone-200 text-stone-700", bar: "bg-stone-500" };
  const rising = direction === "up";
  const pressureWhenRising = /rent|price|cost|unemployment|debt|deficit|inflation|mortgage/i.test(chartTitle);
  const reliefWhenRising = /vacancy/i.test(chartTitle);
  const positive = reliefWhenRising ? rising : pressureWhenRising ? !rising : rising;
  return {
    Icon: rising ? ArrowUp : ArrowDown,
    label: rising ? "Increased" : "Decreased",
    className: positive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800",
    bar: positive ? "bg-emerald-600" : "bg-red-600",
  };
}

function BreakdownChart({ chart }: { chart: ReleaseChartPayload }) {
  if (chart.kind === "qualitative") {
    return (
      <article className="border-t border-stone-200 py-6 first:border-0 first:pt-0 last:pb-0">
        <div>
          <h3 className="text-xl font-black text-stone-950">{chart.title}</h3>
          <p className="mt-1 text-xs font-semibold text-stone-500">Text themes from the official report, not measured scores</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {chart.points.map((point, index) => (
            <div key={`${chart.title}-${point.label}-${index}`} className="rounded-xl bg-stone-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-stone-900">{point.label}</p>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone-600">{point.display}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{point.plainEnglish}</p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  const max = Math.max(...chart.points.map((point) => Math.abs(point.value)), 1);

  return (
    <article className="border-t border-stone-200 py-6 first:border-0 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-xl font-black text-stone-950">{chart.title}</h3>
        <p className="text-xs font-semibold text-stone-500">Ranked official values</p>
      </div>
      <div className="mt-5 grid gap-4">
        {chart.points.map((point, index) => {
          const signal = signalFor(chart.title, point.direction);
          const Icon = signal.Icon;
          const width = Math.max(3, (Math.abs(point.value) / max) * 100);

          return (
            <div key={`${chart.title}-${point.label}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(150px,0.65fr)_minmax(220px,1.35fr)] sm:items-center sm:gap-5">
              <div className="flex min-w-0 items-center justify-between gap-3 sm:block">
                <p className="min-w-0 text-sm font-bold leading-5 text-stone-800">{point.label}</p>
                <p className="shrink-0 font-mono text-lg font-black text-stone-950 sm:mt-1">{point.display}</p>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
                    <div className={`h-full rounded-full ${signal.bar}`} style={{ width: `${width}%` }} />
                  </div>
                  <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${signal.className}`} title={signal.label}>
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{signal.label}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-stone-500">{point.plainEnglish}</p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function ReleaseVisualBreakdowns({ charts }: { charts: ReleaseChartPayload[] }) {
  const visualCharts = charts.filter((chart) => chart.kind !== "metric-strip" && chart.points.length > 1);
  if (!visualCharts.length) return null;
  const hasMeasuredCharts = visualCharts.some((chart) => chart.kind !== "qualitative");

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Visual evidence</p>
        <h2 className="mt-1 text-3xl font-black text-stone-950">
          {hasMeasuredCharts ? "See where the pressure is concentrated" : "What the official report discusses"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {hasMeasuredCharts
            ? "Arrow colours reflect whether the reported movement adds pressure or provides relief. Bar length compares the current values within each chart."
            : "Canada Pulse identifies recurring topics in the report text without converting qualitative language into invented numerical scores."}
        </p>
      </div>
      <div className="mt-7">
        {visualCharts.map((chart) => <BreakdownChart key={chart.title} chart={chart} />)}
      </div>
    </section>
  );
}
