import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { HomepageVisualPoint } from "@/lib/homepage-feed";

function meaningClasses(point: HomepageVisualPoint) {
  if (point.meaning === "good") {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-500",
      soft: "bg-emerald-100 text-emerald-900 border-emerald-200",
      gradient: "from-emerald-500 to-lime-400",
    };
  }

  if (point.meaning === "bad") {
    return {
      text: "text-red-700",
      bg: "bg-red-600",
      soft: "bg-red-100 text-red-900 border-red-200",
      gradient: "from-red-600 to-orange-400",
    };
  }

  return {
    text: "text-amber-700",
    bg: "bg-amber-400",
    soft: "bg-amber-100 text-amber-950 border-amber-200",
    gradient: "from-amber-400 to-yellow-300",
  };
}

function DirectionIcon({ point }: { point: HomepageVisualPoint }) {
  if (point.direction === "up") return <ArrowUp className="size-3.5" aria-hidden="true" />;
  if (point.direction === "down") return <ArrowDown className="size-3.5" aria-hidden="true" />;
  return <ArrowRight className="size-3.5" aria-hidden="true" />;
}

export function DirectionBarChart({
  points,
  maxItems = 5,
}: {
  points: HomepageVisualPoint[];
  maxItems?: number;
}) {
  const visible = points.slice(0, maxItems);
  const max = Math.max(...visible.map((point) => Math.abs(point.value)), 1);

  return (
    <div className="grid gap-3">
      {visible.map((point) => {
        const classes = meaningClasses(point);
        const width = Math.max(14, Math.min(100, (Math.abs(point.value) / max) * 100));

        return (
          <div key={`${point.label}-${point.display}`} className="min-w-0">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border ${classes.soft}`}>
                  <DirectionIcon point={point} />
                </span>
                <span className="truncate text-sm font-black text-stone-950">{point.label}</span>
              </div>
              <span className={`shrink-0 font-mono text-sm font-black ${classes.text}`}>{point.display}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-stone-200">
              <div className={`h-full rounded-full bg-gradient-to-r ${classes.gradient}`} style={{ width: `${width}%` }} />
            </div>
            {point.note ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">{point.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function SplitImpactChart({ points }: { points: HomepageVisualPoint[] }) {
  const visible = points.slice(0, 6);
  const max = Math.max(...visible.map((point) => Math.abs(point.value)), 1);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[11px] font-black uppercase tracking-[0.16em]">
        <span className="text-right text-red-700">Worse</span>
        <span className="rounded-full border border-stone-300 bg-stone-50 px-2 py-1 text-stone-700">impact</span>
        <span className="text-emerald-700">Better</span>
      </div>
      <div className="grid gap-2">
        {visible.map((point) => {
          const isBad = point.meaning === "bad";
          const width = `${Math.max(28, (Math.abs(point.value) / max) * 100)}%`;

          return (
            <div key={`${point.label}-${point.display}`} className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-2">
              <div className="min-w-0">
                {isBad ? (
                  <div className="ml-auto rounded-l-full bg-gradient-to-l from-red-500 to-red-700 px-3 py-2 text-right text-xs font-black text-white" style={{ width }}>
                    {point.label}
                  </div>
                ) : null}
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-950 px-2 py-1 text-center font-mono text-xs font-black text-white">
                {point.display}
              </div>
              <div className="min-w-0">
                {!isBad ? (
                  <div className="rounded-r-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-2 text-xs font-black text-stone-950" style={{ width }}>
                    {point.label}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProvinceRankChart({ points, maxItems = 6 }: { points: HomepageVisualPoint[]; maxItems?: number }) {
  const visible = points.slice(0, maxItems);
  const max = Math.max(...visible.map((point) => Math.abs(point.value)), 1);

  return (
    <div className="grid gap-2">
      {visible.map((point, index) => {
        const classes = meaningClasses(point);
        const width = Math.max(14, Math.min(100, (Math.abs(point.value) / max) * 100));

        return (
          <div key={`${point.label}-${point.display}`} className="rounded-md border border-stone-200 bg-white p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm font-black text-stone-950">
                <span className="mr-2 font-mono text-xs text-red-700">#{index + 1}</span>
                {point.label}
              </span>
              <span className={`shrink-0 font-mono text-sm font-black ${classes.text}`}>{point.display}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-200">
              <div className={`h-full rounded-full ${classes.bg}`} style={{ width: `${width}%` }} />
            </div>
            {point.note ? <p className="mt-1 truncate text-xs text-stone-500">{point.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function PressureMeter({ value, label, detail }: { value: number; label: string; detail: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const colour = clamped >= 72 ? "from-red-600 to-orange-400" : clamped >= 50 ? "from-amber-400 to-yellow-300" : "from-emerald-500 to-lime-400";

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{label}</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
        </div>
        <p className="font-mono text-5xl font-black text-stone-950">{clamped}</p>
      </div>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full bg-gradient-to-r ${colour}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function MoneyFlowBreakdown({
  points,
  total,
}: {
  points: Array<{ label: string; amount: number; share: number }>;
  total: number;
}) {
  return (
    <div className="grid gap-2">
      {points.slice(0, 5).map((point) => (
        <div key={point.label} className="rounded-md border border-stone-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-black text-stone-950">{point.label}</span>
            <span className="font-mono text-sm font-black text-emerald-700">${point.amount.toLocaleString("en-CA")}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${Math.min(100, point.share)}%` }} />
          </div>
        </div>
      ))}
      <p className="text-xs text-stone-500">Estimated from ${total.toLocaleString("en-CA")} modeled tax receipt.</p>
    </div>
  );
}
