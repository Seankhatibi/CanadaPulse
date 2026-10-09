import Link from "next/link";
import { lifeContext } from "@/lib/life-context";
import type { NormalizedRelease } from "@/lib/release-hub";

export function LifeContextPanel({ release }: { release: NormalizedRelease }) {
  const context = lifeContext(release);
  return <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-stone-950 sm:p-7">
    <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Daily-life context · Canada Pulse interpretation</p>
    <h2 className="mt-3 text-2xl font-bold">{context.title}</h2>
    <p className="mt-3 max-w-4xl leading-7">{context.impact}</p>
    <div className="mt-5 grid gap-5 sm:grid-cols-2"><div><h3 className="font-bold">Who experiences it differently?</h3><p className="mt-2 text-sm leading-6 text-stone-600">{context.different}</p></div><div><h3 className="font-bold">What this cannot tell us</h3><p className="mt-2 text-sm leading-6 text-stone-600">{context.limitation}</p></div></div>
    <Link href={context.href} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-teal-900 px-4 text-sm font-bold text-white">{context.action} →</Link>
  </section>;
}
