import type { HomepageVisualPoint } from "@/lib/homepage-feed";

const toneClasses = {
  red: "from-red-500 to-amber-400",
  amber: "from-amber-400 to-yellow-200",
  blue: "from-sky-400 to-blue-500",
  green: "from-emerald-400 to-lime-300",
  white: "from-white to-stone-300",
  violet: "from-violet-400 to-sky-400",
  cyan: "from-cyan-300 to-red-400",
};

export function MiniDataVisual({
  points,
  tone = "red",
  maxItems = 5,
  compact = false,
}: {
  points: HomepageVisualPoint[];
  tone?: keyof typeof toneClasses;
  maxItems?: number;
  compact?: boolean;
}) {
  const visiblePoints = points.slice(0, maxItems);
  const max = Math.max(...visiblePoints.map((point) => Math.abs(point.value)), 1);

  if (!visiblePoints.length) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-400">
        Breakdown is being prepared from the source data.
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {visiblePoints.map((point) => {
        const width = Math.max(14, Math.min(100, (Math.abs(point.value) / max) * 100));
        const isDown = point.direction === "down" || point.value < 0;

        return (
          <div key={`${point.label}-${point.display}`} className="min-w-0">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {point.label}
              </span>
              <span className="shrink-0 font-mono text-sm font-black text-white">{point.display}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${isDown ? "from-red-500 to-red-300" : toneClasses[tone]}`}
                style={{ width: `${width}%` }}
              />
            </div>
            {!compact && point.note ? <p className="mt-1 line-clamp-2 text-xs text-stone-500">{point.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
