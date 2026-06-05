import { Info } from "lucide-react";

export function TermTip({ term, children }: { term: string; children: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold text-stone-300"
      title={children}
    >
      <Info className="size-3.5 text-red-300" aria-hidden="true" />
      {term}
    </span>
  );
}

export function GlossaryStrip() {
  return (
    <div className="flex flex-wrap gap-2">
      <TermTip term="Rent burden">Share of gross income needed for rent.</TermTip>
      <TermTip term="Population pressure">Whether homes, jobs, healthcare, and infrastructure are absorbing growth.</TermTip>
      <TermTip term="Tax receipt">Modeled income tax plus consumption tax by province.</TermTip>
      <TermTip term="Pulse score">A simple composite score for national or provincial stress.</TermTip>
    </div>
  );
}
