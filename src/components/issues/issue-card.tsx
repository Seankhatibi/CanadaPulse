import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Issue } from "@/lib/issue-data";
import { ShareStatButton } from "@/components/share-stat-button";

export function IssueCard({ issue, featured = false }: { issue: Issue; featured?: boolean }) {
  const Icon = issue.icon;
  const topProvince = [...issue.provinceValues].sort((a, b) => b.numeric - a.numeric)[0];

  return (
    <article
      className={`group overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-red-400/50 hover:bg-white/[0.1] ${
        featured ? "md:col-span-2 xl:col-span-2" : ""
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${issue.tone}`} />
      <div className="p-5">
        <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
          <span className="grid size-11 place-items-center rounded-md bg-red-600 text-white">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex w-fit items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 font-mono text-sm font-semibold text-stone-950">
              {issue.nationalValue}
            </span>
            <ShareStatButton text={`${issue.title}: ${issue.nationalValue}. ${issue.question}`} />
          </div>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-red-300">
          {issue.title}
        </p>
        <Link href={`/issue/${issue.slug}`} className="block">
          <h2 className="mt-2 text-xl font-semibold text-white">{issue.question}</h2>
        </Link>
        <p className="mt-2 text-sm leading-6 text-stone-400">{issue.movement}</p>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          What this means: start with the national number, then check whether your province is above or below the
          pressure line.
        </p>

        <div className="mt-5 rounded-md border border-white/10 bg-black/30 p-3">
          <div className="flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-3">
            <span className="text-xs text-stone-500">Highest visible pressure</span>
            <span className="font-mono text-sm text-white">{topProvince.abbr}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">
            {topProvince.province}: {topProvince.value}
          </p>
        </div>

        <Link href={`/issue/${issue.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
          Compare provinces
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
