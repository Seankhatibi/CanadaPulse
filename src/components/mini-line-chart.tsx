export function MiniLineChart({
  points,
  tone = "bg-red-600",
  showValues = false,
  showPercentChange = false,
  formatValue = (value) => value.toLocaleString(),
}: {
  points: Array<{ label: string; value: number }>;
  tone?: string;
  showValues?: boolean;
  showPercentChange?: boolean;
  formatValue?: (value: number) => string;
}) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const baseline = values[0] || 1;

  return (
    <div className="flex h-44 items-end gap-2 rounded-md border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-black/20">
      {points.map((point) => {
        const height = 18 + ((point.value - min) / spread) * 76;
        const percentChange = ((point.value - baseline) / baseline) * 100;
        const percentLabel =
          percentChange === 0 ? "base" : `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(1)}%`;

        return (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            {showValues ? (
              <span className="max-w-full truncate font-mono text-[10px] font-semibold text-stone-800 dark:text-stone-100 sm:text-xs">
                {formatValue(point.value)}
              </span>
            ) : null}
            {showPercentChange ? (
              <span
                className={`max-w-full truncate rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-semibold sm:text-[10px] ${
                  percentChange > 0
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                    : percentChange < 0
                      ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200"
                      : "border-stone-500/20 bg-stone-500/10 text-stone-600 dark:text-stone-300"
                }`}
                title={`${percentLabel} vs ${points[0]?.label ?? "baseline"}`}
              >
                {percentLabel}
              </span>
            ) : null}
            <div className="flex h-20 w-full items-end justify-center">
              <span className={`w-full max-w-8 rounded-t-md ${tone}`} style={{ height: `${height}%` }} />
            </div>
            <span className="font-mono text-[10px] text-stone-500">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
